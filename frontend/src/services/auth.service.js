import api from './api';
import axios from 'axios'; // Add this import at the top

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data.data; 
    },
    register: async (fullName, email, password) => {
        const response = await api.post('/auth/register', { fullName, email, password });
        return response.data.data;
    },
    verifySession: async () => {
        // Use raw axios to prevent our custom interceptor from looping
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
            {},
            { withCredentials: true }
        );
        return response.data.data.accessToken;
    }
};