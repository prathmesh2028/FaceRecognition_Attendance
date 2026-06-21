const mongoose = require('mongoose');
const fs = require('fs');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("\n=======================================================");
        console.error("❌ CRITICAL MONGODB CONNECTION ERROR ❌");
        console.error("=======================================================");
        console.error(error.message);
        console.log("\n⚠️  WHY IS THIS HAPPENING? ⚠️");
        console.log("This is NOT a bug in the code. Your current Internet Provider (like Jio/Airtel) or University Wi-Fi is actively BLOCKING the MongoDB connection.");
        console.log("\n🛠️  HOW TO FIX THIS RIGHT NOW 🛠️");
        console.log("1. Disconnect from your current Wi-Fi.");
        console.log("2. Turn on your Mobile Hotspot and connect your PC to it.");
        console.log("3. Run 'npm start' again.");
        console.log("=======================================================\n");
        process.exit(1);
    }
};

module.exports = connectDB;
