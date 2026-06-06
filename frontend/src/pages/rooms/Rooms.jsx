import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Plus, LogIn } from 'lucide-react';
import { roomService } from '../../services/room.service';
import Loader from '../../components/common/Loader';

const Rooms = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Create Room State
    const [roomName, setRoomName] = useState('');
    const [description, setDescription] = useState('');

    // Join Room State
    const [joinCode, setJoinCode] = useState('');

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const room = await roomService.createRoom(roomName, description);
            navigate(`/rooms/${room.roomCode}`, { state: { room } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create room.');
            setIsLoading(false);
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const room = await roomService.joinRoom(joinCode.toUpperCase());
            navigate(`/rooms/${room.roomCode}`, { state: { room } });
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired room code.');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Study Rooms</h1>
                <p className="text-gray-500 mt-1">Collaborate, chat, and learn together in real-time.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Room Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface p-8 rounded-3xl border border-gray-100 shadow-sm"
                >
                    <div className="h-12 w-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
                        <Plus className="h-6 w-6 text-primary-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Create a New Room</h2>
                    <p className="text-sm text-gray-500 mb-6">Start a new collaborative session and invite your friends.</p>
                    
                    <form onSubmit={handleCreateRoom} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                            <input 
                                type="text" 
                                required
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                placeholder="e.g. CS1A Exam Prep"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <input 
                                type="text" 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                placeholder="What are we studying?"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading || !roomName}
                            className="w-full py-3 mt-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                        >
                            {isLoading ? <Loader size="sm" className="text-white" /> : 'Create Room'}
                        </button>
                    </form>
                </motion.div>

                {/* Join Room Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface p-8 rounded-3xl border border-gray-100 shadow-sm"
                >
                    <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                        <LogIn className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Join Existing Room</h2>
                    <p className="text-sm text-gray-500 mb-6">Enter a 6-character room code to join an active session.</p>
                    
                    <form onSubmit={handleJoinRoom} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Code</label>
                            <input 
                                type="text" 
                                required
                                maxLength={6}
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center text-2xl font-bold tracking-widest uppercase"
                                placeholder="XXXXXX"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading || joinCode.length !== 6}
                            className="w-full py-3 mt-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                        >
                            {isLoading ? <Loader size="sm" className="text-white" /> : 'Join Room'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Rooms;