import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (res.success) {
            if (res.role === 'SUPER_ADMIN') {
                navigate('/admin-requests');
            } else {
                navigate('/students');
            }
        } else {
            setError(res.msg || 'Invalid credentials or account locked.');
        }
    };

    return (
        <div className="page-container">
            <div className="card" style={{ maxWidth: '400px' }}>
                <h2>Admin Login</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    <div>
                        <label>Email</label>
                        <input 
                            type="email" 
                            className="input-field" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div>
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="input-field" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn">Login</button>
                </form>
                <div style={{ marginTop: '15px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link to="/forgot-password" style={{ color: '#4F46E5', textDecoration: 'none' }}>Forgot Password?</Link>
                    <Link to="/request-access" style={{ color: '#10B981', textDecoration: 'none', fontWeight: 'bold' }}>Request Admin Access</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
