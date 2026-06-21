const Student = require('../models/Student');

// @desc    Register a new student
// @route   POST /api/register (moving to /api/students/register)
// @access  Private (Admin, Super Admin)
exports.registerStudent = async (req, res) => {
    console.log("📥 Registration Request Received:", req.body.name, req.body.rollNo);
    try {
        const { name, rollNo, descriptor } = req.body;
        if (!name || !rollNo || !descriptor) {
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
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Super Admin)
exports.getStudents = async (req, res) => {
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
        console.error("Fetch Students Error:", err);
        res.status(500).json({ success: false, msg: "Error fetching students" });
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private (Super Admin)
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Student.findOneAndDelete({ roll_no: id });

        if (!deleted) {
            return res.status(404).json({ success: false, msg: "Student not found" });
        }
        res.json({ success: true, msg: "Student deleted" });
    } catch (err) {
        console.error("Delete Student Error:", err);
        res.status(500).json({ success: false, msg: "Error deleting student" });
    }
};
