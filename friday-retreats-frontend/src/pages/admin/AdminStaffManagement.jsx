import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const STATUS_TABS = ['All', 'Active', 'Inactive', 'Suspended', 'Pending'];

const AdminStaffManagement = () => {
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);

    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusTab, setStatusTab] = useState('All');
    const [departmentFilter, setDepartmentFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    useEffect(() => {
        const fetchStaff = async () => {
            setLoading(true);
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/accounts/admin/users/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = res.data;
                const allUsers = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.results)
                    ? data.results
                    : [];

                // Keep only staff & admin accounts
                const onlyStaff = allUsers.filter((u) =>
                    ['STAFF', 'HOTEL_STAFF'].includes(u.role)
                );
                setStaffList(onlyStaff);
            } catch (err) {
                console.error('Failed to fetch staff:', err);
                setStaffList([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, [token]);

    const hotelStaffCount = staffList.filter((u) => u.role === 'HOTEL_STAFF').length;


    const handleResendInvite = async (e, member) => {
        e.stopPropagation();
        try {
            await axios.post(
                `http://127.0.0.1:8000/api/accounts/admin/staff/${member.id}/resend-invite/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`Fresh invitation link sent to ${member.email}`);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to resend invitation.');
        }
    };


    const getDepartment = (role) => {
        if (role === 'ADMIN') return 'Operations';
        if (role === 'HOTEL_STAFF') return 'Hospitality';
        return 'Support';
    };

    const getRoleLabel = (role) => {
        if (role === 'ADMIN') return 'Administrator';
        if (role === 'HOTEL_STAFF') return 'Hotel Staff';
        return 'Staff';
    };

    const getFullName = (u) => {
        const name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        return name || u.email.split('@')[0];
    };

    const getInitials = (u) => {
        const f = u.first_name?.[0] || u.email?.[0] || 'S';
        const l = u.last_name?.[0] || '';
        return (f + l).toUpperCase();
    };

    // KPI Counts
    const totalStaff = staffList.length;
    const activeStaff = staffList.filter((u) => u.is_active).length;
    const inactiveStaff = staffList.filter((u) => !u.is_active && !u.is_invite_pending).length;
    const suspendedStaff = 0;
    const adminCount = staffList.filter((u) => u.role === 'ADMIN').length;

    const filteredStaff = staffList.filter((u) => {
        const matchesSearch =
            getFullName(u).toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `STF${String(u.id).padStart(3, '0')}`.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusTab === 'All' ||
            (statusTab === 'Active' && u.is_active) ||
            (statusTab === 'Pending' && u.is_invite_pending) ||
            (statusTab === 'Inactive' && !u.is_active && !u.is_invite_pending);

        const matchesDept =
            departmentFilter === 'ALL' || getDepartment(u.role) === departmentFilter;

        return matchesSearch && matchesStatus && matchesDept;
    });

    const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
    const paginatedStaff = filteredStaff.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleExportCSV = () => {
        const headers = ['Staff ID', 'Name', 'Email', 'Department', 'Role', 'Status', 'Last Active'];
        const rows = filteredStaff.map((u) => [
            `STF${String(u.id).padStart(3, '0')}`,
            getFullName(u),
            u.email,
            getDepartment(u.role),
            getRoleLabel(u.role),
            u.is_invite_pending ? 'Pending' : u.is_active ? 'Active' : 'Inactive',
            formatLastActive(u.last_login),
        ]);
        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', 'friday_retreats_staff.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const formatLastActive = (dateStr) => {
        if (!dateStr) return 'Never';
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Top Bar */}
            <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-[#5a1c1d]">Friday Retreats Admin</h2>
                <div className="relative">
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-9 pr-4 py-1.5 text-[12px] bg-[#f8f6f5] border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a1c1d] w-56"
                    />
                </div>
            </header>

            <main className="p-8 max-w-6xl w-full mx-auto">
                {/* Title & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Staff Management
                        </h1>
                        <p className="text-[12px] text-gray-500 mt-0.5">
                            Manage staff accounts, roles, access, and operational responsibilities.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-semibold text-[#5a1c1d] bg-white border border-[#5a1c1d]/30 rounded-lg hover:bg-[#fdf6f6] transition cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Staff List
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/admin/staff/invite')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-white bg-[#5a1c1d] hover:bg-[#451415] rounded-lg transition cursor-pointer"
                        >
                            <span>+</span>
                            <span>Add Staff</span>
                        </button>
                    </div>
                </div>

                {/* 5 KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-[#ece6e2] p-4 shadow-xs">
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 mb-2">
                            Total Staff
                        </p>
                        <p className="text-2xl font-bold text-gray-900">{totalStaff}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-[#ece6e2] p-4 shadow-xs">
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 mb-2">
                            Active Staff
                        </p>
                        <p className="text-2xl font-bold text-[#9e2a2b]">{activeStaff}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-[#ece6e2] p-4 shadow-xs">
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 mb-2">
                            Inactive Staff
                        </p>
                        <p className="text-2xl font-bold text-gray-700">{inactiveStaff}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-[#ece6e2] p-4 shadow-xs">
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 mb-2">
                            Suspended Staff
                        </p>
                        <p className="text-2xl font-bold text-red-600">{suspendedStaff}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-[#ece6e2] p-4 shadow-xs">
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 mb-2">
                            Hotel Staff
                        </p>
                        <p className="text-2xl font-bold text-[#5a1c1d]">{hotelStaffCount}</p>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl border border-[#ece6e2] shadow-xs overflow-hidden">
                    {/* Filter Toolbar */}
                    <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {STATUS_TABS.map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => {
                                        setStatusTab(tab);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition cursor-pointer ${
                                        statusTab === tab
                                            ? 'bg-[#f4e6e6] text-[#5a1c1d] font-semibold'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={departmentFilter}
                                onChange={(e) => {
                                    setDepartmentFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-1.5 text-[12px] text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a1c1d]"
                            >
                                <option value="ALL">Department</option>
                                <option value="Operations">Operations</option>
                                <option value="Hospitality">Hospitality</option>
                                <option value="Support">Support</option>
                            </select>

                            <div className="relative">
                                <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search staff..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-8 pr-3 py-1.5 text-[12px] bg-[#f8f6f5] border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a1c1d] w-48"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Staff Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f9f7f6] border-b border-gray-200/70 text-[10px] font-bold tracking-wider uppercase text-gray-500">
                                    <th className="py-3.5 px-6">Staff</th>
                                    <th className="py-3.5 px-6">Staff ID</th>
                                    <th className="py-3.5 px-6">Department</th>
                                    <th className="py-3.5 px-6">Role</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6">Joined</th>
                                    <th className="py-3.5 px-6">Last Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-[13px]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-400">
                                            Loading staff directory...
                                        </td>
                                    </tr>
                                ) : paginatedStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-400">
                                            No staff members found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedStaff.map((member) => (
                                    <tr
                                        key={member.id}
                                        onClick={() => navigate(`/admin/users/${member.id}`, { state: { user: member } })}
                                        className="hover:bg-[#fcf9f8] transition cursor-pointer"
                                    >
                                        {/* Staff */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[#f4d8d6] text-[#5a1c1d] font-bold text-[12px] flex items-center justify-center shrink-0">
                                                    {getInitials(member)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 leading-tight">
                                                        {getFullName(member)}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Staff ID */}
                                        <td className="py-4 px-6 text-[12px] font-medium text-gray-600">
                                            STF{String(member.id).padStart(3, '0')}
                                        </td>

                                        {/* Department */}
                                        <td className="py-4 px-6 text-[12px] text-gray-700">
                                            {getDepartment(member.role)}
                                        </td>

                                        {/* Role */}
                                        <td className="py-4 px-6 text-[12px] text-gray-700">
                                            {getRoleLabel(member.role)}
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-6">
                                            {member.is_invite_pending ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        Pending
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleResendInvite(e, member)}
                                                        className="text-[11px] font-semibold text-[#5a1c1d] hover:underline cursor-pointer"
                                                    >
                                                        Resend
                                                    </button>
                                                </div>
                                            ) : member.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fdf2f2] text-[#9e2a2b]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#9e2a2b]" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        {/* Joined */}
                                        <td className="py-4 px-6 text-[12px] text-gray-500">
                                            {member.date_joined
                                                ? new Date(member.date_joined).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                                : '—'}
                                        </td>

                                        {/* Last Active */}
                                        <td className="py-4 px-6 text-[12px] text-gray-500">
                                            {formatLastActive(member.last_login)}
                                        </td>
                                    </tr>
                                ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-500">
                        <span>
                            Showing {filteredStaff.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
                            {Math.min(currentPage * pageSize, filteredStaff.length)} of {filteredStaff.length}{' '}
                            entries
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                            >
                                &lsaquo;
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 flex items-center justify-center rounded text-[12px] font-medium cursor-pointer ${
                                        currentPage === page
                                            ? 'bg-[#5a1c1d] text-white'
                                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
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

export default AdminStaffManagement;