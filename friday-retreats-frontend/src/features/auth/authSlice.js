import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const LOGIN_URL = 'http://127.0.0.1:8000/api/accounts/login/';
const GOOGLE_AUTH_URL = 'http://127.0.0.1:8000/api/accounts/google-auth/';

// Safely restore session on page refresh
const getInitialAuthState = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return { token: null, role: null, email: null, frCoins: 0 };
    }
    try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh');
            return { token: null, role: null, email: null, frCoins: 0 };
        }
        return {
            token,
            role: decoded.role || null,
            email: decoded.email || null,
            frCoins: decoded.fr_coins_balance || 0,
        };
    } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        return { token: null, role: null, email: null, frCoins: 0 };
    }
};

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await axios.post(LOGIN_URL, { email, password });
            const { access, refresh } = response.data;
            const decoded = jwtDecode(access);

            localStorage.setItem('token', access);
            localStorage.setItem('refresh', refresh);

            return {
                token: access,
                role: decoded.role,
                email: decoded.email,
                frCoins: decoded.fr_coins_balance || 0,
            };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                'Invalid email or password'
            );
        }
    }
);

export const googleLoginUser = createAsyncThunk(
    'auth/googleLoginUser',
    async (accessToken, { rejectWithValue }) => {
        try {
            const response = await axios.post(GOOGLE_AUTH_URL, {
                access_token: accessToken,
            });
            const { access, refresh } = response.data;
            const decoded = jwtDecode(access);

            localStorage.setItem('token', access);
            localStorage.setItem('refresh', refresh);

            return {
                token: access,
                role: decoded.role,
                email: decoded.email,
                frCoins: decoded.fr_coins_balance || 0,
            };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.error || 'Google authentication failed.'
            );
        }
    }
);

const initialState = {
    ...getInitialAuthState(),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.token = null;
            state.role = null;
            state.email = null;
            state.frCoins = 0;
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('refresh');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Standard Email/Password Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.role = action.payload.role;
                state.email = action.payload.email;
                state.frCoins = action.payload.frCoins;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Google OAuth Login
            .addCase(googleLoginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleLoginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.role = action.payload.role;
                state.email = action.payload.email;
                state.frCoins = action.payload.frCoins;
            })
            .addCase(googleLoginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;