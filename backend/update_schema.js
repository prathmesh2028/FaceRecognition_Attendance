const db = require('./config/db');

const updateSchema = async () => {
    console.log("⚙️  Updating Database Schema...");

    // 1. Drop existing attendance table
    db.query("DROP TABLE IF EXISTS attendance", (err) => {
        if (err) console.error("Error dropping attendance:", err);
        else console.log("✅ Dropped old attendance table");
    });

    // 2. Create new attendance table with Name and Roll No directly
    const createAttendance = `
        CREATE TABLE attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            roll_no VARCHAR(50) NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Wait 1s and create
    setTimeout(() => {
        db.query(createAttendance, (err) => {
            if (err) console.error("Error creating attendance table:", err);
            else console.log("✅ Created attendance table (with Name & Roll No)");

            console.log("🚀 Schema Update Complete!");
            db.end();
        });
    }, 1000);
};

updateSchema();
