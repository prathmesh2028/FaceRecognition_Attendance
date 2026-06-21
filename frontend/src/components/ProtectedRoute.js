import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { admin, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!admin) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(admin.role)) {
        return <Navigate to="/" replace />; // Or to an Unauthorized page
    }

    return children;
};

export default ProtectedRoute;
