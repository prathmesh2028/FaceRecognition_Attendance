import React, { useEffect, useState } from "react"; 
import axios from "axios";

function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/attendance-history`
            );
            if (res.data.success) {
                setHistory(res.data.history);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const clearHistory = async () => {
        if (!window.confirm("Are you sure you want to clear ALL attendance history?")) return;
        try {
            const res = await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/attendance-history`
            );
            if (res.data.success) {
                setHistory([]);
                alert("History cleared!");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to clear history");
        }
    };

    return (
        <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h2 style={{ margin: 0 }}>Attendance History</h2>
                {history.length > 0 && (
                    <button
                        className="btn"
                        style={{ backgroundColor: "#EF4444", padding: "8px 16px", fontSize: "0.9rem" }}
                        onClick={clearHistory}
                    >
                        Clear History
                    </button>
                )}
            </div>

            {loading ? (
                <p style={{ textAlign: "center" }}>Loading records...</p>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Date</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? (
                                history.map((record, index) => {
                                    let dateStr = record.timestamp;
                                    if (typeof dateStr === 'string') {
                                        if (!dateStr.includes('T')) {
                                            dateStr = dateStr.replace(' ', 'T');
                                        }
                                        if (!dateStr.endsWith('Z')) {
                                            dateStr += 'Z';
                                        }
                                    }
                                    const dateObj = new Date(dateStr);

                                    return (
                                        <tr key={index}>
                                            <td>{record.rollNo || "N/A"}</td>
                                            <td>{record.name}</td>
                                            <td>
                                                {dateObj.toLocaleDateString(
                                                    'en-IN',
                                                    { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' }
                                                )}
                                            </td>
                                            <td>
                                                {dateObj.toLocaleTimeString(
                                                    'en-IN',
                                                    { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }
                                                )} (IST)
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center" }}>No records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default History;
