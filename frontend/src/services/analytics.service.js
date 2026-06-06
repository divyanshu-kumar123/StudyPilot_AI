import api from './api';

export const analyticsService = {
    getDashboard: async () => {
        const response = await api.get('/analytics/dashboard');
        return response.data.data; // Returns { analytics, recentProgress }
    }
};