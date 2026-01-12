-- Run this SQL in your Railway/Render MySQL Database Console

DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS students;

-- Students Table
CREATE TABLE students (
    roll_no VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    face_descriptor LONGTEXT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
