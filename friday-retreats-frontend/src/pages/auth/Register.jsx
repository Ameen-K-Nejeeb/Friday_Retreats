import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import { useGoogleLogin } from '@react-oauth/google';

const Register = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (!agreedToTerms) {
      return setError("You must agree to the Terms of Service.");
    }

    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/accounts/register/", {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone_number: phone.trim(),
        password,
      });
      navigate("/verify-email-otp", {
        state: { email: email.trim().toLowerCase() },
      });
    } catch (err) {
      const errorData = err.response?.data;
      let errorMsg = "Registration failed. Please check your details.";
      if (errorData) {
        if (errorData.email) errorMsg = errorData.email[0];
        else if (errorData.phone_number) errorMsg = errorData.phone_number[0];
        else if (errorData.password) errorMsg = errorData.password[0];
        else if (typeof errorData === "string") errorMsg = errorData;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      dispatch(googleLoginUser(tokenResponse.access_token));
    },
    onError: () => {
      console.error("Google Sign-In failed");
    },
  });

  return (
    <div className="flex min-h-screen w-full font-sans bg-white">
      {/* Left Form Pane */}
      <div className="flex flex-col items-center w-full lg:w-[45%] pt-16 px-8 lg:px-20 overflow-y-auto">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <div className="text-2xl font-bold text-[#6a2020] mb-6">fr</div>
            <h1 className="text-[28px] font-bold text-[#111827] mb-2">
              Create Account
            </h1>
            <p className="text-[14px] text-gray-500 leading-relaxed">
              Join Friday Retreats to unlock exclusive
              <br />
              access.
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Register Heading */}
          <div className="w-full border-b-2 border-[#6a2020] mb-6">
            <h2 className="text-center pb-2 text-[13px] font-semibold text-[#6a2020]">
              Register
            </h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 text-[14px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 placeholder-gray-400"
              />
              <input
                type="text"
                required
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 text-[14px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 placeholder-gray-400"
              />
            </div>

            {/* Email Address */}
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-[14px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 placeholder-gray-400"
            />

            {/* Phone Number */}
            <input
              type="tel"
              required
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 text-[14px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 placeholder-gray-400"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-[14px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 placeholder-gray-400 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 text-[14px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 placeholder-gray-400 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 border-gray-300 rounded text-[#6a2020] focus:ring-[#6a2020]"
              />
              <label className="ml-2 text-[12px] text-gray-600">
                I agree to the{" "}
                <span className="text-[#6a2020] font-medium cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-[#6a2020] font-medium cursor-pointer">
                  Privacy Policy
                </span>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 text-[13px] text-white transition rounded-md bg-[#5a1c1d] hover:bg-[#451415] disabled:opacity-70 font-medium cursor-pointer"
            >
              {loading ? "Processing..." : "Create Account"}
            </button>
          </form>

          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] text-gray-400 uppercase tracking-wider">
              Or continue with
            </span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            className="flex items-center justify-center w-full py-3 text-[13px] font-medium text-gray-600 transition bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <p className="mt-8 text-[12px] text-center text-gray-500 pb-10">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#6a2020] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Maroon Pane */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-end p-20 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at center, #4b1717 0%, #3a1111 100%)",
        }}
      >
        <div className="relative z-10 max-w-[480px] mb-12">
          <p className="text-[32px] leading-snug text-[#fdfcfb] font-serif mb-10">
            "A sanctuary of modernist calm, designed for those who seek the
            extraordinary in the everyday."
          </p>
          <p className="text-[11px] font-bold text-[#d4c3b3] tracking-[0.2em] uppercase">
            The Friday Retreats Experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
