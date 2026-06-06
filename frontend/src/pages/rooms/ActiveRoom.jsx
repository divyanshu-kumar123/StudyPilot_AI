import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Send, Users, ArrowLeft, Copy, Check } from 'lucide-react';
import { roomService } from '../../services/room.service';
import Loader from '../../components/common/Loader';

const ActiveRoom = () => {
    const { roomCode } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    
    const [room, setRoom] = useState(location.state?.room || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [copied, setCopied] = useState(false);
    
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        let currentSocket;

        const initializeRoom = async () => {
            try {
                // If we navigated here directly via URL, fetch room data
                let currentRoom = room;
                if (!currentRoom) {
                    currentRoom = await roomService.joinRoom(roomCode);
                    setRoom(currentRoom);
                }

                // Fetch chat history
                const history = await roomService.getRoomHistory(currentRoom._id);
                setMessages(history);

                // Extract base URL from Axios configuration
                const baseURL = import.meta.env.VITE_API_URL.replace('/api/v1', '');
                
                // Initialize WebSocket Connection
                currentSocket = io(baseURL, {
                    withCredentials: true,
                });

                setSocket(currentSocket);

                // Join the specific room channel
                currentSocket.emit('join-room', roomCode);

                // Listen for incoming messages
                currentSocket.on('receive-message', (message) => {
                    setMessages((prev) => [...prev, message]);
                });

                // Listen for system notifications
                currentSocket.on('system-message', (sysMsg) => {
                    setMessages((prev) => [...prev, { ...sysMsg, messageType: 'system' }]);
                });

            } catch (error) {
                console.error("Room initialization failed", error);
                navigate('/rooms');
            }
        };

        initializeRoom();

        // Cleanup on unmount
        return () => {
            if (currentSocket) currentSocket.disconnect();
        };
    }, [roomCode, navigate]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            roomCode,
            roomId: room._id,
            senderId: user._id,
            senderName: user.fullName,
            message: newMessage.trim(),
        };

        // Fire and forget via WebSockets
        socket.emit('send-message', messageData);
        setNewMessage('');
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!room) return <Loader fullScreen text="Entering Study Room..." />;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 md:-m-8 bg-gray-50">
            {/* Room Header */}
            <div className="h-16 bg-surface border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/rooms')} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{room.roomName}</h1>
                        <p className="text-xs text-gray-500">{room.description || 'Active Study Session'}</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                        <Users className="h-4 w-4 mr-2" /> {room.members.length} Members
                    </div>
                    <button 
                        onClick={copyRoomCode}
                        className="flex items-center px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-sm font-bold tracking-wider transition-colors border border-primary-200"
                    >
                        Code: {roomCode}
                        {copied ? <Check className="h-4 w-4 ml-2 text-green-600" /> : <Copy className="h-4 w-4 ml-2" />}
                    </button>
                </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 overflow-hidden flex justify-center p-4">
                <div className="w-full max-w-4xl bg-surface border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                    
                    {/* Message Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                        {messages.map((msg, idx) => {
                            // Render System Messages
                            if (msg.messageType === 'system') {
                                return (
                                    <div key={idx} className="flex justify-center my-4">
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            {msg.message}
                                        </span>
                                    </div>
                                );
                            }

                            // Render User Messages
                            const isMe = msg.senderId?._id === user._id || msg.senderId === user._id;
                            
                            return (
                                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <span className="text-xs text-gray-500 mb-1 ml-1">
                                        {isMe ? 'You' : msg.senderId?.fullName || msg.senderName}
                                    </span>
                                    <div 
                                        className={`px-4 py-2.5 rounded-2xl max-w-[75%] shadow-sm ${
                                            isMe 
                                            ? 'bg-primary-600 text-white rounded-br-none' 
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all overflow-hidden">
                                <textarea 
                                    rows="1"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                    className="w-full max-h-32 px-4 py-3 bg-transparent border-none focus:ring-0 resize-none text-sm placeholder-gray-400"
                                    placeholder="Type a message... (Press Enter to send)"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ActiveRoom;