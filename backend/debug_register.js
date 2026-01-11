const db = require('./config/db');

// Dummy data
const name = "Debug User";
const rollNo = "D-101";
const descriptor = Array(128).fill(0.5); // Dummy face descriptor

const testRegistration = () => {
    const query = "INSERT INTO students (name, roll_no, face_descriptor) VALUES (?, ?, ?)";
    const faceData = JSON.stringify(descriptor);

    db.query(query, [name, rollNo, faceData], (err, result) => {
        if (err) {
            console.error("❌ DB Insert Error:", err);
            if (err.code === 'ER_NO_SUCH_TABLE') {
                console.error("⚠️ Table 'students' does not exist!");
            }
        } else {
            console.log("✅ Registration Successful! Insert ID:", result.insertId);
        }
        db.end();
    });
};

testRegistration();
