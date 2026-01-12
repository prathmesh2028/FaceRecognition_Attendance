const fs = require('fs');
const path = require('path');

// Use /tmp for serverless environments (transient storage) or local paths
const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const DATA_DIR = isVercel ? '/tmp' : path.join(__dirname, '../');

const REG_FILE = path.join(DATA_DIR, 'registrations.json');
const HIST_FILE = path.join(DATA_DIR, 'history.json');

// In-memory fallback if fs fails
let memoryStudents = [];
let memoryAttendance = [];
let useMemory = false;

console.log("📂 Database Files Location:");
console.log("   👉 Registrations:", path.resolve(REG_FILE));
console.log("   👉 History:", path.resolve(HIST_FILE));

// Initialize Files if not exist
try {
    if (!fs.existsSync(REG_FILE)) {
        fs.writeFileSync(REG_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(HIST_FILE)) {
        fs.writeFileSync(HIST_FILE, JSON.stringify([], null, 2));
    }
} catch (err) {
    console.error("⚠️ Could not initialize database files. Switching to IN-MEMORY mode (Data will be lost on restart):", err.message);
    useMemory = true;
}

const readJson = (file, memoryStore) => {
    if (useMemory) return memoryStore;
    try {
        if (!fs.existsSync(file)) return []; // Should have been created, but safety check
        const data = fs.readFileSync(file);
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${file}:`, err);
        return memoryStore;
    }
};

const writeJson = (file, data, memoryStoreRef) => {
    if (useMemory) {
        // Update the reference (careful: this changes which array the variable points to in global scope?)
        // No, we passed the array by value/reference. We need to update the global variable.
        // Actually, for in-memory, we can just update the array in place or let the specific function handle it.
        // Let's rely on the specific functions to update memory state.
        return true;
    }
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error(`Error writing ${file}. Switching to IN-MEMORY mode.`, err);
        useMemory = true;
        return false;
    }
};

module.exports = {
    getStudents: () => readJson(REG_FILE, memoryStudents),
    getAttendance: () => readJson(HIST_FILE, memoryAttendance),

    addStudent: (student) => {
        let students = readJson(REG_FILE, memoryStudents);
        students.push(student);
        if (useMemory) {
            memoryStudents = students;
        } else {
            writeJson(REG_FILE, students);
        }
        return student;
    },

    addAttendance: (record) => {
        let history = readJson(HIST_FILE, memoryAttendance);
        history.push(record);
        if (useMemory) {
            memoryAttendance = history;
        } else {
            writeJson(HIST_FILE, history);
        }
        return record;
    },

    clearAttendance: () => {
        if (useMemory) {
            memoryAttendance = [];
        } else {
            writeJson(HIST_FILE, []);
        }
    },

    deleteStudent: (rollNo) => {
        let students = readJson(REG_FILE, memoryStudents);
        const initialLength = students.length;
        students = students.filter(s => s.roll_no !== rollNo);

        if (useMemory) {
            memoryStudents = students;
        } else {
            writeJson(REG_FILE, students);
        }
        return students.length < initialLength;
    },

    findStudentByRollNo: (rollNo) => {
        const students = readJson(REG_FILE, memoryStudents);
        return students.find(s => s.roll_no === rollNo);
    }
};
