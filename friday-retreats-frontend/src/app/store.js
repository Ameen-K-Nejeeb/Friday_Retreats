import { configureStore } from '@reduxjs/toolkit';
import adminAuthReducer from '../features/auth/adminAuthSlice';

export const store = configureStore({
    reducer: {
        adminAuth: adminAuthReducer,
    },
});