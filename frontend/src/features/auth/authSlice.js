import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true, // Starts true until we verify the session on initial load
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            // Allows updating both, or just the token during a silent refresh
            if (action.payload.user) state.user = action.payload.user;
            if (action.payload.accessToken) state.accessToken = action.payload.accessToken;
            
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        },
        setAuthLoading: (state, action) => {
            state.isLoading = action.payload;
        }
    }
});

export const { setCredentials, logout, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;