import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');
        try {
            const res = await api.post('/api/auth/forgot-password', { email });
            setMsg(res.data.msg);
            setTimeout(() => {
                navigate('/verify-otp', { state: { email } });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error sending OTP');
        }
    };

    return (
        <div className="page-container">
            <div className="card" style={{ maxWidth: '400px' }}>
                <h2>Forgot Password</h2>
                <p>Enter your email to receive a 6-digit OTP.</p>
                {msg && <p style={{ color: 'green' }}>{msg}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    <input 
                        type="email" 
                        className="input-field" 
                        placeholder="Enter admin email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <button type="submit" className="btn">Send OTP</button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
