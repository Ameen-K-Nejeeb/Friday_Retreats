import { createSlice, createAsyncThunk, isRejectedWithValue} from '@reduxjs/toolkit'
import axios from 'axios'


const API_URL = 'http://127.0.0.1:8000/api/accounts/admin/login/';


export const adminLogin = createAsyncThunk('adminAuth/login', 
    async (credentials, { rejectWithValue}) => {
        try{
            const response = await axios.post(API_URL, credentials)
            localStorage.setItem('admin_access', response.data.access);
            localStorage.setItem('admin_refresh', response.data.refresh);
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Login failed');
        }
    }
);


const adminAuthSlice = createSlice({
    name : 'adminAuth', 
    initialState : {
        token : localStorage.getItem('admin_access') || null, 
        loading : false, 
        error : null, 
    }, 
    reducers : {
        adminLogout : (state) => {
            state.token = null;
            localStorage.removeItem('admin_access');
            localStorage.removeItem('admin_refresh');
        }
    },
    extraReducers : (builder) => {
        builder
            .addCase(adminLogin.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(adminLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access;
            })
            .addCase(adminLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload
            });
    }
});

export const { adminLogout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer