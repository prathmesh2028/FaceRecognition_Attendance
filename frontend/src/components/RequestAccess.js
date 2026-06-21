import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const RequestAccess = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', department: '', designation: '', reason: '', password: '', confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            const { data } = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/request-access`,
                formData
            );
            setMessage(data.msg);
            setTimeout(() => navigate('/login'), 5000);
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '600px' }}>
                <h2>Request Admin Access</h2>
                <p>Submit your details to the Super Admin for approval.</p>
                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Department</label>
                        <input type="text" name="department" required value={formData.department} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Designation</label>
                        <input type="text" name="designation" required value={formData.designation} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Reason for Access</label>
                        <textarea name="reason" required value={formData.reason} onChange={handleChange} placeholder="Why do you need access?" rows="3" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}></textarea>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" required value={formData.password} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} />
                    </div>
                    <button type="submit" className="btn" disabled={loading} style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>

                <div className="auth-links" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default RequestAccess;
