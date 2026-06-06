import api from './api';

export const roomService = {
    createRoom: async (roomName, description) => {
        const response = await api.post('/rooms/create', { roomName, description });
        return response.data.data;
    },
    joinRoom: async (roomCode) => {
        const response = await api.post('/rooms/join', { roomCode });
        return response.data.data;
    },
    getRoomHistory: async (roomId) => {
        const response = await api.get(`/rooms/${roomId}/messages`);
        return response.data.data;
    }
};