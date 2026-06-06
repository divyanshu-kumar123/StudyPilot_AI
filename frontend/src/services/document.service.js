import api from './api';

export const documentService = {
    uploadDocument: async (file) => {
        const formData = new FormData();
        formData.append('document', file);
        // Assuming title defaults to filename on backend, but we could append 'title' here too.

        const response = await api.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },
    
    getUserDocuments: async () => {
        const response = await api.get('/documents');
        return response.data.data;
    }
};