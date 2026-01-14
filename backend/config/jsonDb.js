const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '..', 'registrations.json');
const historyFile = path.join(__dirname, '..', 'history.json');

// Helper to read data
const readData = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err);
        return [];
    }
};

// Helper to write data
const writeData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error writing ${filePath}:`, err);
    }
};

module.exports = {
    getStudents: () => readData(usersFile),
    findStudentByRollNo: (rollNo) => {
        const students = readData(usersFile);
        return students.find(s => s.roll_no === rollNo);
    },
    addStudent: (student) => {
        const students = readData(usersFile);
        students.push(student);
        writeData(usersFile, students);
    },
    deleteStudent: (rollNo) => {
        let students = readData(usersFile);
        const initialLength = students.length;
        students = students.filter(s => s.roll_no !== rollNo);
        if (students.length !== initialLength) {
            writeData(usersFile, students);
            return true;
        }
        return false;
    },
    getAttendance: () => readData(historyFile),
    addAttendance: (record) => {
        const history = readData(historyFile);
        history.push(record);
        writeData(historyFile, history);
    },
    clearAttendance: () => {
        writeData(historyFile, []);
    }
};
