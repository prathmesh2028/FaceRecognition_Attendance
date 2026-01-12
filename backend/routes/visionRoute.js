const express = require("express");
const multer = require("multer");
const path = require("path");
const vision = require("@google-cloud/vision");
const db = require("../config/db");  // ✅ Added MySQL connection

const router = express.Router();

// Google Vision Client
// Google Vision Client
let client;
try {
  client = new vision.ImageAnnotatorClient({
    keyFilename: path.join(__dirname, "..", "service-account.json"),
  });
} catch (err) {
  console.warn("⚠️ Google Vision Client could not be initialized (missing service-account.json?)");
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Test route
router.get("/test", (req, res) => {
  res.send("Vision API backend working!");
});


// ----------------------------------------------------------
// ✅ REGISTER STUDENT (MySQL)
// ----------------------------------------------------------
router.post("/register-student", (req, res) => {
  const { name, roll_no, face_id } = req.body;

  if (!name || !roll_no || !face_id) {
    return res.status(400).json({ msg: "Missing student data" });
  }

  const query = "INSERT INTO students (name, roll_no, face_id) VALUES (?, ?, ?)";

  db.query(query, [name, roll_no, face_id], (err, result) => {
    if (err) return res.status(500).json({ msg: "DB Insert Error", error: err });

    res.json({ msg: "Student Registered Successfully", data: result });
  });
});


// ----------------------------------------------------------
// ✅ MARK ATTENDANCE (MySQL)
// ----------------------------------------------------------
router.post("/mark-attendance", (req, res) => {
  const { student_id, status } = req.body;

  if (!student_id || !status) {
    return res.status(400).json({ msg: "Missing attendance data" });
  }

  const query = "INSERT INTO attendance (student_id, status) VALUES (?, ?)";

  db.query(query, [student_id, status], (err, result) => {
    if (err) return res.status(500).json({ msg: "DB Error", error: err });

    res.json({ msg: "Attendance Marked Successfully", data: result });
  });
});


// ----------------------------------------------------------
// ✅ FACE DETECTION ROUTE (YOUR ORIGINAL CODE + STABLE)
// ----------------------------------------------------------
router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    console.log("FILE RECEIVED:", req.file);

    if (!req.file) {
      console.log("❌ No file received!");
      return res.status(400).json({ success: false, msg: "No file uploaded" });
    }

    const imagePath = path.join(__dirname, "..", req.file.path);
    console.log("IMAGE PATH:", imagePath);

    if (!client) {
      console.warn("❌ Vision API not initialized");
      return res.status(500).json({ success: false, msg: "Vision API unavailable (Service Account missing)" });
    }

    const [result] = await client.faceDetection(imagePath);

    console.log("VISION RESULT:", result);

    const faces = result.faceAnnotations;

    // Later we will auto-identify student using face_id
    return res.json({ success: true, faces });

  } catch (err) {
    console.log("❌ BACKEND ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
