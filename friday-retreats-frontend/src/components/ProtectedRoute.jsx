import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const getDashboardByRole = (role) => {
    switch (role) {
        case 'ADMIN':
            return '/admin/dashboard';
        case 'HOTEL_STAFF':
            return '/hotel/dashboard';
        case 'STAFF':
            return '/staff/dashboard';
        case 'USER':
        default:
            return '/home';
    }
};

const ProtectedRoute = ({ allowedRoles }) => {
    const { token, role } = useSelector((state) => state.auth);

    // Not logged in -> force to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Logged in, but wrong role (e.g., USER trying to hit /admin/dashboard)
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to={getDashboardByRole(role)} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;