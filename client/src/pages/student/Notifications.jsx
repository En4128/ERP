import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Bell, AlertTriangle, Clock, CheckCircle, Info, Megaphone, Volume2, X, ChevronRight, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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
            toast.info("Speech synthesis not supported in this browser.");
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
            case 'alert': return <AlertTriangle className="text-indigo-500" size={24} />;
            default: return <Bell className="text-blue-700" size={24} />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'urgent': return 'bg-rose-50 dark:bg-red-900/10 border-rose-100 dark:border-red-900/20';
            case 'exam': return 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20';
            case 'holiday': return 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20';
            case 'event': return 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20';
            case 'alert': return 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20';
            default: return 'bg-[#E5E7EB] dark:bg-[#242B3D] border-[#E2E5E9] dark:border-[#3D4556]';
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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3 md:space-y-4 text-center md:text-left">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-400/10 px-3 py-1.5 md:px-4 md:py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 w-fit mx-auto md:mx-0"
                        >
                            <Sparkles size={12} md:size={14} className="text-indigo-500" />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Broadcasting Hub</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter leading-[0.9]">
                            Smart <br />
                            <span className="text-indigo-400">Notices</span>
                        </h1>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                        {[
                            { id: 'all', label: 'All Stream', icon: Bell },
                            { id: 'unread', label: 'New Only', icon: Mail },
                            { id: 'urgent', label: 'Critical', icon: AlertTriangle },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2.5 px-6 md:px-8 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-amber-500 text-white shadow-xl shadow-amber-500/20"
                                        : "bg-[#F3F4F6] dark:bg-[#2D3548] text-slate-400 dark:text-[#868D9D] border border-[#E2E5E9] dark:border-[#3D4556] hover:text-amber-500"
                                )}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
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
                                <div className="p-3.5 md:p-4 bg-[#E5E7EB] dark:bg-[#1A1F2E] rounded-xl md:rounded-2xl shadow-sm flex-shrink-0">
                                    <Bell size={18} md:size={24} className="text-indigo-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className={cn(
                                                "font-black text-sm md:text-xl tracking-tight truncate",
                                                notif.read ? 'text-[#475569] dark:text-[#B8BDC6]' : 'text-[#0F1419] dark:text-white'
                                            )}>
                                                {notif.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 underline-offset-4">
                                                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock size={12} /> {formatTime(notif.date)}
                                                </span>
                                                <span className="text-[8px] md:text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest border border-indigo-500/20">
                                                    Via {notif.author}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] md:text-sm text-slate-500 dark:text-[#868D9D] mt-3 md:mt-4 leading-relaxed font-bold line-clamp-2 md:line-clamp-3">
                                        {notif.content}
                                    </p>
                                </div>
                                {!notif.read && (
                                    <span className="w-3 h-3 bg-blue-500 rounded-full mt-2 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-24 bg-[#E5E7EB] dark:bg-[#242B3D] rounded-[2rem] border-2 border-dashed border-[#E2E5E9] dark:border-[#3D4556]">
                            <div className="w-20 h-20 bg-white dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#64748B] dark:text-[#868D9D]">
                                <Megaphone size={38} />
                            </div>
                            <h3 className="text-xl font-black text-[#0F1419] dark:text-[#E8EAED]">All Caught Up!</h3>
                            <p className="text-[#64748B] dark:text-[#868D9D] text-sm mt-2 max-w-xs mx-auto">No notifications found in this category. Check back later for campus updates.</p>
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
                            className="bg-[#E5E7EB] dark:bg-[#242B3D] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-[#E2E5E9] dark:border-[#3D4556]"
                        >
                            <div className={`h-2 w-full bg-gradient-to-r ${getBgColor(selectedNotice.type).includes('red') ? 'from-red-500 to-rose-600' : 'from-indigo-500 to-purple-600'}`}></div>

                            <div className="p-8 md:p-12">
                                <div className="flex justify-between items-start mb-8 md:mb-10">
                                    <div className="p-3.5 md:p-4 bg-[#E5E7EB] dark:bg-[#1A1F2E] rounded-xl md:rounded-2xl shadow-inner text-indigo-500">
                                        <Bell size={20} md:size={24} />
                                    </div>
                                    <button
                                        onClick={() => { stopSpeaking(); setSelectedNotice(null); }}
                                        className="p-3 bg-[#F1F3F7] dark:bg-[#2D3548] text-slate-400 rounded-xl hover:rotate-90 transition-all duration-300"
                                    >
                                        <X size={20} md:size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6 md:space-y-10">
                                    <div className="space-y-4">
                                        <h2 className="text-2xl md:text-5xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter leading-none">
                                            {selectedNotice.title}
                                        </h2>

                                        <div className="flex flex-wrap items-center gap-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-5 border-y border-[#E2E5E9] dark:border-[#3D4556]">
                                            <div className="flex items-center gap-2.5">
                                                <Clock size={14} className="text-indigo-500" />
                                                {new Date(selectedNotice.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <Users size={14} className="text-indigo-500" />
                                                Authored by {selectedNotice.author}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group p-8 md:p-12 bg-[#F1F3F7] dark:bg-[#1A1F2E]/50 rounded-[2rem] border border-[#E2E5E9] dark:border-[#3D4556] shadow-inner">
                                        <p className="text-sm md:text-xl font-bold text-[#475569] dark:text-[#B8BDC6] leading-relaxed whitespace-pre-wrap">
                                            {selectedNotice.content}
                                        </p>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); isSpeaking ? stopSpeaking() : handleSpeak(selectedNotice.title, selectedNotice.content); }}
                                            className={cn(
                                                "absolute bottom-4 right-4 md:-right-6 md:top-1/2 md:-translate-y-1/2 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl transition-all transform hover:scale-110 active:scale-95 z-10",
                                                isSpeaking ? "bg-rose-500 text-white animate-pulse" : "bg-indigo-600 text-white"
                                            )}
                                        >
                                            <Volume2 size={24} md:size={32} />
                                        </button>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            onClick={() => handleMarkAsRead(selectedNotice.id)}
                                            className="w-full py-5 md:py-6 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl md:rounded-[2.5rem] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 transition transform active:scale-[0.98] flex items-center justify-center gap-3"
                                        >
                                            <CheckCircle2 size={20} /> Terminate & Close
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
