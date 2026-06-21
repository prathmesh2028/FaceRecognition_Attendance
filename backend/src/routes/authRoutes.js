const express = require('express');
const router = express.Router();
const { loginAdmin, logoutAdmin, changePassword, getAdminProfile, forgotPassword, verifyOTP, resetPassword, refreshAccessToken, requestAccess } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateResource');
const { loginSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema, changePasswordSchema, requestAccessSchema } = require('../utils/validationSchemas');

router.post('/request-access', validate(requestAccessSchema), requestAccess);
router.post('/login', validate(loginSchema), loginAdmin);
router.post('/refresh', refreshAccessToken);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOTP);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/change-password', protect, validate(changePasswordSchema), changePassword);
router.post('/logout', protect, logoutAdmin);
router.get('/profile', protect, getAdminProfile);

module.exports = router;
