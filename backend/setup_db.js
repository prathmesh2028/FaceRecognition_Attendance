const db = require('./config/db');

const createTables = async () => {
    const studentsTable = `
        CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            roll_no VARCHAR(50) NOT NULL,
            face_descriptor JSON NOT NULL,
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const attendanceTable = `
        CREATE TABLE IF NOT EXISTS attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
    `;

    db.query(studentsTable, (err) => {
        if (err) console.error("Error creating students table:", err);
        else console.log("✅ Students table ready");
    });

    db.query(attendanceTable, (err) => {
        if (err) console.error("Error creating attendance table:", err);
        else console.log("✅ Attendance table ready");
    });

    // Close connection after a short delay to ensure queries finish
    setTimeout(() => {
        db.end();
        console.log("Database setup complete.");
    }, 1000);
};

createTables();
