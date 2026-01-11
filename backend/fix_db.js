const db = require('./config/db');

const fixDB = () => {
    // Drop tables to clear bad schema
    db.query("DROP TABLE IF EXISTS attendance", (err) => {
        if (err) console.error(err);
        else console.log("Dropped attendance");
    });

    db.query("DROP TABLE IF EXISTS students", (err) => {
        if (err) console.error(err);
        else console.log("Dropped students");

        // Close connection
        setTimeout(() => db.end(), 1000);
    });
};

fixDB();
