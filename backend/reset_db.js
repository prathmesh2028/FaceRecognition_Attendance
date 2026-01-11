const db = require('./config/db');

const resetDB = async () => {
    console.log("⚠️  Resetting Database Schema...");

    // 1. Drop existing tables to clear incorrect schema
    const dropAttendance = "DROP TABLE IF EXISTS attendance";
    const dropStudents = "DROP TABLE IF EXISTS students";

    db.query(dropAttendance, (err) => {
        if (err) console.error("Error dropping attendance:", err);
        else console.log("✅ Dropped attendance table");
    });

    db.query(dropStudents, (err) => {
        if (err) console.error("Error dropping students:", err);
        else console.log("✅ Dropped students table");
    });

    // 2. Re-create tables with LONGTEXT for descriptor to handle large data
    const createStudents = `
        CREATE TABLE students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            roll_no VARCHAR(50) NOT NULL,
            face_descriptor LONGTEXT NOT NULL, 
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createAttendance = `
        CREATE TABLE attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
    `;

    // Wait 1s to ensure drops are processed (async)
    setTimeout(() => {
        db.query(createStudents, (err) => {
            if (err) console.error("Error creating students table:", err);
            else console.log("✅ Created students table (with LONGTEXT)");
        });

        db.query(createAttendance, (err) => {
            if (err) console.error("Error creating attendance table:", err);
            else console.log("✅ Created attendance table");

            console.log("🚀 Database Reset Complete!");
            db.end();
        });
    }, 1000);
};

resetDB();
