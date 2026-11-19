import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice'; 

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
};

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-6">
                    <h2 className="text-2xl font-bold">Friday Retreats</h2>
                    <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
                </div>
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link to="/admin/dashboard" className="block px-4 py-2 rounded hover:bg-gray-800">
                        Dashboard
                    </Link>
                    <Link to="/admin/users" className="block px-4 py-2 rounded hover:bg-gray-800 bg-gray-800">
                        User Management
                    </Link>
                </nav>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm flex items-center justify-between px-6 py-4">
                    <h1 className="text-xl font-semibold text-gray-800">Admin Portal</h1>
                    <button 
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition"
                    >
                        Logout
                    </button>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;