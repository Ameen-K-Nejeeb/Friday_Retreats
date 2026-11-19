import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const mainNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'People', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Bookings', path: '/admin/bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Finance', path: '/admin/finance', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { name: 'FR Program', path: '/admin/fr-program', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { name: 'Support', path: '/admin/support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Reports', path: '/admin/reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

const adminNavItems = [
    { name: 'Staff Management', path: '/admin/staff', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { name: 'Roles & Permissions', path: '/admin/roles', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { name: 'Audit Log', path: '/admin/audit-log', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { email } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login', { replace: true });
    };

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition ${
            isActive
                ? 'bg-[#f47c75] text-[#4a1516] font-semibold shadow-xs'
                : 'text-gray-600 hover:bg-[#efeae7] hover:text-gray-900'
        }`;

    return (
        <div className="flex min-h-screen bg-[#fcfbfa] font-sans text-gray-900">
            {/* Left Sidebar */}
            <aside className="w-[240px] shrink-0 bg-[#f8f5f3] border-r border-[#ece6e2] flex flex-col justify-between">
                <div>
                    {/* Brand Header */}
                    <div className="px-5 pt-5 pb-4">
                        <h1 className="text-[17px] font-bold text-[#5a1c1d] tracking-tight leading-none">
                            Friday Retreats
                        </h1>
                        <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-gray-400 mt-1">
                            Staff Portal
                        </p>
                    </div>

                    {/* Admin Profile Card */}
                    <div className="px-5 py-4 text-center border-b border-[#ece6e2]/70">
                        <div className="w-12 h-12 mx-auto rounded-full bg-[#e9e2dd] flex items-center justify-center text-gray-600 mb-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <p className="text-[13px] font-bold text-gray-900 truncate">
                            {email ? email.split('@')[0] : 'Administrator'}
                        </p>
                        <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-semibold text-[#5a1c1d] bg-[#f1e1e1] rounded-full">
                            Administrator
                        </span>
                    </div>

                    {/* Main Navigation */}
                    <nav className="px-3 py-4 space-y-1">
                        {mainNavItems.map((item) => (
                            <NavLink key={item.name} to={item.path} className={navLinkClass}>
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d={item.icon} />
                                </svg>
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Administration & Bottom Actions */}
                <div className="px-3 pb-5 pt-4 border-t border-[#ece6e2]/70">
                    <p className="px-3.5 text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-2">
                        Administration
                    </p>
                    <div className="space-y-1 mb-5">
                        {adminNavItems.map((item) => (
                            <NavLink key={item.name} to={item.path} className={navLinkClass}>
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d={item.icon} />
                                </svg>
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </div>

                    <div className="pt-3 border-t border-[#ece6e2] space-y-1">
                        <NavLink to="/admin/profile" className={navLinkClass}>
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Admin Profile</span>
                        </NavLink>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                        >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;