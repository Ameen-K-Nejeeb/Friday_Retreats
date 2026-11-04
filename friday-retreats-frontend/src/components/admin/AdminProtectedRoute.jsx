import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminProtectedRoute = () => {
    const { token } = useSelector((state) => state.adminAuth);

    // If there is no token, redirect to login. Otherwise, render the child routes.
    return token ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;