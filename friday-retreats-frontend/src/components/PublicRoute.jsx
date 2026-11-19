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

const PublicRoute = () => {
    const { token, role } = useSelector((state) => state.auth);

    // If already logged in, block access to Login/Register and redirect
    if (token && role) {
        return <Navigate to={getDashboardByRole(role)} replace />;
    }

    return <Outlet />;
};

export default PublicRoute;