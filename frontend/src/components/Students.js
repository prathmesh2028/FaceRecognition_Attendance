import React, { useEffect, useState } from "react";
import axios from "axios";

function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/students");
            if (res.data.success) {
                setStudents(res.data.students);
            }
        } catch (err) {
            console.error("Error fetching students:", err);
        }
        setLoading(false);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            const res = await axios.delete(`http://localhost:5000/api/students/${id}`);
            if (res.data.success) {
                alert("Student deleted successfully");
                setStudents(students.filter(student => student.id !== id));
            }
        } catch (err) {
            console.error("Error deleting student:", err);
            alert("Failed to delete student");
        }
    };

    return (
        <div className="container">
            <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Registered Students</h2>

            {loading ? (
                <p style={{ textAlign: "center" }}>Loading students...</p>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Registered At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.rollNo || "N/A"}</td>
                                        <td>{student.name}</td>
                                        <td>{(() => {
                                            let d = student.registeredAt;
                                            if (typeof d === 'string') {
                                                if (!d.includes('T')) d = d.replace(' ', 'T');
                                                if (!d.endsWith('Z')) d += 'Z';
                                            }
                                            return new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
                                        })()} (IST)</td>
                                        <td>
                                            <button
                                                className="btn"
                                                style={{ backgroundColor: "#EF4444", padding: "5px 10px", fontSize: "0.9rem" }}
                                                onClick={() => handleDelete(student.id, student.name)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center" }}>No students registered.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Students;
