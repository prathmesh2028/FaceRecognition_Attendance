import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ChangePassword = () => {
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');
        try {
            const res = await api.post('/api/auth/change-password', { currentPassword, newPassword });
            setMsg(res.data.msg);
            setTimeout(() => navigate('/students'), 2000);
        } catch (err) {
            if (err.response?.data?.errors) {
                setError(err.response.data.errors.map(e => e.message).join(', '));
            } else {
                setError(err.response?.data?.msg || 'Error changing password');
            }
        }
    };

    return (
        <div className="page-container">
            <div className="card" style={{ maxWidth: '400px' }}>
                <h2>Change Password</h2>
                {msg && <p style={{ color: 'green' }}>{msg}</p>}
                {error && <p style={{ color: 'red', fontSize: '0.9em' }}>{error}</p>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    <input 
                        type="password" 
                        className="input-field" 
                        placeholder="Current Password" 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        className="input-field" 
                        placeholder="New Password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                    />
                    <small style={{ color: '#666', fontSize: '0.8em' }}>Must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.</small>
                    <button type="submit" className="btn">Update Password</button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
