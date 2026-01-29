import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import Layout from '../../components/Layout';
import { Search, Send, User, MessageSquare, MoreVertical, Paperclip, Smile, ShieldCheck, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommendedUsers, setRecommendedUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'contacts'
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [messageSearchQuery, setMessageSearchQuery] = useState('');
    const [showMessageSearch, setShowMessageSearch] = useState(false);
    const [uploadNotification, setUploadNotification] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(false);

    const socket = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user')) || { _id: '', name: '', role: '' };

    useEffect(() => {
        if (!currentUser._id) {
            console.error('Chat error: currentUser._id is missing. Redirecting or showing warning.');
            return;
        }

        // Initialize socket connection
        socket.current = io('http://localhost:5000');

        socket.current.emit('join', currentUser._id);

        socket.current.on('receive_message', (message) => {
            if (selectedUser && (message.sender === selectedUser._id || message.receiver === selectedUser._id)) {
                setMessages(prev => [...prev, message]);
                socket.current.emit('mark_as_read', message._id);
            }
            fetchConversations();
        });

        socket.current.on('message_sent', (message) => {
            if (selectedUser && message.receiver === selectedUser._id) {
                setMessages(prev => [...prev, message]);
            }
            fetchConversations();
        });

        fetchConversations();
        fetchRecommendedUsers();

        return () => {
            socket.current.disconnect();
        };
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/chat/conversations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setLoading(false);
        }
    };

    const fetchRecommendedUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/chat/recommended', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendedUsers(res.data);
        } catch (error) {
            console.error('Error fetching recommended users:', error);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/chat/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        fetchMessages(user._id);
        setActiveTab('chats');
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const messageData = {
            sender: currentUser._id,
            receiver: selectedUser._id,
            content: newMessage
        };

        socket.current.emit('send_message', messageData);
        setNewMessage('');
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/chat/search?q=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(res.data);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleEmojiClick = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!selectedUser) {
            setUploadNotification({
                type: 'error',
                message: 'Please select a user first'
            });
            setTimeout(() => setUploadNotification(null), 3000);
            return;
        }

        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            setUploadNotification({
                type: 'error',
                message: 'File size exceeds 50MB limit'
            });
            setTimeout(() => setUploadNotification(null), 3000);
            return;
        }

        try {
            setUploadProgress(true);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('receiverId', selectedUser._id);
            formData.append('content', newMessage);

            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/chat/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Emit via socket for real-time delivery
            socket.current.emit('send_message', {
                sender: currentUser._id,
                receiver: selectedUser._id,
                content: newMessage,
                messageType: res.data.messageType,
                fileUrl: res.data.fileUrl,
                fileName: res.data.fileName,
                fileType: res.data.fileType,
                fileSize: res.data.fileSize
            });

            setNewMessage('');
            setUploadProgress(false);

            // Show success notification
            setUploadNotification({
                type: 'success',
                message: `File "${file.name}" uploaded successfully!`
            });
            setTimeout(() => setUploadNotification(null), 3000);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('File upload error:', error);
            setUploadProgress(false);
            setUploadNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to upload file'
            });
            setTimeout(() => setUploadNotification(null), 3000);
        }
    };

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };

    const toggleOptionsMenu = () => {
        setShowOptionsMenu(prev => !prev);
    };

    const getFileIcon = (fileType) => {
        if (!fileType) return '📄';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('pdf')) return '📕';
        if (fileType.includes('video')) return '🎥';
        if (fileType.includes('audio')) return '🎵';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
        return '📄';
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const toggleMessageSearch = () => {
        setShowMessageSearch(prev => !prev);
        setMessageSearchQuery('');
    };

    const handleClearChat = async () => {
        if (!selectedUser) return;

        const confirmed = window.confirm(`Are you sure you want to clear all messages with ${selectedUser.name}? This action cannot be undone.`);

        if (!confirmed) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/chat/${selectedUser._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Clear messages from UI
            setMessages([]);
            setShowOptionsMenu(false);

            // Show success notification
            setUploadNotification({
                type: 'success',
                message: 'Chat cleared successfully'
            });
            setTimeout(() => setUploadNotification(null), 3000);

            // Refresh conversations list
            fetchConversations();
        } catch (error) {
            console.error('Clear chat error:', error);
            setUploadNotification({
                type: 'error',
                message: 'Failed to clear chat'
            });
            setTimeout(() => setUploadNotification(null), 3000);
        }
    };

    return (
        <Layout role={currentUser.role}>
            {!currentUser._id ? (
                <div className="max-w-[1400px] mx-auto h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
                    <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-full">
                        <ShieldCheck size={48} className="text-rose-500" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Session Incomplete</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm">Your profile data is missing from the local storage. Please sign out and sign in again to enable chat.</p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            navigate('/login');
                        }}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
                    >
                        Re-login Now
                    </button>
                </div>
            ) : (
                <div className="max-w-[1400px] mx-auto h-[calc(100vh-140px)] flex bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">

                    {/* Sidebar */}
                    <div className={`w-full md:w-[400px] flex flex-col border-r border-slate-200 dark:border-slate-800 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">Messages</h2>
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                    <MessageSquare size={20} />
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                                <button
                                    onClick={() => setActiveTab('chats')}
                                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'chats' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Chats
                                </button>
                                <button
                                    onClick={() => setActiveTab('contacts')}
                                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'contacts' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'}`}
                                >
                                    {currentUser.role === 'student' ? 'Faculty' : 'Students'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-6">
                            {activeTab === 'chats' ? (
                                <div className="space-y-1">
                                    {loading ? (
                                        [1, 2, 3].map(i => (
                                            <div key={i} className="p-4 flex gap-4 animate-pulse">
                                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                                                <div className="flex-1 space-y-2 py-1">
                                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : searchQuery && searchResults.length > 0 ? (
                                        searchResults.map(user => (
                                            <button
                                                key={user._id}
                                                onClick={() => handleSelectUser(user)}
                                                className="w-full p-4 flex items-center gap-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300"
                                            >
                                                <div className="relative">
                                                    <img src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" alt="" />
                                                    <div className="absolute right-0 bottom-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                                                </div>
                                                <div className="flex-1 text-left overflow-hidden">
                                                    <h4 className="font-black text-slate-800 dark:text-white truncate">{user.name}</h4>
                                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{user.role}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : conversations.length > 0 ? (
                                        conversations.map((conv, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelectUser(conv.user)}
                                                className={`w-full p-4 flex items-center gap-4 rounded-3xl transition-all duration-300 ${selectedUser?._id === conv.user._id ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                            >
                                                <div className="relative flex-shrink-0">
                                                    <img src={`https://ui-avatars.com/api/?name=${conv.user.name}&background=6366f1&color=fff`} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" alt="" />
                                                    {conv.unread && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h4 className="font-black text-slate-800 dark:text-white truncate text-sm">{conv.user.name}</h4>
                                                        <span className="text-[10px] font-bold text-slate-400">{format(new Date(conv.lastMessageDate), 'HH:mm')}</span>
                                                    </div>
                                                    <p className={`text-xs truncate ${conv.unread ? 'font-black text-slate-900 dark:text-white' : 'font-medium text-slate-500'}`}>
                                                        {conv.lastMessage}
                                                    </p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-10 text-center space-y-4">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
                                                <MessageSquare className="text-slate-300 dark:text-slate-700" size={32} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-500">No active conversations</p>
                                            <button onClick={() => setActiveTab('contacts')} className="text-xs font-black text-indigo-500 uppercase tracking-widest hover:underline">Start a new chat</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {recommendedUsers.map(user => (
                                        <button
                                            key={user._id}
                                            onClick={() => handleSelectUser(user)}
                                            className="w-full p-4 flex items-center gap-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300"
                                        >
                                            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" alt="" />
                                            <div className="flex-1 text-left">
                                                <h4 className="font-black text-slate-800 dark:text-white truncate">{user.name}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.email}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/40 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                        {selectedUser ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                            <ChevronLeft size={20} />
                                        </button>
                                        <div className="relative">
                                            <img src={`https://ui-avatars.com/api/?name=${selectedUser.name}&background=6366f1&color=fff`} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-100 dark:border-slate-800" alt="" />
                                            <div className="absolute right-0 bottom-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 dark:text-white leading-tight">{selectedUser.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedUser.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 relative">
                                        <button
                                            onClick={toggleMessageSearch}
                                            className={`p-3 rounded-2xl transition-all ${showMessageSearch ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                                        >
                                            <Search size={20} />
                                        </button>
                                        <button
                                            onClick={toggleOptionsMenu}
                                            className={`p-3 rounded-2xl transition-all ${showOptionsMenu ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {/* Options Menu Dropdown */}
                                        {showOptionsMenu && (
                                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                                                <button className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    View Profile
                                                </button>
                                                <button className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    Mute Notifications
                                                </button>
                                                <button
                                                    onClick={handleClearChat}
                                                    className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                                >
                                                    Clear Chat
                                                </button>
                                                <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                                                <button className="w-full px-4 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                                                    Block User
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Message Search Bar */}
                                {showMessageSearch && (
                                    <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Search in messages..."
                                                value={messageSearchQuery}
                                                onChange={(e) => setMessageSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar h-[300px]">
                                    {messages
                                        .filter(msg =>
                                            !messageSearchQuery ||
                                            msg.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
                                        )
                                        .map((msg, idx) => {
                                            const isMe = msg.sender === currentUser._id;
                                            return (
                                                <motion.div
                                                    key={msg._id || idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[70%] space-y-1`}>
                                                        {/* File Attachment */}
                                                        {(msg.messageType === 'file' || msg.messageType === 'text-with-file') && msg.fileUrl && (
                                                            <div className={`p-3 rounded-2xl ${isMe
                                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'}`}>
                                                                <a
                                                                    href={`http://localhost:5000/${msg.fileUrl}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                                                                >
                                                                    {msg.fileType?.includes('image') ? (
                                                                        <img
                                                                            src={`http://localhost:5000/${msg.fileUrl}`}
                                                                            alt={msg.fileName}
                                                                            className="max-w-[250px] max-h-[200px] rounded-lg object-cover"
                                                                        />
                                                                    ) : (
                                                                        <>
                                                                            <div className={`text-3xl`}>
                                                                                {getFileIcon(msg.fileType)}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-bold text-sm truncate">{msg.fileName}</p>
                                                                                <p className={`text-xs ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                                                    {formatFileSize(msg.fileSize)}
                                                                                </p>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </a>
                                                            </div>
                                                        )}

                                                        {/* Text Content */}
                                                        {msg.content && (
                                                            <div className={`p-4 rounded-[2rem] text-sm font-bold shadow-sm ${isMe
                                                                ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-200 dark:shadow-none'
                                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'}`}>
                                                                {msg.content}
                                                            </div>
                                                        )}

                                                        <div className={`flex items-center gap-2 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                            <span className="text-[10px] font-bold text-slate-400">{format(new Date(msg.createdAt), 'HH:mm')}</span>
                                                            {isMe && <ShieldCheck size={12} className={msg.read ? 'text-indigo-500' : 'text-slate-300'} />}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                                        <div className="flex gap-1 relative">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                accept="image/*,video/*,.pdf,.doc,.docx"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAttachmentClick}
                                                disabled={uploadProgress}
                                                className={`p-3 rounded-xl transition-all ${uploadProgress ? 'opacity-50 cursor-not-allowed' : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                                                title="Attach file"
                                            >
                                                {uploadProgress ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                                                ) : (
                                                    <Paperclip size={20} />
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowEmojiPicker(prev => !prev)}
                                                className={`p-3 rounded-xl transition-all ${showEmojiPicker ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                                                title="Add emoji"
                                            >
                                                <Smile size={20} />
                                            </button>

                                            {/* Emoji Picker */}
                                            {showEmojiPicker && (
                                                <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                                                    <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                                                        <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Pick an Emoji</h4>
                                                    </div>
                                                    <div className="p-3 max-h-64 overflow-y-auto">
                                                        <div className="grid grid-cols-8 gap-1">
                                                            {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
                                                                '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘',
                                                                '😙', '😚', '😋', '😛', '😝', '😜', '🤪',
                                                                '🤨', '🧐', '🤓', '😎', '🤩', '😏', '😒',
                                                                '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫',
                                                                '😩', '🥺', '😢', '😭', '😤', '😠', '🤬',
                                                                '👍', '👎', '✊', '🤛', '🤜', '👏', '🙌',
                                                                '👐', '🤲', '🤝', '🙏', '✌️', '🤞', '🤟', '🤘',
                                                                '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️',
                                                                '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦾',
                                                                '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',

                                                                '🔥', '✨', '⭐', '🌟', '✅',
                                                                '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉'
                                                            ].map((emoji, index) => (
                                                                <button
                                                                    key={`${emoji}-${index}`}
                                                                    type="button"
                                                                    onClick={() => handleEmojiClick(emoji)}
                                                                    className="text-2xl hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
                                                                    title={emoji}
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-[2rem] text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="p-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-full shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 transition-all active:scale-95"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </form>
                                </div>

                                {/* Upload Notification Toast */}
                                <AnimatePresence>
                                    {uploadNotification && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            className={`absolute bottom-24 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl border z-50 min-w-[320px] ${uploadNotification.type === 'error'
                                                ? 'bg-rose-900 dark:bg-rose-800 text-white border-rose-700'
                                                : 'bg-emerald-900 dark:bg-emerald-800 text-white border-emerald-700'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${uploadNotification.type === 'error'
                                                    ? 'bg-rose-500/20'
                                                    : 'bg-emerald-500/20'
                                                    }`}>
                                                    {uploadNotification.type === 'error' ? (
                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                            <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                        </svg>
                                                    ) : (
                                                        <Paperclip size={20} className="text-emerald-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold">{uploadNotification.message}</p>
                                                </div>
                                                <button
                                                    onClick={() => setUploadNotification(null)}
                                                    className="text-white/60 hover:text-white transition-colors"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full"></div>
                                    <div className="relative w-32 h-32 bg-white dark:bg-slate-800 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                        <MessageSquare size={48} className="text-indigo-500" />
                                    </div>
                                </div>
                                <div className="max-w-xs space-y-2">
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Select a conversation</h3>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Start a real-time discussion with your {currentUser.role === 'student' ? 'teachers' : 'students'}.</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">Secure Messaging</div>
                                    <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">Real-Time</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Chat;
