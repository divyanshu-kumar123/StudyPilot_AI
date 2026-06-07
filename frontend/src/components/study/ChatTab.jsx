import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { studyService } from '../../services/study.service';

const ChatTab = ({ documentId }) => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'ai', content: "Hello! I've read this document. What would you like to know?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setInput('');
        
        // Add user message to UI immediately
        setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMsg }]);
        setIsTyping(true);

        try {
            const data = await studyService.chatWithDocument(documentId, userMsg);
            
            // Add AI response
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                role: 'ai', 
                content: data.reply 
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                role: 'ai', 
                content: "I'm sorry, I'm having trouble connecting to the server right now. Please try again." 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-surface rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-3">
                <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                    <Sparkles className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Document Assistant</h3>
                    <p className="text-xs text-gray-500 font-medium">Powered by Watsonx</p>
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-end space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-primary-100 text-primary-600'}`}>
                                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>

                            {/* Message Bubble */}
                            <div className={`max-w-[75%] px-5 py-3.5 shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-gray-800 text-white rounded-2xl rounded-br-sm' 
                                : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm prose prose-sm prose-p:leading-relaxed'
                            }`}>
                                {/* Simple text render. You can use dangerouslySetInnerHTML if you want to support markdown headers/bolding from the AI */}
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Realistic Typing Indicator */}
                {isTyping && (
                    <div className="flex items-end space-x-3 animate-fade-in">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                            <Bot className="h-4 w-4" />
                        </div>
                        {/* Fixed height bubble to prevent jumping */}
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 shadow-sm flex items-center space-x-1.5 h-[42px]">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all overflow-hidden relative">
                        <textarea 
                            rows="1"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            className="w-full max-h-32 px-4 py-3.5 bg-transparent border-none focus:ring-0 resize-none text-sm placeholder-gray-400 custom-scrollbar"
                            placeholder="Ask a question about this document..."
                            disabled={isTyping}
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="p-3.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex-shrink-0 shadow-sm"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-gray-400 font-medium">AI can make mistakes. Consider verifying important information.</span>
                </div>
            </div>
        </div>
    );
};

export default ChatTab;