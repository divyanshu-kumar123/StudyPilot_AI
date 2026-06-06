import { createSlice } from '@reduxjs/toolkit';

// Helper to safely check local storage on boot
const getUserFromStorage = () => {
    try {
        const user = localStorage.getItem('user');
        console.log(user);
        return user ? JSON.parse(user) : null;
    } catch (e) {
        return null;
    }
};

const initialState = {
    user: getUserFromStorage(),
    accessToken: null,
    isAuthenticated: false,
    isLoading: true, // We start in a loading state until verifySession finishes
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            if (action.payload.user) {
                state.user = action.payload.user;
                localStorage.setItem('user', JSON.stringify(action.payload.user)); // Persist user profile
            }
            if (action.payload.accessToken) {
                state.accessToken = action.payload.accessToken;
            }
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            localStorage.removeItem('user'); // Clear profile on logout
        },
        setAuthLoading: (state, action) => {
            state.isLoading = action.payload;
        }
    }
});

export const { setCredentials, logout, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;