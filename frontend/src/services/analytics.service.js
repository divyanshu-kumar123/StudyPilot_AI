import api from './api';

export const analyticsService = {
    getDashboard: async () => {
        const response = await api.get('/analytics/dashboard');
        return response.data.data; // Returns { analytics, recentProgress }
    },
    recordQuizAttempt: async (scoreData) => {
        const response = await api.post('/analytics/quiz-attempt', scoreData);
        return response.data.data;
    }
};