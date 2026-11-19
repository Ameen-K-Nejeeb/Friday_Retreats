import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../features/auth/authSlice";
import loginBgImage from "../../assets/villa.jpg";

import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token, role } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (token && role) {
      switch (role) {
        case "ADMIN":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "HOTEL_STAFF":
          navigate("/hotel/dashboard", { replace: true });
          break;
        case "STAFF":
          navigate("/staff/dashboard", { replace: true });
          break;
        default:
          navigate("/home", { replace: true });
          break;
      }
    }
  }, [token, role, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email: email.trim().toLowerCase(), password }));
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
      {/* Left Image Pane */}
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${loginBgImage})` }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Right Login Pane */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8">
        <div className="w-full max-w-[380px]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-[42px] h-[42px] mb-5 border border-gray-200 rounded-lg shadow-sm">
              <span className="font-semibold text-gray-800 text-[13px]">
                fr
              </span>
            </div>
            <h1 className="text-[26px] font-bold text-gray-900 mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-[13px] text-gray-500">
              Sign in to access your Friday Retreats account.
            </p>
          </div>

          {error && (
            <div className="p-3 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                required
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 placeholder-gray-400 placeholder:text-[12px] placeholder:tracking-wide"
              />
            </div>
            <div>
              <input
                type="password"
                required
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 placeholder-gray-400 placeholder:text-[12px] placeholder:tracking-wide"
              />
            </div>

            <div className="flex items-center justify-between text-[13px] py-1">
              <label className="flex items-center text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mr-2 border-gray-300 rounded text-[#5a1c1d] focus:ring-[#5a1c1d]"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-[#6a2020] font-medium hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-[14px] text-white transition rounded-md bg-[#5a1c1d] hover:bg-[#451415] disabled:opacity-70 font-medium cursor-pointer"
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>

          <div className="relative flex items-center py-8">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] text-gray-400 uppercase tracking-widest">
              Or continue with
            </span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            className="flex items-center justify-center w-full py-3 mb-8 text-[13px] font-medium text-gray-700 transition bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            <svg className="w-[18px] h-[18px] mr-2" viewBox="0 0 24 24">
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

          <p className="text-[13px] text-center text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#6a2020] font-medium hover:underline"
            >
              Join FR Club
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
