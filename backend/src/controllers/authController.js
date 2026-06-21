const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const AdminRequest = require('../models/AdminRequest');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const { sendOTP, sendAccessRequestNotification } = require('../services/emailService');
const { logAction } = require('../services/auditService');
const crypto = require('crypto');

const generateOtpCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Auth user & get token
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ success: false, msg: 'Invalid email or password' });
        }

        if (admin.status === 'DISABLED') {
            return res.status(403).json({ success: false, msg: 'Account disabled by Super Admin' });
        }

        if (admin.isLocked()) {
            return res.status(423).json({ success: false, msg: 'Account is locked due to too many failed attempts. Try again later.' });
        }

        if (await admin.matchPassword(password)) {
            await admin.resetLoginAttempts();
            await logAction('LOGIN', admin._id, null, { email }, req.ip);

            const accessToken = generateToken(admin._id);
            const refreshToken = generateRefreshToken(admin._id);

            admin.refreshToken = refreshToken;
            await admin.save();

            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({
                success: true,
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                token: accessToken
            });
        } else {
            await admin.incrementLoginAttempts();
            const remaining = 5 - admin.loginAttempts;
            if (admin.isLocked()) {
                await logAction('ACCOUNT_LOCKED', admin._id, null, { email }, req.ip);
                return res.status(423).json({ success: false, msg: 'Account locked for 15 minutes.' });
            }
            res.status(401).json({ success: false, msg: `Invalid email or password. ${remaining} attempts remaining.` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

// @desc    Generate OTP for Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            // Return success anyway to prevent email enumeration
            return res.json({ success: true, msg: 'If the email exists, an OTP has been sent.' });
        }

        const otp = generateOtpCode();
        admin.otp = otp;
        admin.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
        await admin.save();

        await sendOTP(admin.email, otp);
        await logAction('OTP_REQUESTED', admin._id, null, { reason: 'forgot_password' }, req.ip);

        res.json({ success: true, msg: 'OTP sent to your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Error sending OTP' });
    }
};

// @desc    Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin || admin.otp !== otp || admin.otpExpiry < Date.now()) {
            return res.status(400).json({ success: false, msg: 'Invalid or expired OTP' });
        }

        // Just verify it's correct so the frontend can move to reset screen
        res.json({ success: true, msg: 'OTP verified successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

// @desc    Reset Password with OTP
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin || admin.otp !== otp || admin.otpExpiry < Date.now()) {
            return res.status(400).json({ success: false, msg: 'Invalid or expired OTP' });
        }

        admin.password = newPassword;
        admin.otp = undefined;
        admin.otpExpiry = undefined;
        await admin.save();

        await logAction('PASSWORD_RESET', admin._id, null, null, req.ip);

        res.json({ success: true, msg: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

// @desc    Change Password for logged-in user
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.admin._id);

        if (!admin || !(await admin.matchPassword(currentPassword))) {
            return res.status(401).json({ success: false, msg: 'Invalid current password' });
        }

        admin.password = newPassword;
        await admin.save();

        await logAction('PASSWORD_CHANGED', admin._id, null, null, req.ip);

        res.json({ success: true, msg: 'Password changed successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

// @desc    Logout admin
exports.logoutAdmin = async (req, res) => {
    const admin = await Admin.findById(req.admin._id);
    if (admin) {
        admin.refreshToken = undefined;
        await admin.save();
    }
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    await logAction('LOGOUT', req.admin._id, null, null, req.ip);
    res.json({ success: true, msg: 'Logged out successfully' });
};

// @desc    Refresh Access Token
exports.refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.jwt;
        if (!refreshToken) return res.status(401).json({ success: false, msg: 'Not authorized, no refresh token' });

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
        const admin = await Admin.findById(decoded.id);

        if (!admin || admin.refreshToken !== refreshToken || admin.status !== 'ACTIVE') {
            return res.status(403).json({ success: false, msg: 'Invalid refresh token' });
        }

        const newAccessToken = generateToken(admin._id);
        res.json({ success: true, token: newAccessToken });
    } catch (error) {
        res.status(403).json({ success: false, msg: 'Invalid refresh token' });
    }
};

// @desc    Get admin profile
exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id).select('-password -otp -otpExpiry -lockUntil -refreshToken');
        if (!admin) {
            return res.status(404).json({ success: false, msg: 'Admin not found' });
        }
        res.json({ success: true, admin });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

// @desc    Submit Admin Access Request
exports.requestAccess = async (req, res) => {
    try {
        const { name, email, phone, department, designation, reason, password } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) return res.status(400).json({ success: false, msg: 'Email is already registered' });

        const existingRequest = await AdminRequest.findOne({ email });
        if (existingRequest) return res.status(400).json({ success: false, msg: 'An access request for this email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const requestData = {
            name, email, phone, department, designation, reason, password: hashedPassword
        };

        await AdminRequest.create(requestData);
        await sendAccessRequestNotification(requestData);

        res.status(201).json({ success: true, msg: 'Access request submitted successfully. Super Admin will review your request.' });
    } catch (error) {
        console.error("Access Request Error:", error);
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};
