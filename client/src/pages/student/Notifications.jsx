import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Bell, AlertTriangle, Clock, CheckCircle, Info, Megaphone, Volume2, X, ChevronRight, Users, Sparkles, Mail, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
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
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                            onClick={() => { stopSpeaking(); setSelectedNotice(null); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white/80 dark:bg-[#1A1F2E]/90 backdrop-blur-2xl w-full max-w-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden relative z-10 border border-white/20 dark:border-slate-700/50"
                        >
                            {/* Decorative Glow */}
                            <div className={cn(
                                "absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[100px] opacity-20",
                                getBgColor(selectedNotice.type).includes('red') ? 'bg-rose-500' : 'bg-indigo-500'
                            )}></div>

                            <div className="p-10 md:p-14 relative z-10">
                                <div className="flex justify-between items-start mb-10 md:mb-12">
                                    <div className="p-5 bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 text-indigo-500 transform -rotate-6">
                                        <Bell size={24} md:size={28} />
                                    </div>
                                    <button
                                        onClick={() => { stopSpeaking(); setSelectedNotice(null); }}
                                        className="p-4 bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-2xl hover:rotate-90 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all duration-300"
                                    >
                                        <X size={24} md:size={28} />
                                    </button>
                                </div>

                                <div className="space-y-8 md:space-y-12">
                                    <div className="space-y-5">
                                        <h2 className="text-3xl md:text-6xl font-black text-[#0F1419] dark:text-white tracking-tighter leading-[0.9] drop-shadow-sm">
                                            {selectedNotice.title}
                                        </h2>

                                        <div className="flex flex-wrap items-center gap-6 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest py-6 border-y border-slate-200/50 dark:border-slate-700/30">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                                                    <Clock size={16} className="text-indigo-500" />
                                                </div>
                                                {new Date(selectedNotice.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                                                    <Users size={16} className="text-amber-500" />
                                                </div>
                                                Authored by <span className="text-slate-600 dark:text-slate-300 ml-1">{selectedNotice.author}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group p-10 md:p-14 bg-slate-50/50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-inner overflow-hidden">
                                        <p className="text-base md:text-2xl font-bold text-slate-600 dark:text-slate-200 leading-relaxed whitespace-pre-wrap relative z-10">
                                            {selectedNotice.content}
                                        </p>

                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => { e.stopPropagation(); isSpeaking ? stopSpeaking() : handleSpeak(selectedNotice.title, selectedNotice.content); }}
                                            className={cn(
                                                "absolute bottom-8 right-8 p-5 md:p-6 rounded-full shadow-2xl transition-all z-10",
                                                isSpeaking
                                                    ? "bg-rose-500 text-white shadow-rose-500/40 animate-pulse"
                                                    : "bg-indigo-600 text-white shadow-indigo-600/40"
                                            )}
                                        >
                                            <Volume2 size={24} md:size={32} />
                                        </motion.button>

                                        {/* Background pattern */}
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <Megaphone size={120} className="-rotate-12" />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02, translateY: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleMarkAsRead(selectedNotice.id)}
                                            className="w-full py-6 md:py-8 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.5)] text-white rounded-[2rem] md:rounded-[2.5rem] text-xs md:text-sm font-black uppercase tracking-[0.3em] shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-4 border-t border-white/20"
                                        >
                                            <CheckCircle2 size={24} /> Mark as Read & Close
                                        </motion.button>
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
