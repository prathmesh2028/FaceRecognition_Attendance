const express = require("express");
const multer = require("multer");
const path = require("path");
const vision = require("@google-cloud/vision");
const fs = require('fs');

const router = express.Router();

// Google Vision Client
let client;
try {
  client = new vision.ImageAnnotatorClient({
    keyFilename: path.join(__dirname, "..", "service-account.json"),
  });
} catch (err) {
  // console.warn("Vision API not initialized");
}

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
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

module.exports = router;
