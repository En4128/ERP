import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';

const ChatbotWidget = () => {
    const { isChatOpen, toggleChat } = useChat();
    const [messages, setMessages] = useState([
        { text: 'Hi! I am the Campus Bot. 🤖\nHow can I help you today?', sender: 'bot', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isChatOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { text: input, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        const userQuery = input;
        setInput('');
        setIsTyping(true);

        try {
            const res = await axios.post('http://localhost:5000/api/chatbot', { message: userQuery });
            setMessages(prev => [...prev, { text: res.data.text, sender: 'bot', timestamp: new Date() }]);
        } catch (error) {
            console.error('Chatbot error:', error);
            let errorMsg = 'Sorry, I am having trouble connecting to the brain right now. Please try again later.';

            if (error.response) {
                const backendMsg = error.response.data?.message;
                const backendDetails = error.response.data?.details;

                if (backendMsg) {
                    errorMsg = `${backendMsg}${backendDetails ? ` (${backendDetails})` : ''}`;
                } else if (error.response.status === 500) {
                    errorMsg = 'My AI processor is offline. Please ask the admin to check the Google AI API Key.';
                } else if (error.response.status === 404) {
                    errorMsg = 'Connection failed (Error 404). Please ensure the server has been restarted to register new routes.';
                } else {
                    errorMsg = `An error occurred (Status ${error.response.status}). Please try again later.`;
                }
            } else if (error.request) {
                errorMsg = 'Cannot reach the server. Please check if the backend is running on port 5000.';
            }

            setMessages(prev => [...prev, { text: errorMsg, sender: 'bot', timestamp: new Date(), isError: true }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="pointer-events-auto bg-white dark:bg-slate-900 w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col border border-gray-100 dark:border-slate-700 overflow-hidden mb-4"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-md relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="flex items-center space-x-3 relative z-10">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 shadow-inner">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight">Campus Assistant</h3>
                                    <div className="flex items-center space-x-1.5 opacity-90">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-xs font-medium">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={toggleChat}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-slate-800/50 scroll-smooth">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-end max-w-[80%] space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${msg.sender === 'user'
                                            ? 'bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800'
                                            : 'bg-indigo-100 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800'
                                            }`}>
                                            {msg.sender === 'user' ? (
                                                <User size={14} className="text-purple-600 dark:text-purple-400" />
                                            ) : (
                                                <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
                                            )}
                                        </div>

                                        <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${msg.sender === 'user'
                                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-none'
                                            : msg.isError
                                                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800 rounded-bl-none'
                                                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-100 dark:border-slate-700 rounded-bl-none'
                                            }`}>
                                            {msg.text}
                                            <p className={`text-[10px] mt-1 opacity-70 ${msg.sender === 'user' ? 'text-indigo-100' : 'text-gray-400'}`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                                            <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-slate-700 shadow-sm flex space-x-1">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-300"></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700">
                            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-800 p-1.5 rounded-full border border-gray-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900 transition-shadow">
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent border-none px-4 py-2 text-sm focus:outline-none focus:ring-0 text-gray-700 dark:text-white placeholder-gray-400"
                                    placeholder="Type your message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className={`p-2 rounded-full transition-all duration-300 ${input.trim()
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:scale-105'
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Send size={18} className={input.trim() ? "translate-x-0.5" : ""} />
                                </button>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium flex items-center justify-center">
                                    <Sparkles size={10} className="mr-1 text-amber-400" /> Powered by Campus AI
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                layout
                onClick={toggleChat}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`pointer-events-auto p-4 rounded-full shadow-2xl transition-all duration-300 relative group overflow-hidden ${isChatOpen
                    ? 'bg-gray-100 text-gray-600 rotate-90 dark:bg-slate-800 dark:text-slate-300 border border-gray-200 dark:border-slate-600'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    }`}
            >
                {/* Button Glow Effect */}
                {!isChatOpen && (
                    <div className="absolute inset-0 bg-white/20 blur-lg rounded-full animate-pulse-slow"></div>
                )}

                <div className="relative z-10">
                    {isChatOpen ? <X size={24} /> : <MessageSquare size={24} className="fill-current" />}
                </div>

                {/* Badge for notifications if needed */}
                {!isChatOpen && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </motion.button>
        </div>
    );
};

export default ChatbotWidget;
