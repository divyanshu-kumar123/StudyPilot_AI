import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    // Adding middleware to ignore non-serializable data warnings in dev mode (useful for WebSockets later)
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});