import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

const AdminUserDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { token, email: currentAdminEmail } = useSelector((state) => state.auth);

    const [user, setUser] = useState(location.state?.user || null);
    const [loading, setLoading] = useState(!location.state?.user);

    // Edit Modal State
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        role: 'USER',
        fr_coins_balance: 0,
        is_active: true,
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(
                    `http://127.0.0.1:8000/api/accounts/admin/users/${id}/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUser(res.data);
            } catch (err) {
                console.error('Failed to fetch user detail:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, token]);

    const openEditModal = () => {
        if (!user) return;
        setError(null);
        setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone_number: user.phone_number || '',
            role: user.role || 'USER',
            fr_coins_balance: user.fr_coins_balance ?? 0,
            is_active: user.is_active ?? true,
        });
        setIsEditing(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const payload = { ...formData };
        if (payload.role !== 'USER') {
            delete payload.fr_coins_balance;
        }

        try {
            const res = await axios.patch(
                `http://127.0.0.1:8000/api/accounts/admin/users/${id}/`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(res.data);
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update account.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!user || user.email === currentAdminEmail) return;

        const confirmed = window.confirm(
            `Permanently delete ${user.email}? This action cannot be undone.`
        );
        if (!confirmed) return;

        try {
            await axios.delete(
                `http://127.0.0.1:8000/api/accounts/admin/users/${user.id}/delete/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate(-1);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete account.');
        }
    };

    if (loading || !user) {
        return (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                Loading profile...
            </div>
        );
    }

    const isSelf = user.email === currentAdminEmail;
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
    const initials = ((user.first_name?.[0] || user.email[0]) + (user.last_name?.[0] || '')).toUpperCase();
    const roleLabel = (user.role || 'USER').replace('_', ' ');

    return (
        <div className="flex-1 flex flex-col">
            {/* Top Bar */}
            <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-[#5a1c1d]">Friday Retreats Admin</h2>
                <div className="text-[12px] text-gray-400">{roleLabel} Profile</div>
            </header>

            <main className="p-8 max-w-6xl w-full mx-auto">
                {/* Breadcrumb */}
                <div className="text-[12px] text-gray-400 mb-3 flex items-center gap-2">
                    <Link to="/admin/users" className="hover:text-[#5a1c1d]">People</Link>
                    <span>&rsaquo;</span>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="hover:text-[#5a1c1d] cursor-pointer"
                    >
                        {['STAFF', 'HOTEL_STAFF'].includes(user.role) ? 'Staff' : 'Customers'}
                    </button>
                    <span>&rsaquo;</span>
                    <span className="text-gray-800 font-medium">{fullName}</span>
                </div>

                {/* Title & Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                        <span className="text-[12px] text-gray-400">
                            (ID: FR-{String(user.id).padStart(5, '0')})
                        </span>
                        <span
                            className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${
                                user.is_active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-200 text-gray-600'
                            }`}
                        >
                            {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Delete (Left) + Edit (Right) */}
                    <div className="flex items-center gap-3">
                        {!isSelf && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Account
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={openEditModal}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-white bg-[#5a1c1d] hover:bg-[#451415] rounded-lg transition cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit {roleLabel}
                        </button>
                    </div>
                </div>

                {/* 2-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full bg-[#f47c75] text-[#4a1516] font-bold text-xl flex items-center justify-center shrink-0">
                                    {initials}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">{fullName}</h3>
                                    <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-semibold bg-[#f4e6e6] text-[#5a1c1d] rounded-full">
                                        {roleLabel} &bull; {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 text-[12px] text-gray-600 pb-6 border-b border-gray-100">
                                <p className="truncate">{user.email}</p>
                                <p>{user.phone_number || 'No phone number added'}</p>
                                <p>
                                    Joined{' '}
                                    {user.date_joined
                                        ? new Date(user.date_joined).toLocaleDateString('en-US', {
                                              month: 'long',
                                              year: 'numeric',
                                          })
                                        : 'Recently'}
                                </p>
                            </div>

                            <div className="pt-5">
                                <p className="text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-2">
                                    Account Reference
                                </p>
                                <div className="p-3.5 rounded-xl bg-[#f9f6f5] border border-gray-200/70">
                                    <p className="text-[12px] font-semibold text-gray-800">{roleLabel}</p>
                                    <p className="text-[11px] text-gray-400">
                                        FR-MEM-{String(user.id).padStart(5, '0')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
                            <h4 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                                Personal Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-[12px]">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase text-gray-400">Role</p>
                                    <p className="font-medium text-gray-800 mt-0.5">{roleLabel}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase text-gray-400">Language</p>
                                    <p className="font-medium text-gray-800 mt-0.5">English</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
                                <p className="text-[11px] text-gray-500 mb-1">Total Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
                                <p className="text-[11px] text-gray-500 mb-1">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
                                <p className="text-[11px] text-gray-500 mb-1">Confirmed</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
                                <p className="text-[11px] text-gray-500 mb-1">Cancelled</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                            <div className="rounded-2xl border border-[#f2d0cd] p-5 shadow-xs bg-gradient-to-br from-[#fdeae8] to-[#f8d7d4]">
                                <p className="text-[11px] font-medium text-[#7a2e2e] mb-1">FR Coins</p>
                                <p className="text-2xl font-bold text-[#9e2a2b]">
                                    {(user.fr_coins_balance ?? 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
                                <p className="text-[11px] text-gray-500 mb-1">Total Spent</p>
                                <p className="text-2xl font-bold text-gray-900">₹0</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-900">Package History</h4>
                                <span className="text-[11px] font-semibold text-[#5a1c1d]">View All &rarr;</span>
                            </div>
                            <div className="p-8 text-center text-[13px] text-gray-400">
                                No bookings yet. Once the Bookings module is connected, retreat history will appear here.
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Edit Account</h3>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 mb-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a1c1d]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a1c1d]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a1c1d]"
                                />
                            </div>

                            <div className={formData.role === 'USER' ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1'}>
                                <div>
                                    <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={formData.role}
                                        disabled={isSelf}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a1c1d] disabled:bg-gray-100"
                                    >
                                        <option value="USER">Customer (User)</option>
                                        <option value="STAFF">Staff</option>
                                        <option value="HOTEL_STAFF">Hotel Staff</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>

                                {formData.role === 'USER' && (
                                    <div>
                                        <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                                            FR Coins
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.fr_coins_balance}
                                            onChange={(e) =>
                                                setFormData({ ...formData, fr_coins_balance: Number(e.target.value) })
                                            }
                                            className="w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a1c1d]"
                                        />
                                    </div>
                                )}
                            </div>

                            {user.role !== 'ADMIN' && (
                                <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded text-[#5a1c1d] focus:ring-[#5a1c1d]"
                                    />
                                    <span className="text-[13px] text-gray-700 font-medium">Account Active</span>
                                </label>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-[12px] font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 text-[12px] font-semibold text-white bg-[#5a1c1d] hover:bg-[#451415] disabled:opacity-60 rounded-lg transition cursor-pointer"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserDetail;