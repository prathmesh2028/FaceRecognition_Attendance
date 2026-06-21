import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const VerifyOTP = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';

    const [otp, setOtp] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');
        try {
            const res = await api.post('/api/auth/verify-otp', { email, otp });
            setMsg(res.data.msg);
            setTimeout(() => {
                navigate('/reset-password', { state: { email, otp } });
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid or expired OTP');
        }
    };

    if (!email) {
        return <div className="page-container"><h2>Error: No email provided. Start from Forgot Password.</h2></div>;
    }

    return (
        <div className="page-container">
            <div className="card" style={{ maxWidth: '400px' }}>
                <h2>Verify OTP</h2>
                <p>Enter the 6-digit code sent to {email}.</p>
                {msg && <p style={{ color: 'green' }}>{msg}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    <input 
                        type="text" 
                        maxLength="6"
                        className="input-field" 
                        placeholder="123456" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        required 
                    />
                    <button type="submit" className="btn">Verify</button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;
