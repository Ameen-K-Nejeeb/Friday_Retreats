import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const VerifyEmailOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('A 6-digit verification code has been sent to your email.');
    const [timer, setTimer] = useState(300); // 5 minutes

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
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/accounts/verify-otp/', {
                email,
                otp,
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
        try {
            await axios.post('http://127.0.0.1:8000/api/accounts/resend-otp/', { email });
            setTimer(300);
            setSuccessMessage('A new OTP has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend OTP.');
        }
    };

    if (!email) return null;

    return (
        <div className="flex min-h-screen w-full font-sans bg-white">
            {/* Left Form Pane */}
            <div className="flex flex-col justify-center items-center w-full lg:w-[45%] px-8 lg:px-20">
                <div className="w-full max-w-[400px]">
                    <div className="mb-8">
                        <div className="text-2xl font-bold text-[#6a2020] mb-6">fr</div>
                        <h1 className="text-[28px] font-bold text-[#111827] mb-2">Verify Your Email</h1>
                        <p className="text-[14px] text-gray-500 leading-relaxed">
                            Enter the 6-digit code sent to <br />
                            <strong className="text-gray-800">{email}</strong>
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-3 mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <input
                            type="text"
                            required
                            maxLength="6"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-4 py-3.5 text-center text-xl tracking-[0.5em] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 placeholder-gray-300"
                        />

                        <button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full py-3 text-[13px] text-white transition rounded-md bg-[#5a1c1d] hover:bg-[#451415] disabled:opacity-60 font-medium"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        {timer > 0 ? (
                            <p className="text-xs text-gray-500">
                                Resend code in <span className="font-semibold text-gray-900">{formatTime(timer)}</span>
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="text-xs font-medium text-[#6a2020] hover:underline"
                            >
                                Didn't receive the email? Resend OTP
                            </button>
                        )}
                    </div>

                    <p className="mt-8 text-[12px] text-center text-gray-500">
                        Wrong email?{' '}
                        <Link to="/register" className="font-medium text-[#6a2020] hover:underline">
                            Go back to Register
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Maroon Pane */}
            <div
                className="hidden lg:flex lg:w-[55%] flex-col justify-end p-20 relative overflow-hidden"
                style={{ background: 'radial-gradient(circle at center, #4b1717 0%, #3a1111 100%)' }}
            >
                <div className="relative z-10 max-w-[480px] mb-12">
                    <p className="text-[32px] leading-snug text-[#fdfcfb] font-serif mb-10">
                        "A sanctuary of modernist calm, designed for those who seek the extraordinary in the everyday."
                    </p>
                    <p className="text-[11px] font-bold text-[#d4c3b3] tracking-[0.2em] uppercase">
                        The Friday Retreats Experience
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailOtp;