const { z } = require('zod');

// Password complexity: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const loginSchema = z.object({
    body: z.object({
        email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
        password: z.string({ required_error: "Password is required" }).min(1, "Password cannot be empty")
    })
});

const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string({ required_error: "Email is required" }).email("Invalid email address")
    })
});

const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
        otp: z.string({ required_error: "OTP is required" }).length(6, "OTP must be 6 digits")
    })
});

const resetPasswordSchema = z.object({
    body: z.object({
        email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
        otp: z.string({ required_error: "OTP is required" }).length(6, "OTP must be 6 digits"),
        newPassword: z.string({ required_error: "New password is required" })
            .regex(passwordRegex, "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character")
    })
});

const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string({ required_error: "Current password is required" }),
        newPassword: z.string({ required_error: "New password is required" })
            .regex(passwordRegex, "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character")
    })
});

const createAdminSchema = z.object({
    body: z.object({
        name: z.string({ required_error: "Name is required" }).min(2, "Name too short"),
        email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
        password: z.string({ required_error: "Password is required" })
            .regex(passwordRegex, "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"),
        role: z.enum(['SUPER_ADMIN', 'ADMIN']).optional()
    })
});

const requestAccessSchema = z.object({
    body: z.object({
        name: z.string({ required_error: "Name is required" }).min(2, "Name too short"),
        email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
        phone: z.string({ required_error: "Phone is required" }).min(10, "Phone number too short"),
        department: z.string({ required_error: "Department is required" }),
        designation: z.string({ required_error: "Designation is required" }),
        reason: z.string({ required_error: "Reason is required" }).min(10, "Reason must be at least 10 characters long"),
        password: z.string({ required_error: "Password is required" })
            .regex(passwordRegex, "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character")
    })
});

module.exports = {
    loginSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema,
    changePasswordSchema,
    createAdminSchema,
    requestAccessSchema
};
