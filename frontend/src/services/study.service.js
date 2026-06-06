import api from './api';

export const studyService = {
    generateQuiz: async (documentId, options = { difficulty: 'intermediate', totalQuestions: 5 }) => {
        const response = await api.post(`/study/${documentId}/quiz`, options);
        return response.data.data;
    },
    generateFlashcards: async (documentId, options = { difficulty: 'medium', count: 10 }) => {
        const response = await api.post(`/study/${documentId}/flashcards`, options);
        return response.data.data;
    },
    generateNotes: async (documentId, options = { noteType: 'summary' }) => {
        const response = await api.post(`/study/${documentId}/notes`, options);
        return response.data.data;
    },
    generateKnowledgeGraph: async (documentId) => {
        const response = await api.post(`/study/${documentId}/graph`);
        return response.data.data;
    },
    getKnowledgeGraph: async (documentId) => {
        const response = await api.get(`/study/${documentId}/graph`);
        return response.data.data;
    }
};