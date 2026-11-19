import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Reset Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Live Security Criteria checks
    const hasMinLength = newPassword.length >= 8;
    const hasUpperAndNumber = /[A-Z]/.test(newPassword) && /\d/.test(newPassword);
    const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
    const allCriteriaMet = hasMinLength && hasUpperAndNumber && passwordsMatch;

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await axios.post('http://127.0.0.1:8000/api/accounts/forgot-password/', {
                email: email.trim().toLowerCase(),
            });
            setStep(2);
            setSuccessMessage(`A 6-digit recovery code has been sent to ${email.trim().toLowerCase()}.`);
        } catch (err) {
            setError(err.response?.data?.error || 'Could not find an account with this email.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(null);

        if (!allCriteriaMet) {
            return setError('Please satisfy all security criteria before updating your password.');
        }

        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/accounts/reset-password/', {
                email: email.trim().toLowerCase(),
                otp: otp.trim(),
                new_password: newPassword,
            });
            navigate('/login', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fb] font-sans text-gray-900">
            {/* Minimal Top Header */}
            <header className="w-full bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => (step === 2 ? setStep(1) : navigate('/login'))}
                    className="text-[#5a1c1d] hover:text-[#3e1213] p-1 cursor-pointer"
                    aria-label="Go back"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>

                <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#f4f6fb] border border-gray-200/70 flex items-center justify-center shadow-xs">
                        <span className="text-xs font-bold text-[#5a1c1d]">fr</span>
                    </div>
                    <span className="text-sm font-semibold text-[#5a1c1d] tracking-tight">
                        Forgot Password
                    </span>
                </div>

                {/* Spacer to keep title centered */}
                <div className="w-7" />
            </header>

            {/* Centered Card */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
                <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 px-8 py-10">
                    {/* Card Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-11 h-11 mb-4 rounded-xl bg-[#eef2fb]">
                            <span className="font-bold text-[#5a1c1d] text-sm">fr</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[#111827] mb-2 tracking-tight">
                            {step === 1 ? 'Forgot Password' : 'Reset Password'}
                        </h1>
                        <p className="text-[13px] text-gray-500 leading-relaxed max-w-[300px] mx-auto">
                            {step === 1
                                ? 'Enter your email address and we will send you a 6-digit recovery code.'
                                : 'Set a new, secure password for your Friday Retreats account.'}
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 mb-5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-3 mb-5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg">
                            {successMessage}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-semibold tracking-wider uppercase text-gray-500 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="ENTER YOUR EMAIL ADDRESS"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 text-[13px] bg-[#eef3fc] border border-transparent rounded-lg focus:outline-none focus:border-[#5a1c1d]/40 focus:bg-white transition placeholder-gray-400 placeholder:text-[11px] placeholder:tracking-wider"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 text-[13px] font-medium text-white bg-[#5a1c1d] hover:bg-[#451415] disabled:opacity-60 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>{loading ? 'Sending Code...' : 'Send Recovery Code'}</span>
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            {/* 6-Digit OTP Input */}
                            <div>
                                <label className="block text-[11px] font-semibold tracking-wider uppercase text-gray-500 mb-2">
                                    Verification Code (OTP)
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength="6"
                                    placeholder="ENTER 6-DIGIT CODE"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-4 py-3.5 text-[14px] tracking-[0.3em] text-center bg-[#eef3fc] border border-transparent rounded-lg focus:outline-none focus:border-[#5a1c1d]/40 focus:bg-white transition placeholder-gray-400 placeholder:text-[11px] placeholder:tracking-wider"
                                />
                            </div>

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

                            {/* Security Criteria Box */}
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
                                        <span
                                            className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                                hasMinLength
                                                    ? 'bg-green-600 border-green-600 text-white'
                                                    : 'border-gray-400'
                                            }`}
                                        >
                                            {hasMinLength && (
                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        <span className={hasMinLength ? 'text-gray-900 font-medium' : ''}>
                                            At least 8 characters long
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <span
                                            className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                                hasUpperAndNumber
                                                    ? 'bg-green-600 border-green-600 text-white'
                                                    : 'border-gray-400'
                                            }`}
                                        >
                                            {hasUpperAndNumber && (
                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        <span className={hasUpperAndNumber ? 'text-gray-900 font-medium' : ''}>
                                            Contains uppercase letter &amp; number
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <span
                                            className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                                passwordsMatch
                                                    ? 'bg-green-600 border-green-600 text-white'
                                                    : 'border-gray-400'
                                            }`}
                                        >
                                            {passwordsMatch && (
                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        <span className={passwordsMatch ? 'text-gray-900 font-medium' : ''}>
                                            Both passwords match
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !allCriteriaMet || otp.length < 6}
                                className="w-full py-3.5 text-[13px] font-medium text-white bg-[#5a1c1d] hover:bg-[#451415] disabled:opacity-60 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
                                {!loading && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Cancel Link */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#5a1c1d] hover:underline"
                        >
                            <span>&larr;</span>
                            <span>Cancel and return to Sign In</span>
                        </Link>
                    </div>

                    {/* SSL Badge */}
                    <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Encrypted &bull; 256-Bit SSL Protection</span>
                    </div>
                </div>

                {/* Page Footer */}
                <p className="mt-8 text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-400">
                    Friday Retreats &bull; Curated Alpine Sanctuaries
                </p>
            </main>
        </div>
    );
};

export default ForgotPassword;