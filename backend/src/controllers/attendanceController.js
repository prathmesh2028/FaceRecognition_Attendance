const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// @desc    Mark Attendance (Compare Face)
// @route   POST /api/attendance/mark
// @access  Private (Admin, Super Admin)
exports.markAttendance = async (req, res) => {
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
};

// @desc    Get Attendance History
// @route   GET /api/attendance
// @access  Private (Admin, Super Admin)
exports.getAttendanceHistory = async (req, res) => {
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
};

// @desc    Clear Attendance History
// @route   DELETE /api/attendance
// @access  Private (Super Admin)
exports.clearAttendanceHistory = async (req, res) => {
    try {
        await Attendance.deleteMany({});
        res.json({ success: true, msg: "History cleared" });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Error clearing history" });
    }
};
