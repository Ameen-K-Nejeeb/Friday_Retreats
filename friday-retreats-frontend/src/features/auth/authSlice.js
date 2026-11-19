import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import {jwtDecode } from 'jwt-decode'

const API_URL = 'http://127.0.0.1:8000/api/accounts/login/';

export const loginUser = createAsyncThunk('auth/login',
    async (creadentials, {rejectWithValue }) => {
        try {
            const response = await axios.post(API_URL, creadentials);
            const {access, refresh} = response.data;

            localStorage.setItem('access', access);
            localStorage.setItem('refresh', refresh)

            const decodedToken = jwtDecode(access);

            return {
                token: access,
                role : decodedToken.role || 'USER',
                email : decodedToken.email, 
                frCoins : decodedToken.fr_coins_balance || 0
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Invalid email or password');
        }
    }
)

const initialState = {
    token : localStorage.getItem('access') || null, 
    role : null, 
    email : null , 
    frCoins : 0,
    loading : false, 
    error : null, 
};

if (initialState.token) {
    try {
        const decoded = jwtDecode(initialState.token);
        initialState.role = decoded.role;
        initialState.email = decoded.email;
        initialState.frCoins = decoded.fr_coins_balance;
    } catch (e) {
        localStorage.removeItem('access');
        initialState.token = null;
    }
}

const authSlice = createSlice({
    name : 'auth',
    initialState, 
    reducers : {
        logout : (state) => {
            state.token = null;
            state.role = null;
            state.email = null;
            state.frCoins = 0;
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
        }
    }, 
    extraReducers : (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token
                state.role = action.payload.role;
                state.email = action.payload.email;
                state.frCoins = action.payload.frCoins;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
})

export const {logout } = authSlice.actions;
export default authSlice.reducer