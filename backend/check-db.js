require('dotenv').config();
const mysql = require('mysql2');

console.log("🔍 Testing Database Connection...");
console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`User: ${process.env.DB_USER || 'root'}`);
console.log(`Database: ${process.env.DB_NAME || 'attendance_db'}`);
console.log(`Port: ${process.env.DB_PORT || 3306}`);

let config;
if (process.env.DATABASE_URL) {
    console.log("Using DATABASE_URL provided in env.");
    config = process.env.DATABASE_URL;
} else {
    config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS,
        database: process.env.DB_NAME || 'attendance_db',
        port: process.env.DB_PORT || 3306,
        ssl: { rejectUnauthorized: false }
    };
}

const connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.error("❌ Connection Failed!");
        console.error("Error Code:", err.code);
        console.error("Error Message:", err.message);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error("Tip: Check if your IP is whitelisted in Railway/Render.");
        }
        process.exit(1);
    } else {
        console.log("✅ Successfully Connected to Database!");
        connection.query('SHOW TABLES', (err, results) => {
            if (err) {
                console.error("❌ Error listing tables:", err);
            } else {
                console.log("Tables in database:", results);
            }
            connection.end();
            process.exit(0);
        });
    }
});
