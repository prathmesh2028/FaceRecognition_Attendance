const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const auditRoutes = require("./routes/auditRoutes");

const app = express();
app.set("trust proxy", 1); // Fixes express-rate-limit ValidationError on Render

// Security Middlewares
app.use(helmet());

const allowedOrigins = [
    "http://localhost:3000",
    "https://face-recognition-attendance-duui.vercel.app"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
            return callback(null, true);
        } else {
            console.log("❌ Blocked by CORS:", origin);
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Rate Limiting (apply to all requests or just auth)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window`
    message: "Too many requests from this IP, please try again later."
});
app.use("/api/", limiter);

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/audit", auditRoutes);

// Optional Vision Routes
let visionRoutes;
try {
    visionRoutes = require("../../routes/visionRoute"); // Left fallback if exists
    app.use("/api/vision", visionRoutes);
} catch (error) {
}

// Error Handling Middleware (fallback)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, msg: 'Server Error' });
});

module.exports = app;
