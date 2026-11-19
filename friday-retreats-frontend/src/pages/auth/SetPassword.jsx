import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';

const SetPassword = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const hasMinLength = newPassword.length >= 8;
    const hasUpperAndNumber = /[A-Z]/.test(newPassword) && /\d/.test(newPassword);
    const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
    const allCriteriaMet = hasMinLength && hasUpperAndNumber && passwordsMatch;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!allCriteriaMet) {
            return setError('Please satisfy all security criteria.');
        }

        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/accounts/set-password/', {
                uid,
                token,
                new_password: newPassword,
            });
            setSuccess(true);
            setTimeout(() => navigate('/login', { replace: true }), 2000);
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    'This invitation link is invalid or has expired.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fb] font-sans text-gray-900">
            {/* Minimal Top Header */}
            <header className="w-full bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-center">
                <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#f4f6fb] border border-gray-200/70 flex items-center justify-center shadow-xs">
                        <span className="text-xs font-bold text-[#5a1c1d]">fr</span>
                    </div>
                    <span className="text-sm font-semibold text-[#5a1c1d] tracking-tight">
                        Staff Account Activation
                    </span>
                </div>
            </header>

            {/* Centered Card */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
                <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 px-8 py-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-11 h-11 mb-4 rounded-xl bg-[#eef2fb]">
                            <span className="font-bold text-[#5a1c1d] text-sm">fr</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[#111827] mb-2 tracking-tight">
                            Set Your Password
                        </h1>
                        <p className="text-[13px] text-gray-500 leading-relaxed max-w-[300px] mx-auto">
                            Create a secure password to activate your Friday Retreats staff account.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 mb-5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="p-5 text-center bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-sm font-semibold text-green-800 mb-1">
                                Account Activated!
                            </p>
                            <p className="text-xs text-green-700">
                                Redirecting you to the Sign In page...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* New Password */}
                            <div>
                                <label className="block text-[11px] font-semibold tracking-wider uppercase text-gray-500 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        required
                                        placeholder="ENTER NEW PASSWORD"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3.5 pr-11 text-[13px] bg-[#eef3fc] border border-transparent rounded-lg focus:outline-none focus:border-[#5a1c1d]/40 focus:bg-white transition placeholder-gray-400 placeholder:text-[11px] placeholder:tracking-wider"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-700 cursor-pointer"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-[11px] font-semibold tracking-wider uppercase text-gray-500 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        placeholder="RE-ENTER NEW PASSWORD"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3.5 pr-11 text-[13px] bg-[#eef3fc] border border-transparent rounded-lg focus:outline-none focus:border-[#5a1c1d]/40 focus:bg-white transition placeholder-gray-400 placeholder:text-[11px] placeholder:tracking-wider"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-700 cursor-pointer"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Security Criteria */}
                            <div className="bg-[#e8effd] rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-bold tracking-wider uppercase text-gray-600">
                                        Security Criteria
                                    </span>
                                    <span
                                        className={`text-[11px] font-semibold ${
                                            allCriteriaMet ? 'text-green-700' : 'text-gray-500'
                                        }`}
                                    >
                                        {allCriteriaMet ? 'Ready' : 'Pending'}
                                    </span>
                                </div>
                                <ul className="space-y-2 text-[12px] text-gray-600">
                                    <li className="flex items-center gap-2.5">
                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${hasMinLength ? 'bg-green-600 border-green-600 text-white' : 'border-gray-400'}`}>
                                            {hasMinLength && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                        </span>
                                        <span className={hasMinLength ? 'text-gray-900 font-medium' : ''}>At least 8 characters long</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${hasUpperAndNumber ? 'bg-green-600 border-green-600 text-white' : 'border-gray-400'}`}>
                                            {hasUpperAndNumber && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                        </span>
                                        <span className={hasUpperAndNumber ? 'text-gray-900 font-medium' : ''}>Contains uppercase letter &amp; number</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${passwordsMatch ? 'bg-green-600 border-green-600 text-white' : 'border-gray-400'}`}>
                                            {passwordsMatch && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                        </span>
                                        <span className={passwordsMatch ? 'text-gray-900 font-medium' : ''}>Both passwords match</span>
                                    </li>
                                </ul>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !allCriteriaMet}
                                className="w-full py-3.5 text-[13px] font-medium text-white bg-[#5a1c1d] hover:bg-[#451415] disabled:opacity-60 rounded-lg transition cursor-pointer"
                            >
                                {loading ? 'Activating Account...' : 'Set Password & Activate'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-[12px] font-semibold text-[#5a1c1d] hover:underline">
                            &larr; Return to Sign In
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SetPassword;