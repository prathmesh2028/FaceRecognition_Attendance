const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Student = require("./models/Student");
const Attendance = require("./models/Attendance");

dotenv.config();

// Connect to MongoDB
connectDB();

let visionRoutes;
try {
    visionRoutes = require("./routes/visionRoute");
} catch (error) {
    // console.warn("⚠️ Vision Routes not loaded (service-account.json missing).");
}

const app = express();

// ✅ FIXED CORS
app.use(cors({
    origin: ["https://face-recognition-attendance-duui.vercel.app", "http://localhost:3000"],
    credentials: true
}));

// JSON parser
app.use(express.json());

// Routes
if (visionRoutes) {
    app.use("/api/vision", visionRoutes);
}

// Register User (Store Name + Face Descriptor)
app.post("/api/register", async (req, res) => {
    console.log("📥 Registration Request Received:", req.body.name, req.body.rollNo);
    try {
        const { name, rollNo, descriptor } = req.body;
        if (!name || !rollNo || !descriptor) {
            console.log("❌ Missing Data:", { name, rollNo, descriptor: descriptor ? "Present" : "Missing" });
            return res.status(400).json({ success: false, msg: "Name, Roll No, and face data required" });
        }

        const existing = await Student.findOne({ roll_no: rollNo });
        if (existing) {
            return res.status(400).json({ success: false, msg: "Roll Number already registered" });
        }

        const newStudent = await Student.create({
            name,
            roll_no: rollNo,
            face_descriptor: descriptor
        });

        console.log(`✅ Registered: ${name} (${rollNo})`);
        res.json({ success: true, student: { rollNo, name } });

    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ success: false, msg: "Server error" });
    }
});

// Mark Attendance (Compare Face)
app.post("/api/mark-attendance", async (req, res) => {
    try {
        const { descriptor } = req.body;
        if (!descriptor) return res.status(400).json({ success: false, msg: "No face data provided" });

        const students = await Student.find({});
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

            // Check if already marked in last 30 mins
            const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

            const recent = await Attendance.findOne({
                roll_no: bestMatch.roll_no,
                timestamp: { $gt: thirtyMinsAgo }
            });

            if (recent) {
                return res.json({
                    success: true,
                    match: bestMatch,
                    msg: "Attendance already marked recently",
                    alreadyMarked: true
                });
            }

            // Mark Attendance
            await Attendance.create({
                name: bestMatch.name,
                roll_no: bestMatch.roll_no,
                timestamp: new Date()
            });

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
app.delete("/api/attendance-history", async (req, res) => {
    try {
        await Attendance.deleteMany({});
        res.json({ success: true, msg: "History cleared" });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Error clearing history" });
    }
});

// Get Attendance History
app.get("/api/attendance-history", async (req, res) => {
    try {
        const history = await Attendance.find({}).sort({ timestamp: -1 });
        const formatted = history.map(r => ({
            name: r.name,
            rollNo: r.roll_no,
            timestamp: r.timestamp
        }));
        res.json({ success: true, history: formatted });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Error fetching history" });
    }
});

// Get All Students
app.get("/api/students", async (req, res) => {
    try {
        const students = await Student.find({}).sort({ registered_at: -1 });
        const formatted = students.map(s => ({
            id: s.roll_no,
            name: s.name,
            rollNo: s.roll_no,
            registeredAt: s.registered_at
        }));
        res.json({ success: true, students: formatted });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Error fetching students" });
    }
});

// Delete Student
app.delete("/api/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Student.findOneAndDelete({ roll_no: id });

        if (!deleted) {
            return res.status(404).json({ success: false, msg: "Student not found" });
        }
        res.json({ success: true, msg: "Student deleted" });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Error deleting student" });
    }
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`);
    });
});
