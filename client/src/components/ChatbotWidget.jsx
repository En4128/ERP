import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';

const ChatbotWidget = () => {
    const { isChatOpen, toggleChat, messages, setMessages, clearMessages } = useChat();
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
            // Get auth token from localStorage
            const token = localStorage.getItem('token');

            // Send request with optional authentication
            const config = token ? {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            } : {};

            const res = await axios.post('http://localhost:5000/api/chatbot',
                { message: userQuery },
                config
            );

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
                        className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl w-[380px] h-[600px] rounded-[32px] shadow-2xl flex flex-col border border-white/20 dark:border-slate-700/50 overflow-hidden mb-6"
                    >
                        {/* Header */}
                        <div className="relative bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-5 flex justify-between items-center border-b border-white/20 dark:border-slate-700/50">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 dark:shadow-cyan-500/30">
                                        <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                            <img src="/icons8-chat-bot.gif" alt="Bot" className="w-full h-full object-cover dark:filter dark:brightness-110 dark:hue-rotate-15" />
                                        </div>
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-800 dark:text-white tracking-tight">Campus AI</h3>
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={clearMessages}
                                    title="Clear Chat History"
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-slate-400 hover:text-red-500"
                                >
                                    <Sparkles size={18} className="opacity-50" />
                                </button>
                                <button
                                    onClick={toggleChat}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors text-slate-500 dark:text-slate-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth bg-transparent">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-end max-w-[85%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {msg.sender === 'bot' && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1 flex-shrink-0">
                                                <img src="/icons8-chat-bot.gif" alt="Bot" className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm backdrop-blur-sm ${msg.sender === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/20'
                                            : msg.isError
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800 rounded-bl-none'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50 rounded-bl-none shadow-slate-200/50 dark:shadow-none'
                                            }`}>
                                            {msg.text}
                                            <div className={`text-[9px] mt-2 font-medium opacity-60 ${msg.sender === 'user' ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1">
                                            <img src="/icons8-chat-bot.gif" alt="Bot" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700/50 shadow-sm flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-white/20 dark:border-slate-700/50">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none px-6 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all pr-14 backdrop-blur-sm"
                                    placeholder="Ask anything..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className={`absolute right-2 p-2 rounded-xl transition-all duration-300 ${input.trim()
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95'
                                        : 'bg-transparent text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Send size={18} className={input.trim() ? "translate-x-0.5" : ""} />
                                </button>
                            </div>
                            <div className="text-center mt-3">
                                <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                                    <Sparkles size={10} className="text-indigo-500" />
                                    <span>Powered by <strong>Campus GenAI</strong></span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                layout
                onClick={toggleChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pointer-events-auto h-16 w-16 rounded-full shadow-2xl overflow-hidden relative group"
            >
                <div className={`absolute inset-0 transition-all duration-500 ${isChatOpen
                    ? 'bg-slate-900 dark:bg-slate-800 rotate-180'
                    : 'bg-white dark:bg-slate-800 border-2 border-white/20'
                    }`}>
                    {isChatOpen ? (
                        <div className="w-full h-full flex items-center justify-center text-white">
                            <X size={28} />
                        </div>
                    ) : (
                        <div className="w-full h-full p-0">
                            <img src="/icons8-chat-bot.gif" alt="Chat" className="w-full h-full object-cover dark:filter dark:brightness-110 dark:hue-rotate-15" />
                        </div>
                    )}
                </div>
            </motion.button>
        </div >
    );
};

export default ChatbotWidget;
