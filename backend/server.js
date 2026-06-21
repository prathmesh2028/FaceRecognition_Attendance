const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./src/config/db");
const app = require("./src/app");
const Admin = require("./src/models/Admin");

const seedAdmin = async () => {
    try {
        const adminExists = await Admin.findOne({ email: 'ggdvoiceattendance@gmail.com' });
        if (!adminExists) {
            await Admin.create({
                name: 'GGDVOICE',
                email: 'ggdvoiceattendance@gmail.com',
                password: 'ggd@pune',
                role: 'SUPER_ADMIN',
                status: 'ACTIVE',
                isVerified: true
            });
            console.log('✅ Default Super Admin (ggdvoiceattendance@gmail.com) created successfully.');
        } else {
            console.log('⚡ Default Admin already exists.');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

// Connect to MongoDB
connectDB().then(async () => {
    // Seed the default admin before starting the server
    await seedAdmin();
    
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`);
    });

    server.on('error', (err) => {
        const fs = require('fs');
        fs.writeFileSync('server_error.log', `Error starting server: ${err.message}\n${err.stack}`);
        console.error('Server error:', err);
    });
});
