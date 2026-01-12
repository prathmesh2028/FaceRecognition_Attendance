const db = require('./config/db');
const express = require("express");
const cors = require("cors");
const path = require("path");
const visionRoutes = require("./routes/visionRoute");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/vision", visionRoutes);

// Register User (Store Name + Face Descriptor)
app.post("/api/register", (req, res) => {
    try {
        const { name, rollNo, descriptor } = req.body;
        if (!name || !rollNo || !descriptor) return res.status(400).json({ success: false, msg: "Name, Roll No, and face data required" });

        const query = "INSERT INTO students (roll_no, name, face_descriptor) VALUES (?, ?, ?)";
        const faceData = JSON.stringify(descriptor); // Store descriptor as JSON string

        db.query(query, [rollNo, name, faceData], (err, result) => {
            if (err) {
                console.error("DB Insert Error:", err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, msg: "Roll Number already registered" });
                }
                return res.status(500).json({ success: false, msg: "Database error" });
            }
            res.json({ success: true, student: { rollNo, name } });
        });

    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ success: false, msg: "Server error" });
    }
});

// Mark Attendance (Compare Face)
app.post("/api/mark-attendance", (req, res) => {
    try {
        const { descriptor } = req.body;
        if (!descriptor) return res.status(400).json({ success: false, msg: "No face data provided" });

        // Fetch all students to match face
        db.query("SELECT * FROM students", (err, students) => {
            if (err) {
                console.error("DB Fetch Error:", err);
                return res.status(500).json({ success: false, msg: "Database error" });
            }

            let bestMatch = null;
            let minDistance = 0.6; // Threshold

            // DEBUG: Log how many students we are comparing against
            console.log(`Checking against ${students.length} registered students...`);

            students.forEach(student => {
                // Parse descriptor from JSON
                const storedDesc = typeof student.face_descriptor === 'string'
                    ? JSON.parse(student.face_descriptor)
                    : student.face_descriptor;

                if (!storedDesc) return;

                const distance = Math.sqrt(
                    descriptor.reduce((sum, val, i) => sum + Math.pow(val - storedDesc[i], 2), 0)
                );

                console.log(`Comparing with ${student.name}: Distance = ${distance}`);

                if (distance < minDistance) {
                    minDistance = distance;
                    bestMatch = student;
                }
            });

            if (bestMatch) {
                console.log(`✅ MATCH FOUND: ${bestMatch.name} (Distance: ${minDistance})`);
                // Check within last 30 mins using Roll No
                const checkQuery = `
                    SELECT * FROM attendance
                    WHERE roll_no = ?
                    AND timestamp > (NOW() - INTERVAL 30 MINUTE)
                `;

                db.query(checkQuery, [bestMatch.roll_no], (err, results) => {
                    if (err) return res.status(500).json({ success: false, msg: "DB Error" });

                    if (results.length > 0) {
                        return res.json({
                            success: true,
                            match: bestMatch,
                            msg: "Attendance already marked recently",
                            alreadyMarked: true
                        });
                    }

                    // Insert Attendance with Name and Roll No directly
                    const insertQuery = "INSERT INTO attendance (name, roll_no) VALUES (?, ?)";
                    db.query(insertQuery, [bestMatch.name, bestMatch.roll_no], (err) => {
                        if (err) return res.status(500).json({ success: false, msg: "DB Insert Error" });

                        return res.json({
                            success: true,
                            match: { name: bestMatch.name, rollNo: bestMatch.roll_no }
                        });
                    });
                });

            } else {
                return res.json({ success: false, msg: "Face not recognized" });
            }
        });

    } catch (err) {
        console.error("Attendance Error:", err);
        res.status(500).json({ success: false, msg: "Server error" });
    }
});

// Clear Attendance History
app.delete("/api/attendance-history", (req, res) => {
    db.query("TRUNCATE TABLE attendance", (err) => {
        if (err) {
            console.error("Clear History Error:", err);
            return res.status(500).json({ success: false, msg: "Database error" });
        }
        res.json({ success: true, msg: "History cleared" });
    });
});

// Get Attendance History
app.get("/api/attendance-history", (req, res) => {
    const query = `
        SELECT id, timestamp, name, roll_no 
        FROM attendance 
        ORDER BY timestamp DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error("History Error:", err);
            return res.status(500).json({ success: false, msg: "Database error" });
        }
        // Map to format frontend expects
        const history = results.map(r => ({
            name: r.name,
            rollNo: r.roll_no,
            timestamp: r.timestamp
        }));
        res.json({ success: true, history });
    });
});

// Get All Students
app.get("/api/students", (req, res) => {
    db.query("SELECT name, roll_no, registered_at FROM students ORDER BY registered_at DESC", (err, results) => {
        if (err) {
            console.error("Fetch Students Error:", err);
            return res.status(500).json({ success: false, msg: "Database error" });
        }
        const students = results.map(s => ({
            id: s.roll_no, // Use roll_no as ID for frontend
            name: s.name,
            rollNo: s.roll_no,
            registeredAt: s.registered_at
        }));
        res.json({ success: true, students });
    });
});

// Delete Student
app.delete("/api/students/:id", (req, res) => {
    const { id } = req.params; // here id is roll_no
    db.query("DELETE FROM students WHERE roll_no = ?", [id], (err, result) => {
        if (err) {
            console.error("Delete Student Error:", err);
            return res.status(500).json({ success: false, msg: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, msg: "Student not found" });
        }
        res.json({ success: true, msg: "Student deleted" });
    });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
