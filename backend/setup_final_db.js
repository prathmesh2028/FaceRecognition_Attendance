const db = require('./config/db');

const setupFinalSchema = async () => {
    console.log("⚠️  Setting up Final Schema (PK: Roll No)...");

    // 1. Drop tables
    const dropAttendance = "DROP TABLE IF EXISTS attendance";
    const dropStudents = "DROP TABLE IF EXISTS students";

    db.query(dropAttendance, (err) => {
        if (err) console.error("Error dropping attendance:", err);
        else console.log("✅ Dropped attendance");
    });

    db.query(dropStudents, (err) => {
        if (err) console.error("Error dropping students:", err);
        else console.log("✅ Dropped students");
    });

    // 2. Create Tables
    // Students: Roll No is Primary Key
    const createStudents = `
        CREATE TABLE students (
            roll_no VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            face_descriptor LONGTEXT NOT NULL,
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Attendance: Stores Name and Roll No directly, no FK constraint (optional, but requested)
    // Removed Student ID, just storing Name and Roll No history
    const createAttendance = `
        CREATE TABLE attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            roll_no VARCHAR(50) NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    setTimeout(() => {
        db.query(createStudents, (err) => {
            if (err) console.error("Error creating students table:", err);
            else console.log("✅ Created students table (PK: roll_no)");
        });

        db.query(createAttendance, (err) => {
            if (err) console.error("Error creating attendance table:", err);
            else console.log("✅ Created attendance table (Stored Name/RollNo)");

            console.log("🚀 Final Schema Setup Complete!");
            db.end();
        });
    }, 1000);
};

setupFinalSchema();
