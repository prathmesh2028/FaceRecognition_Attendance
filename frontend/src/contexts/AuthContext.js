import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('adminInfo');
        if (userInfo) {
            setAdmin(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            setAdmin(data);
            localStorage.setItem('adminInfo', JSON.stringify(data));
            return { success: true, role: data.role };
        } catch (error) {
            return { 
                success: false, 
                msg: error.response && error.response.data.msg 
                    ? error.response.data.msg 
                    : error.message 
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (e) {
            console.error('Logout error', e);
        }
        setAdmin(null);
        localStorage.removeItem('adminInfo');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ admin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
