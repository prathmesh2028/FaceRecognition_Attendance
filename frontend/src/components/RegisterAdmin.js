import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

const RegisterAdmin = () => {
    const { admin } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('ADMIN');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');
        try {
            const res = await api.post('/api/admins', { name, email, password, role });
            setMsg('Admin registered successfully! They can now log in.');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            if (err.response?.data?.errors) {
                setError(err.response.data.errors.map(e => e.message).join(', '));
            } else {
                setError(err.response?.data?.msg || 'Error registering admin');
            }
        }
    };

    if (admin?.role !== 'SUPER_ADMIN') {
        return (
            <div className="page-container">
                <div className="card" style={{ color: 'red' }}>
                    <h2>Access Denied</h2>
                    <p>Only the Super Admin can register new Admin accounts.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="card" style={{ maxWidth: '400px' }}>
                <h2>Register New Admin</h2>
                <p>Max 4 Admins. Password must be 8+ chars with uppercase, lowercase, number, and special character.</p>
                {msg && <p style={{ color: 'green' }}>{msg}</p>}
                {error && <p style={{ color: 'red', fontSize: '0.9em' }}>{error}</p>}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Full Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                    <input 
                        type="email" 
                        className="input-field" 
                        placeholder="Admin Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        className="input-field" 
                        placeholder="Secure Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    <select 
                        className="input-field" 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin (Only 1 allowed)</option>
                    </select>
                    <button type="submit" className="btn" style={{ backgroundColor: '#10B981' }}>Register Admin</button>
                </form>
            </div>
        </div>
    );
};

export default RegisterAdmin;
