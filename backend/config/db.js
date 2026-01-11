require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'attendance_db'
});

db.connect((err) => {
    if (err) {
        console.log("MySQL Connection Failed: ", err.message);
        return;
    }
    console.log("MySQL Connected Successfully!");
});

module.exports = db;
