const jsonDb = require('./config/jsonDb');
const express = require("express");
const cors = require("cors");
const path = require("path");
let visionRoutes;
try {
    visionRoutes = require("./routes/visionRoute");
} catch (error) {
    // console.warn("⚠️ Vision Routes not loaded (service-account.json missing).");
}

const app = express();

app.use(cors());
app.use(express.json());

// Routes
if (visionRoutes) {
    app.use("/api/vision", visionRoutes);
}

// Register User (Store Name + Face Descriptor)
app.post("/api/register", (req, res) => {
    console.log("📥 Registration Request Received:", req.body.name, req.body.rollNo);
    try {
        const { name, rollNo, descriptor } = req.body;
        if (!name || !rollNo || !descriptor) {
            console.log("❌ Missing Data:", { name, rollNo, descriptor: descriptor ? "Present" : "Missing" });
            return res.status(400).json({ success: false, msg: "Name, Roll No, and face data required" });
        }

        const existing = jsonDb.findStudentByRollNo(rollNo);
        if (existing) {
            return res.status(400).json({ success: false, msg: "Roll Number already registered" });
        }

        const newStudent = {
            name,
            roll_no: rollNo,
            face_descriptor: descriptor, // Store as array directly in JSON
            registered_at: new Date().toISOString()
        };

        jsonDb.addStudent(newStudent);
        console.log(`✅ Registered: ${name} (${rollNo})`);
        res.json({ success: true, student: { rollNo, name } });

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

        const students = jsonDb.getStudents();
        let bestMatch = null;
        let minDistance = 0.6; // Threshold

        console.log(`Checking against ${students.length} registered students...`);

        students.forEach(student => {
            const storedDesc = student.face_descriptor;
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

            // Check recently marked (last 30 mins)
            const attendance = jsonDb.getAttendance();
            const thirtyMinsAgo = Date.now() - 30 * 60 * 1000;

            const recent = attendance.find(r =>
                r.roll_no === bestMatch.roll_no &&
                new Date(r.timestamp).getTime() > thirtyMinsAgo
            );

            if (recent) {
                return res.json({
                    success: true,
                    match: bestMatch,
                    msg: "Attendance already marked recently",
                    alreadyMarked: true
                });
            }

            // Mark Attendance
            const record = {
                name: bestMatch.name,
                roll_no: bestMatch.roll_no,
                timestamp: new Date().toISOString()
            };
            jsonDb.addAttendance(record);

            return res.json({
                success: true,
                match: { name: bestMatch.name, rollNo: bestMatch.roll_no }
            });

        } else {
            return res.json({ success: false, msg: "Face not recognized" });
        }

    } catch (err) {
        console.error("Attendance Error:", err);
        res.status(500).json({ success: false, msg: "Server error" });
    }
});

// Clear Attendance History
app.delete("/api/attendance-history", (req, res) => {
    jsonDb.clearAttendance();
    res.json({ success: true, msg: "History cleared" });
});

// Get Attendance History
app.get("/api/attendance-history", (req, res) => {
    const history = jsonDb.getAttendance().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    // Map to format frontend expects
    const formatted = history.map(r => ({
        name: r.name,
        rollNo: r.roll_no,
        timestamp: r.timestamp
    }));
    res.json({ success: true, history: formatted });
});

// Get All Students
app.get("/api/students", (req, res) => {
    const students = jsonDb.getStudents().sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at));
    const formatted = students.map(s => ({
        id: s.roll_no,
        name: s.name,
        rollNo: s.roll_no,
        registeredAt: s.registered_at
    }));
    res.json({ success: true, students: formatted });
});

// Delete Student
app.delete("/api/students/:id", (req, res) => {
    const { id } = req.params; // roll_no
    const deleted = jsonDb.deleteStudent(id);
    if (!deleted) {
        return res.status(404).json({ success: false, msg: "Student not found" });
    }
    res.json({ success: true, msg: "Student deleted" });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, 'build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`);
    });
}

module.exports = app;
