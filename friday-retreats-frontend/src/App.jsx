import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmailOtp from './pages/auth/VerifyEmailOtp';
import AdminLayout from './layouts/AdminLayout';
import AdminUsersList from './pages/admin/AdminUsersList';

import ForgotPassword from './pages/auth/ForgotPassword';

import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminStaffManagement from './pages/admin/AdminStaffManagement';
import AdminInviteStaff from './pages/admin/AdminInviteStaff';

import SetPassword from './pages/auth/SetPassword';

function App() {
    return (
        <Router>
            <Routes>
                {/* Guest-Only Routes (Blocked when logged in) */}
                <Route element={<PublicRoute />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email-otp" element={<VerifyEmailOtp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/set-password/:uid/:token" element={<SetPassword />} />
                </Route>

                {/* User Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
                    <Route path="/home" element={<LandingPage />} />
                </Route>

                {/* Admin Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<div className="p-8 text-xl font-bold text-[#5a1c1d]">Admin Dashboard</div>} />
                        <Route path="users" element={<AdminUsersList />} />
                        <Route path="users/:id" element={<AdminUserDetail />} />
                        <Route path="staff" element={<AdminStaffManagement />} />
                        <Route path="staff/invite" element={<AdminInviteStaff />} />
                    </Route>
                </Route>

                {/* Staff Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
                    <Route
                        path="/staff/dashboard"
                        element={<div className="p-8 text-xl font-bold text-[#5a1c1d]">Staff Dashboard</div>}
                    />
                </Route>

                {/* Hotel Staff Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['HOTEL_STAFF']} />}>
                    <Route
                        path="/hotel/dashboard"
                        element={<div className="p-8 text-xl font-bold text-[#5a1c1d]">Hotel Staff Dashboard</div>}
                    />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;