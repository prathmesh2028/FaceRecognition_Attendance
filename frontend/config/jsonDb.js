const fs = require('fs');
const path = require('path');

const REG_FILE = path.join(__dirname, '../registrations.json');
const HIST_FILE = path.join(__dirname, '../history.json');

// Initialize Files if not exist
try {
    if (!fs.existsSync(REG_FILE)) {
        fs.writeFileSync(REG_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(HIST_FILE)) {
        fs.writeFileSync(HIST_FILE, JSON.stringify([], null, 2));
    }
} catch (err) {
    console.error("⚠️ Could not initialize database files (Read-Only System?):", err.message);
}

const readJson = (file) => {
    try {
        const data = fs.readFileSync(file);
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${file}:`, err);
        return [];
    }
};

const writeJson = (file, data) => {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error(`Error writing ${file}:`, err);
        return false;
    }
};

module.exports = {
    getStudents: () => readJson(REG_FILE),
    getAttendance: () => readJson(HIST_FILE),

    addStudent: (student) => {
        const students = readJson(REG_FILE);
        students.push(student);
        writeJson(REG_FILE, students);
        return student;
    },

    addAttendance: (record) => {
        const history = readJson(HIST_FILE);
        history.push(record);
        writeJson(HIST_FILE, history);
        return record;
    },

    clearAttendance: () => {
        writeJson(HIST_FILE, []);
    },

    deleteStudent: (rollNo) => {
        let students = readJson(REG_FILE);
        const initialLength = students.length;
        students = students.filter(s => s.roll_no !== rollNo);
        writeJson(REG_FILE, students);
        return students.length < initialLength;
    },

    findStudentByRollNo: (rollNo) => {
        const students = readJson(REG_FILE);
        return students.find(s => s.roll_no === rollNo);
    }
};
