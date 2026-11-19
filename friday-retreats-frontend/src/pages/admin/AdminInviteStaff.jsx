import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const AdminInviteStaff = () => {
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [role, setRole] = useState('HOTEL_STAFF');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSendInvitation = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await axios.post(
                'http://127.0.0.1:8000/api/accounts/admin/staff/invite/',
                {
                    full_name: fullName.trim(),
                    email: email.trim().toLowerCase(),
                    phone_number: phoneNumber.trim(),
                    role,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate('/admin/staff', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send invitation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8f9fb] p-8">
            <div className="max-w-5xl w-full mx-auto">
                {/* Top Breadcrumb & Node Status */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div className="text-[12px] text-gray-400 flex items-center gap-2">
                        <Link to="/admin/staff" className="hover:text-[#5a1c1d]">
                            Staff Management
                        </Link>
                        <span>/</span>
                        <span className="text-gray-700 font-semibold">Invite Staff</span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-[10px] font-semibold tracking-wider uppercase text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Node: Friday Retreats Portal
                    </div>
                </div>

                {/* Page Heading */}
                <div className="flex items-start gap-3.5 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[#eef2fb] text-[#5a1c1d] flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Invite Hotel Staff
                        </h1>
                        <p className="text-[13px] text-gray-500 mt-0.5">
                            Send a secure onboarding link to a new property manager or front desk agent.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="max-w-[600px] bg-white rounded-2xl border border-gray-200/80 shadow-[0_6px_25px_rgba(0,0,0,0.03)] p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-[15px] font-bold text-gray-900">
                                Personal Information
                            </h2>
                            <p className="text-[12px] text-gray-400 mt-0.5">
                                Enter contact coordinates for credentials creation and dispatch.
                            </p>
                        </div>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                            Step 01 / 02
                        </span>
                    </div>

                    {error && (
                        <div className="p-3 mb-5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSendInvitation} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="John Mathew"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 text-[13px] bg-[#eef3fc] border border-transparent rounded-lg focus:outline-none focus:border-[#5a1c1d]/40 focus:bg-white transition placeholder-gray-400"
                            />
                        </div>

                        {/* Email Address */}
                        <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="john@kochigateway.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 text-[13px] bg-[#eef3fc] border border-transparent rounded-lg focus:outline-none focus:border-[#5a1c1d]/40 focus:bg-white transition placeholder-gray-400"
                            />
                            <p className="text-[11px] text-gray-400 mt-1.5">
                                We will send the secure password-setup credentials to this address.
                            </p>
                        </div>

                        {/* Phone Number & Role */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+91 98470 12345"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-4 py-3 text-[13px] bg-[#eef3fc] border border-transparent rounded-lg focus:outline-none focus:border-[#5a1c1d]/40 focus:bg-white transition placeholder-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-500 mb-2">
                                    Staff Role
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-3 text-[13px] bg-[#eef3fc] border border-transparent rounded-lg focus:outline-none focus:border-[#5a1c1d]/40 focus:bg-white transition text-gray-800"
                                >
                                    <option value="HOTEL_STAFF">Hotel Staff</option>
                                    <option value="STAFF">General Staff</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/staff')}
                                className="text-[12px] font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <div className="flex items-center gap-4">
                                <p className="text-[11px] text-gray-400 text-right hidden sm:block max-w-[180px] leading-snug">
                                    User will receive an email to activate their account.
                                </p>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-semibold text-white bg-[#4a1516] hover:bg-[#380f10] disabled:opacity-60 rounded-lg transition cursor-pointer"
                                >
                                    <span>{loading ? 'Sending...' : 'Send Invitation'}</span>
                                    {!loading && (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminInviteStaff;