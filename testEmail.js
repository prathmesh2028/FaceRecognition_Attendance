require('dotenv').config({ path: './backend/.env' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTP = async (email, otp) => {
    try {
        console.log("Attempting to send email from:", process.env.EMAIL_USER);
        await transporter.sendMail({
            from: `"Face Recognition Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Account OTP Code",
            html: `<h1>${otp}</h1>`
        });
        console.log(`OTP sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

sendOTP('badheprathmesh2@gmail.com', '123456');
