import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [reqRes, adminRes] = await Promise.all([
                api.get('/api/admins/requests'),
                api.get('/api/admins')
            ]);
            setRequests(reqRes.data.requests);
            setAdmins(adminRes.data.admins);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (endpoint) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.patch(endpoint);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error performing action');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this admin permanently?')) return;
        try {
            await api.delete(`/api/admins/${id}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error deleting admin');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="page-container" style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '20px', color: '#111827' }}>Super Admin Dashboard</h1>
            {error && <div className="error-message">{error}</div>}

            <div className="card" style={{ marginBottom: '30px', maxWidth: '100%' }}>
                <h2 style={{ marginBottom: '15px', color: '#4F46E5' }}>Pending Access Requests</h2>
                {requests.filter(r => r.status === 'PENDING').length === 0 ? (
                    <p>No pending requests.</p>
                ) : (
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Reason</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.filter(r => r.status === 'PENDING').map(req => (
                                <tr key={req._id}>
                                    <td>{req.name}</td>
                                    <td>{req.email}</td>
                                    <td>{req.department}</td>
                                    <td>{req.reason}</td>
                                    <td>
                                        <button className="btn" style={{ backgroundColor: '#10B981', padding: '5px 10px', fontSize: '12px', marginRight: '5px' }} onClick={() => handleAction(`/api/admins/requests/${req._id}/approve`)}>Approve</button>
                                        <button className="btn" style={{ backgroundColor: '#EF4444', padding: '5px 10px', fontSize: '12px' }} onClick={() => handleAction(`/api/admins/requests/${req._id}/reject`)}>Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="card" style={{ maxWidth: '100%' }}>
                <h2 style={{ marginBottom: '15px', color: '#374151' }}>Manage Admins</h2>
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => (
                            <tr key={admin._id}>
                                <td>{admin.name}</td>
                                <td>{admin.email}</td>
                                <td>{admin.role}</td>
                                <td>
                                    <span style={{ 
                                        color: admin.status === 'ACTIVE' ? '#10B981' : '#EF4444',
                                        fontWeight: 'bold'
                                    }}>{admin.status}</span>
                                </td>
                                <td>
                                    {admin.role !== 'SUPER_ADMIN' && (
                                        <>
                                            {admin.status === 'ACTIVE' ? (
                                                <button className="btn" style={{ backgroundColor: '#F59E0B', padding: '5px 10px', fontSize: '12px', marginRight: '5px' }} onClick={() => handleAction(`/api/admins/suspend/${admin._id}`)}>Suspend</button>
                                            ) : (
                                                <button className="btn" style={{ backgroundColor: '#10B981', padding: '5px 10px', fontSize: '12px', marginRight: '5px' }} onClick={() => handleAction(`/api/admins/reactivate/${admin._id}`)}>Reactivate</button>
                                            )}
                                            <button className="btn" style={{ backgroundColor: '#EF4444', padding: '5px 10px', fontSize: '12px' }} onClick={() => handleDelete(admin._id)}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminRequests;
