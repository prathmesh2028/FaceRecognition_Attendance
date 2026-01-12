const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../database.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ students: [], attendance: [] }, null, 2));
}

const readData = () => {
    try {
        const data = fs.readFileSync(DB_FILE);
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading DB:", err);
        return { students: [], attendance: [] };
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing DB:", err);
        return false;
    }
};

module.exports = {
    getStudents: () => readData().students,
    getAttendance: () => readData().attendance,
    addStudent: (student) => {
        const data = readData();
        data.students.push(student);
        writeData(data);
        return student;
    },
    addAttendance: (record) => {
        const data = readData();
        data.attendance.push(record);
        writeData(data);
        return record;
    },
    clearAttendance: () => {
        const data = readData();
        data.attendance = [];
        writeData(data);
    },
    deleteStudent: (rollNo) => {
        const data = readData();
        const initialLength = data.students.length;
        data.students = data.students.filter(s => s.roll_no !== rollNo);
        writeData(data);
        return data.students.length < initialLength;
    },
    findStudentByRollNo: (rollNo) => {
        const data = readData();
        return data.students.find(s => s.roll_no === rollNo);
    }
};
