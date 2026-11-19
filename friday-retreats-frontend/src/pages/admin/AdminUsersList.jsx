import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ROLE_TABS = [
    { key: 'ALL', label: 'All' },
    { key: 'USER', label: 'Users' },
    { key: 'STAFF', label: 'Staff' },
    { key: 'HOTEL_STAFF', label: 'Hotel Staff' },
    { key: 'ADMIN', label: 'Admin' },
];

const AdminUsersList = () => {
    const navigate = useNavigate();
    const { token, email: currentAdminEmail } = useSelector((state) => state.auth);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/accounts/admin/users/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res.data;
            const usersArray = Array.isArray(data)
                ? data
                : Array.isArray(data?.results)
                ? data.results
                : Array.isArray(data?.users)
                ? data.users
                : [];
            setUsers(usersArray);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const isSelf = (user) => user.email === currentAdminEmail;
    
    const isProtectedAdmin = (user) =>
        user.role === 'ADMIN' || user.is_superuser || isSelf(user);

    const handleToggleStatus = async (e, user) => {
        e.stopPropagation();
        if (isProtectedAdmin(user)) return;

        try {
            await axios.patch(
                `http://127.0.0.1:8000/api/accounts/admin/users/${user.id}/toggle-status/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
            );
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update user status.');
        }
    };

    

    const handleDeleteUser = async (e, user) => {
    e.stopPropagation();
    if (isSelf(user)) return;

    const confirmed = window.confirm(
        `Permanently delete ${user.email}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
        await axios.delete(
            `http://127.0.0.1:8000/api/accounts/admin/users/${user.id}/delete/`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete user.');
    }
};

    const getInitials = (user) => {
        const first = user.first_name?.[0] || user.email?.[0] || 'U';
        const last = user.last_name?.[0] || '';
        return (first + last).toUpperCase();
    };

    const getFullName = (user) => {
        const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        return name || user.email.split('@')[0];
    };

    const formatJoinedDate = (dateStr) => {
        if (!dateStr) return 'Recently';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const getRoleCount = (roleKey) => {
        if (roleKey === 'ALL') return users.length;
        return users.filter((u) => u.role === roleKey).length;
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            getFullName(u).toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.phone_number || '').includes(searchQuery);

        const matchesStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && u.is_active) ||
            (statusFilter === 'INACTIVE' && !u.is_active);

        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

        return matchesSearch && matchesStatus && matchesRole;
    });

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleExportCSV = () => {
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'FR Coins', 'Status'];
        const rows = filteredUsers.map((u) => [
            u.id,
            getFullName(u),
            u.email,
            u.phone_number || '',
            u.role,
            u.fr_coins_balance || 0,
            u.is_active ? 'Active' : 'Inactive',
        ]);
        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `friday_retreats_${roleFilter.toLowerCase()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Top Bar */}
            <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between">
                <div className="w-32" />
                <h2 className="text-[18px] font-bold text-[#5a1c1d]">People Directory</h2>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search people..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-9 pr-4 py-1.5 text-[12px] bg-[#f8f6f5] border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a1c1d] w-56"
                        />
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="p-8 max-w-6xl w-full mx-auto">
                {/* Filter & Export Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3.5 py-2 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a1c1d]"
                        >
                            <option value="ALL">Status: All</option>
                            <option value="ACTIVE">Status: Active</option>
                            <option value="INACTIVE">Status: Inactive</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-semibold text-[#5a1c1d] bg-white border border-[#5a1c1d]/30 rounded-lg hover:bg-[#fdf6f6] transition cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export CSV
                    </button>
                </div>

                {/* Switchable Role Category Bar (Under Export CSV) */}
                <div className="flex flex-wrap items-center justify-end mb-6">
                    <div className="inline-flex flex-wrap items-center gap-1.5 p-1 bg-[#f3efec] border border-gray-200/80 rounded-xl">
                        {ROLE_TABS.map((tab) => {
                            const active = roleFilter === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => {
                                        setRoleFilter(tab.key);
                                        setCurrentPage(1);
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium rounded-lg transition cursor-pointer ${
                                        active
                                            ? 'bg-[#5a1c1d] text-white shadow-xs'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`px-1.5 py-0.5 text-[10px] rounded-full font-semibold ${
                                            active
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-200/80 text-gray-600'
                                        }`}
                                    >
                                        {getRoleCount(tab.key)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f9f7f6] border-b border-gray-200/70 text-[10px] font-bold tracking-wider uppercase text-gray-500">
                                    <th className="py-3.5 px-6">Customer</th>
                                    <th className="py-3.5 px-6">Contact</th>
                                    <th className="py-3.5 px-6 text-center">Bookings</th>
                                    <th className="py-3.5 px-6 text-right">FR Coins</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                    <th className="py-3.5 px-6 text-right">Delete</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-[13px]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-gray-400">
                                            Loading accounts...
                                        </td>
                                    </tr>
                                ) : paginatedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-gray-400">
                                            No accounts found in this category.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user) => {
                                        const isAdmin = isProtectedAdmin(user);
                                        return (
                                            <tr
                                                key={user.id}
                                                onClick={() => navigate(`/admin/users/${user.id}`, { state: { user } })}
                                                className="hover:bg-[#fcf9f8] transition cursor-pointer"
                                            >
                                                {/* Customer */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-9 h-9 rounded-full bg-[#efeae7] text-[#5a1c1d] font-bold text-[12px] flex items-center justify-center shrink-0">
                                                            {getInitials(user)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-semibold text-gray-900 leading-tight">
                                                                    {getFullName(user)}
                                                                </p>
                                                                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-[#f4efeb] text-[#5a1c1d]">
                                                                    {user.role?.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                                Joined {formatJoinedDate(user.date_joined)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact */}
                                                <td className="py-4 px-6">
                                                    <p className="text-[12px] text-gray-700">{user.email}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                                        {user.phone_number || 'No phone'}
                                                    </p>
                                                </td>

                                                {/* Bookings */}
                                                <td className="py-4 px-6 text-center font-medium text-gray-700">
                                                    {user.bookings_count ?? 0}
                                                </td>

                                                {/* FR Coins */}
                                                <td className="py-4 px-6 text-right font-semibold text-[#c44536]">
                                                    {(user.fr_coins_balance ?? 0).toLocaleString()}
                                                </td>

                                                {/* Status */}
                                                <td className="py-4 px-6">
                                                    {user.is_active ? (
                                                        <span className="text-[11px] font-bold text-[#5a1c1d]">Active</span>
                                                    ) : (
                                                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500 rounded-full">
                                                            Inactive
                                                        </span>
                                                    )}
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        {(user.fr_coins_balance ?? 0) > 0 ? 'FR Club' : 'Non-Member'}
                                                    </p>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-6 text-right">
                                                    {isAdmin ? (
                                                        <span className="inline-block px-2.5 py-1 text-[11px] font-medium text-gray-400 bg-gray-100 rounded-md">
                                                            Protected
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleToggleStatus(e, user)}
                                                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition cursor-pointer ${
                                                                user.is_active
                                                                    ? 'border-red-200 text-red-700 hover:bg-red-50'
                                                                    : 'border-green-200 text-green-700 hover:bg-green-50'
                                                            }`}
                                                        >
                                                            {user.is_active ? 'Block' : 'Activate'}
                                                        </button>
                                                    )}
                                                </td>

                                                {/* Delete */}
                                                <td className="py-4 px-6 text-right">
                                                    {isSelf(user) ? (
                                                        <span className="text-[11px] text-gray-300">—</span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleDeleteUser(e, user)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition cursor-pointer"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Delete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-500">
                        <span>
                            Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
                            {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}{' '}
                            accounts
                        </span>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                            >
                                &lsaquo;
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-medium cursor-pointer ${
                                        currentPage === page
                                            ? 'bg-[#5a1c1d] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                            >
                                &rsaquo;
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminUsersList;