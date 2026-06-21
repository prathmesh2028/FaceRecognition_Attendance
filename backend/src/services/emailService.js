const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTP = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: `"Face Recognition Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Account OTP Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333;">Authentication Required</h2>
                    <p>You have requested an OTP for your account.</p>
                    <h1 style="color: #4F46E5; letter-spacing: 2px;">${otp}</h1>
                    <p>This code will expire in <strong>10 minutes</strong>.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email and secure your account.</p>
                </div>
            `
        });
        console.log(`OTP sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Could not send email");
    }
};

const sendAccessRequestNotification = async (requestData) => {
    try {
        await transporter.sendMail({
            from: `"Face Recognition Security" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Super Admin
            subject: "New Admin Access Request",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333;">New Admin Access Request</h2>
                    <p>A new faculty member has requested admin access.</p>
                    <table style="width: 100%; text-align: left; border-collapse: collapse;">
                        <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Name:</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${requestData.name}</td></tr>
                        <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Email:</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${requestData.email}</td></tr>
                        <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Department:</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${requestData.department}</td></tr>
                        <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Designation:</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${requestData.designation}</td></tr>
                        <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Reason:</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${requestData.reason}</td></tr>
                    </table>
                    <p style="margin-top: 20px;">Please login to the Super Admin Dashboard to approve or reject this request.</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Error sending access request notification:", error);
    }
};

const sendRequestApproved = async (email, name) => {
    try {
        await transporter.sendMail({
            from: `"Face Recognition Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Admin Access Request Approved",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #10B981;">Access Approved</h2>
                    <p>Dear ${name},</p>
                    <p>Your request for admin access has been <strong>approved</strong> by the Super Admin.</p>
                    <p>You can now log in using your registered email and password.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">Face Recognition Attendance System</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Error sending approval email:", error);
    }
};

const sendRequestRejected = async (email, name) => {
    try {
        await transporter.sendMail({
            from: `"Face Recognition Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Admin Access Request Update",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #EF4444;">Access Request Update</h2>
                    <p>Dear ${name},</p>
                    <p>We regret to inform you that your request for admin access has been <strong>declined</strong> at this time.</p>
                    <p>If you believe this is an error or require further clarification, please contact the administration directly.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">Face Recognition Attendance System</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Error sending rejection email:", error);
    }
};

const sendAccountSuspended = async (email, name) => {
    try {
        console.log(`[EMAIL_DEBUG] Attempting to send suspension email to ${email}...`);
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("[EMAIL_DEBUG] CRITICAL ERROR: EMAIL_USER or EMAIL_PASS is undefined in Render Environment Variables!");
        }
        
        await transporter.sendMail({
            from: `"Face Recognition Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Account Suspended",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #EF4444;">Account Suspended</h2>
                    <p>Dear ${name},</p>
                    <p>Your admin account has been <strong>suspended</strong> by the Super Admin.</p>
                    <p>You will not be able to log in until your account is reactivated.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">Face Recognition Attendance System</p>
                </div>
            `
        });
        console.log(`[EMAIL_DEBUG] Successfully sent suspension email to ${email}`);
    } catch (error) {
        console.error("[EMAIL_DEBUG] Error sending suspension email. FULL DETAILS:", error);
    }
};

const sendAccountReactivated = async (email, name) => {
    try {
        console.log(`[EMAIL_DEBUG] Attempting to send reactivation email to ${email}...`);
        await transporter.sendMail({
            from: `"Face Recognition Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Account Reactivated",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #10B981;">Account Reactivated</h2>
                    <p>Dear ${name},</p>
                    <p>Your admin account has been <strong>reactivated</strong> by the Super Admin.</p>
                    <p>You can now log in and access the dashboard again.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">Face Recognition Attendance System</p>
                </div>
            `
        });
        console.log(`[EMAIL_DEBUG] Successfully sent reactivation email to ${email}`);
    } catch (error) {
        console.error("[EMAIL_DEBUG] Error sending reactivation email:", error);
    }
};

const sendAccountDeleted = async (email, name) => {
    try {
        await transporter.sendMail({
            from: `"Face Recognition Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Account Deleted",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #EF4444;">Account Deleted</h2>
                    <p>Dear ${name},</p>
                    <p>Your admin account has been <strong>permanently deleted</strong> by the Super Admin.</p>
                    <p>Your access has been completely revoked.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">Face Recognition Attendance System</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Error sending deletion email:", error);
    }
};

const sendAccessRequestReceived = async (email, name) => {
    try {
        await transporter.sendMail({
            from: `"Face Recognition Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Access Request Received",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #3B82F6;">Request Received</h2>
                    <p>Dear ${name},</p>
                    <p>We have successfully received your request for admin access.</p>
                    <p>Your request is currently <strong>pending review</strong> by the Super Admin. You will receive another email once a decision has been made.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">Face Recognition Attendance System</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Error sending request receipt email:", error);
    }
};

module.exports = { 
    sendOTP, 
    sendAccessRequestNotification, 
    sendRequestApproved, 
    sendRequestRejected,
    sendAccountSuspended,
    sendAccountReactivated,
    sendAccountDeleted,
    sendAccessRequestReceived
};
