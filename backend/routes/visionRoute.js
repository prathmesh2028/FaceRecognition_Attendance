const express = require("express");
const multer = require("multer");
const path = require("path");
const vision = require("@google-cloud/vision");
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


// Routes above...

module.exports = router;
