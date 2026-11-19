import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import villaBg from '../../assets/villa.jpg';

const VerifyEmailOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [timer, setTimer] = useState(300); // 5 minutes (matches backend expiry)

    const inputRefs = useRef([]);

    // Redirect back to register if accessed directly without an email
    useEffect(() => {
        if (!email) {
            navigate('/register', { replace: true });
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (seconds) => {
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleChange = (index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const updated = [...otpDigits];
        updated[index] = digit;
        setOtpDigits(updated);

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;

        const updated = ['', '', '', '', '', ''];
        pasted.split('').forEach((char, i) => {
            updated[i] = char;
        });
        setOtpDigits(updated);

        const nextIndex = Math.min(pasted.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const otpString = otpDigits.join('');

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await axios.post('http://127.0.0.1:8000/api/accounts/verify-otp/', {
                email,
                otp: otpString,
            });
            navigate('/login', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError(null);
        setSuccessMessage(null);
        setResending(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/accounts/resend-otp/', { email });
            setTimer(300);
            setOtpDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            setSuccessMessage('A new 6-digit verification code has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate a new code.');
        } finally {
            setResending(false);
        }
    };

    if (!email) return null;

    return (
        <div className="flex min-h-screen w-full font-sans bg-[#fdfbfa]">
            {/* Left Form Pane */}
            <div className="flex flex-col w-full lg:w-1/2 px-8 sm:px-14 lg:px-20 py-10">
                {/* Top-Left Brand Mark */}
                <div className="text-lg font-bold text-[#5a1c1d] tracking-tight">fr</div>

                {/* Centered Content */}
                <div className="flex-1 flex flex-col justify-center max-w-[400px] w-full mx-auto py-8">
                    <div className="mb-7">
                        <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight mb-2">
                            Verify Your Account
                        </h1>
                        <p className="text-[13px] text-gray-500 leading-relaxed">
                            To ensure your security, please verify your account using your registered email address.
                        </p>
                    </div>

                    {/* Email Address Active Tab */}
                    <div className="border-b border-gray-200 mb-6">
                        <div className="inline-block pb-2.5 px-2 text-[12px] font-semibold text-[#5a1c1d] border-b-2 border-[#5a1c1d]">
                            Email Address
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 mb-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-3 mb-4 text-xs text-green-700 bg-green-50 border border-green-200 rounded-md">
                            {successMessage}
                        </div>
                    )}

                    {/* Sent To Card */}
                    <div className="flex items-center justify-between px-4 py-3.5 mb-5 bg-[#f4efeb] border border-[#e8e0d9] rounded-lg">
                        <div className="min-w-0 pr-3">
                            <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-0.5">
                                Sent To
                            </p>
                            <p className="text-[13px] font-semibold text-gray-800 truncate">
                                {email}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#5a1c1d] hover:underline shrink-0 cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                        </button>
                    </div>

                    {/* Generate Code Button */}
                    <div className="mb-7">
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={resending}
                            className="px-6 py-2.5 text-[11px] font-semibold tracking-wider uppercase text-white bg-[#5a1c1d] hover:bg-[#451415] disabled:opacity-60 rounded-md transition cursor-pointer"
                        >
                            {resending ? 'Sending...' : 'Generate Code'}
                        </button>
                    </div>

                    {/* 6-Digit OTP Form */}
                    <form onSubmit={handleVerifyOtp}>
                        <label className="block text-[12px] font-medium text-gray-700 mb-3">
                            Enter 6-digit OTP
                        </label>

                        <div className="grid grid-cols-6 gap-2.5 mb-4" onPaste={handlePaste}>
                            {otpDigits.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    placeholder="•"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-full h-12 text-center text-base font-semibold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#5a1c1d] focus:ring-1 focus:ring-[#5a1c1d] placeholder-gray-400 transition"
                                />
                            ))}
                        </div>

                        {/* Timer & Resend Row */}
                        <div className="flex items-center justify-between text-[12px] mb-6">
                            <span className="text-gray-500">
                                {timer > 0 ? (
                                    <>
                                        Resend OTP in{' '}
                                        <span className="font-medium text-gray-700">
                                            {formatTime(timer)}
                                        </span>
                                    </>
                                ) : (
                                    'Code expired'
                                )}
                            </span>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={timer > 0 || resending}
                                className={`font-medium transition ${
                                    timer > 0
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-[#5a1c1d] hover:underline cursor-pointer'
                                }`}
                            >
                                Resend
                            </button>
                        </div>

                        {/* Verify OTP Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || otpString.length < 6}
                            className="w-full py-3.5 text-[11px] font-semibold tracking-wider uppercase text-white bg-[#5a1c1d] hover:bg-[#451415] disabled:opacity-60 rounded-md transition cursor-pointer"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Image Pane */}
            <div
                className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center flex-col justify-end p-14"
                style={{ backgroundImage: `url(${villaBg})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
                <div className="relative z-10 max-w-[460px]">
                    <p className="text-[32px] font-semibold leading-snug text-white mb-5 tracking-tight">
                        "A sanctuary of modernist calm, designed for those who seek the extraordinary in the everyday."
                    </p>
                    <p className="text-[11px] font-semibold text-white/75 tracking-[0.2em] uppercase">
                        The Friday Retreats Experience
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailOtp;