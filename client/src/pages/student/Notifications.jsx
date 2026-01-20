import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Bell, AlertTriangle, Clock, CheckCircle, Info, Megaphone, Volume2, X, ChevronRight, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/student/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/student/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            // Close modal and stop speech
            stopSpeaking();
            setSelectedNotice(null);
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleSpeak = (title, content) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const text = `${title}. ${content}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Speech synthesis not supported in this browser.");
        }
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'unread') return !n.read;
        if (activeTab === 'urgent') return n.type === 'urgent' || n.type === 'exam';
        return true;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'urgent': return <AlertTriangle className="text-rose-500" size={24} />;
            case 'exam': return <AlertTriangle className="text-rose-500" size={24} />;
            case 'holiday': return <Clock className="text-emerald-500" size={24} />;
            case 'event': return <CheckCircle className="text-amber-500" size={24} />;
            default: return <Bell className="text-blue-700" size={24} />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'urgent': return 'bg-rose-50 dark:bg-red-900/10 border-rose-100 dark:border-red-900/20';
            case 'exam': return 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20';
            case 'holiday': return 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20';
            case 'event': return 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20';
            default: return 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700';
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now - past;
        const diffInHrs = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHrs < 1) return 'Just now';
        if (diffInHrs < 24) return `${diffInHrs} hours ago`;
        return past.toLocaleDateString();
    };

    if (loading) return (
        <Layout role="student">
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        </Layout>
    );

    return (
        <Layout role="student">
            <div className="animate-fade-in-up max-w-4xl mx-auto space-y-8 pb-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Broadcasting Hub</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium italic">Stay updated with the latest campus announcements.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-100 dark:border-slate-700 w-fit shadow-sm">
                    {['all', 'unread', 'urgent'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
                                ? 'bg-amber-500 text-white shadow-lg'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={notif.id}
                                onClick={() => setSelectedNotice(notif)}
                                className={`p-6 rounded-3xl border flex items-start space-x-5 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer active:scale-[0.98] ${getBgColor(notif.type)}`}
                            >
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex-shrink-0">
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`font-black text-lg ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-gray-900 dark:text-white'}`}>
                                                {notif.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Clock size={12} /> {formatTime(notif.date)}
                                                </span>
                                                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                    By {notif.author}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-4 leading-relaxed font-medium line-clamp-2">
                                        {notif.content}
                                    </p>
                                </div>
                                {!notif.read && (
                                    <span className="w-3 h-3 bg-blue-500 rounded-full mt-2 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-slate-700">
                            <div className="w-20 h-20 bg-white dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                <Megaphone size={38} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">All Caught Up!</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-xs mx-auto">No notifications found in this category. Check back later for campus updates.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedNotice && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => { stopSpeaking(); setSelectedNotice(null); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-gray-100 dark:border-slate-700"
                        >
                            <div className={`h-2 w-full bg-gradient-to-r ${getBgColor(selectedNotice.type).includes('red') ? 'from-red-500 to-rose-600' : 'from-indigo-500 to-purple-600'}`}></div>

                            <div className="p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-inner text-blue-700">
                                        {getIcon(selectedNotice.type)}
                                    </div>
                                    <button
                                        onClick={() => { stopSpeaking(); setSelectedNotice(null); }}
                                        className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all text-gray-400"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                        {selectedNotice.title}
                                    </h2>

                                    <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] py-4 border-y border-gray-50 dark:border-slate-700/50">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            {new Date(selectedNotice.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={14} />
                                            By {selectedNotice.author}
                                        </div>
                                    </div>

                                    <div className="relative group p-8 bg-white/50 dark:bg-slate-900/30 rounded-[2rem] border border-gray-100 dark:border-slate-700/50">
                                        <p className="text-gray-600 dark:text-slate-300 text-lg leading-relaxed font-medium whitespace-pre-wrap pr-16">
                                            {selectedNotice.content}
                                        </p>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); isSpeaking ? stopSpeaking() : handleSpeak(selectedNotice.title, selectedNotice.content); }}
                                            className={`absolute right-4 top-4 p-5 rounded-[1.5rem] shadow-2xl transition-all transform hover:scale-110 active:scale-95 ${isSpeaking ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500 text-white shadow-indigo-100 dark:shadow-none'}`}
                                            title={isSpeaking ? "Stop Reading" : "Read Aloud"}
                                        >
                                            <Volume2 size={28} />
                                        </button>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={() => handleMarkAsRead(selectedNotice.id)}
                                            className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none transition transform active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={20} /> Mark as Read & Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default Notifications;
