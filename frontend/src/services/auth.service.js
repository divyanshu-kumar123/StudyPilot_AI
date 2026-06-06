import api from './api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data.data; // Returns { user, accessToken }
    },
    register: async (fullName, email, password) => {
        const response = await api.post('/auth/register', { fullName, email, password });
        return response.data.data;
    },
    verifySession: async () => {
        // A simple call to refresh token endpoint checks if the secure cookie is still valid
        const response = await api.post('/auth/refresh-token');
        return response.data.data.accessToken;
    }
};