import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    Bell, PlusCircle, Search, Filter, Clock, User, Trash2, Send,
    Users, ChevronRight, AlertCircle, CheckCircle, Megaphone,
    Volume2, X, Sparkles, Zap, ArrowRight, MessageSquare, VolumeX,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

// --- Premium UI Components ---

const GlassCard = ({ children, className, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={cn(
            "bg-[#F3F4F6] dark:bg-[#1A1F2E] backdrop-blur-xl border border-[#E2E5E9]/50 dark:border-[#3D4556]/50 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500",
            className
        )}
    >
        {children}
    </motion.div>
);

const FacultyNotifications = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newNotice, setNewNotice] = useState({ title: '', content: '', targetAudience: 'student' });
    const [saving, setSaving] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/faculty/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching notices:", error);
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/faculty/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices(notices.map(n => n.id === id ? { ...n, read: true } : n));
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

    const handleCreateNotice = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/faculty/notices', newNotice, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotices([res.data, ...notices]);
            setShowCreate(false);
            setNewNotice({ title: '', content: '', targetAudience: 'student' });
            toast.success('Notice broadcasted successfully!');
            fetchNotices();
        } catch (error) {
            console.error("Error creating notice:", error);
            toast.error('Failed to send notice.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout role="faculty">
                <div className="flex justify-center items-center h-screen">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-indigo-600/20 rounded-full animate-ping" />
                        <div className="absolute inset-0 w-20 h-20 border-t-4 border-indigo-600 rounded-full animate-spin" />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="faculty">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3 md:space-y-4 text-center md:text-left">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-400/10 px-3 py-1.5 md:px-4 md:py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 w-fit mx-auto md:mx-0"
                        >
                            <Sparkles size={12} md:size={14} className="text-indigo-500" />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Communication Hub</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter leading-[0.9]">
                            Broadcast <br />
                            <span className="text-indigo-400">Hub</span>
                        </h1>
                    </div>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="w-full md:w-auto px-8 py-4 bg-[#2563EB] dark:bg-[#60A5FA] text-white dark:text-[#0F1419] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <PlusCircle size={16} /> New Broadcast
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Primary Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard className="p-8 md:p-10 min-h-fit md:min-h-[600px]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 text-center sm:text-left">
                                <div>
                                    <h3 className="text-2xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tight leading-none mb-1.5 flex items-center justify-center sm:justify-start gap-3">
                                        <Bell className="text-indigo-600" size={24} md:size={28} /> Notification Stream
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time academic relays</p>
                                </div>
                                <div className="flex justify-center gap-2">
                                    <button className="p-3 bg-[#F1F3F7] dark:bg-[#2D3548] rounded-xl text-slate-400 hover:text-indigo-500 transition-colors">
                                        <Search size={18} />
                                    </button>
                                    <button className="p-3 bg-[#F1F3F7] dark:bg-[#2D3548] rounded-xl text-slate-400 hover:text-indigo-500 transition-colors">
                                        <Filter size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {notices.length > 0 ? notices.map((notice, i) => (
                                    <motion.div
                                        key={notice.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setSelectedNotice(notice)}
                                        className={cn(
                                            "group p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden",
                                            notice.read
                                                ? "bg-[#F1F3F7]/50 dark:bg-[#2D3548]/50 border-[#E2E5E9]/50 dark:border-[#3D4556]/50 opacity-60"
                                                : "bg-[#F3F4F6] dark:bg-[#1A1F2E] border-[#E2E5E9] dark:border-[#3D4556] hover:border-indigo-500/50 hover:shadow-xl"
                                        )}
                                    >
                                        {!notice.read && (
                                            <div className="absolute top-0 right-0 w-1.5 md:w-2 h-full bg-indigo-500" />
                                        )}

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                                <div className={cn(
                                                    "w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-sm",
                                                    notice.read ? "bg-[#E5E7EB] dark:bg-[#242B3D] text-slate-400" : "bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white"
                                                )}>
                                                    <Send size={18} md:size={24} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black text-sm md:text-lg tracking-tight leading-none mb-1.5 text-[#0F1419] dark:text-[#E8EAED] truncate">{notice.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                                        <span className="text-[7px] md:text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full border border-indigo-500/10">
                                                            {notice.targetAudience?.includes('all') ? 'Global' : 'Cohorts'}
                                                        </span>
                                                        <span className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(notice.date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} md:size={18} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                                        </div>

                                        <p className="text-[11px] md:text-sm font-medium text-[#64748B] dark:text-[#868D9D] leading-relaxed line-clamp-2 px-1">
                                            {notice.content}
                                        </p>

                                        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-[#E2E5E9] dark:border-[#3D4556] flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 md:w-6 md:h-6 rounded-md md:rounded-lg bg-indigo-500 flex items-center justify-center text-[7px] md:text-[8px] font-black text-white">ID</div>
                                                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Signed: {notice.author}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest whitespace-nowrap">
                                                Inspect <ChevronRight size={12} md:size={14} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="py-24 flex flex-col items-center justify-center text-center">
                                        <div className="w-24 h-24 rounded-[2.5rem] bg-[#F1F3F7] dark:bg-[#2D3548] flex items-center justify-center text-slate-200 dark:text-slate-700 mb-8 border border-[#E2E5E9] dark:border-[#3D4556] border-dashed">
                                            <Megaphone size={40} />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-tight">Silent Orbit</h4>
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-600 mt-2 leading-relaxed">No active broadcasts detected <br />in the current temporal segment.</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Compose / Stats Column */}
                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            {showCreate ? (
                                <motion.div
                                    key="compose"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-[#E5E7EB] dark:bg-[#1A1F2E] rounded-[2.5rem] p-8 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 space-y-8"
                                >
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-2xl md:text-3xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter leading-none mb-1.5">New Broadcast</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compose systemic relay</p>
                                    </div>

                                    <form onSubmit={handleCreateNotice} className="space-y-5 md:space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Subject</label>
                                            <input
                                                required
                                                value={newNotice.title}
                                                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                                                placeholder="Objective line..."
                                                className="w-full bg-[#F1F3F7] dark:bg-[#2D3548] border-none rounded-xl md:rounded-2xl py-3.5 md:py-4 px-5 md:px-6 text-sm font-black focus:ring-2 focus:ring-indigo-500 dark:text-white shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Target Audience</label>
                                            <select
                                                value={newNotice.targetAudience}
                                                onChange={(e) => setNewNotice({ ...newNotice, targetAudience: e.target.value })}
                                                className="w-full bg-[#F1F3F7] dark:bg-[#2D3548] border-none rounded-xl md:rounded-2xl py-3.5 md:py-4 px-5 md:px-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 dark:text-white appearance-none cursor-pointer"
                                            >
                                                <option value="student">Students</option>
                                                <option value="faculty">Faculty</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Content</label>
                                            <textarea
                                                required
                                                rows="5"
                                                value={newNotice.content}
                                                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                                                placeholder="Type systemic relay detail..."
                                                className="w-full bg-[#F1F3F7] dark:bg-[#2D3548] border-none rounded-xl md:rounded-2xl py-3.5 md:py-4 px-5 md:px-6 text-sm font-black focus:ring-2 focus:ring-indigo-500 dark:text-white shadow-inner resize-none"
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowCreate(false)}
                                                className="flex-1 py-4 rounded-xl md:rounded-2xl bg-[#E5E7EB] dark:bg-[#242B3D] text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-200 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="flex-[2] py-4 rounded-xl md:rounded-2xl bg-indigo-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                {saving ? 'Transmitting...' : <><Send size={14} /> Send</>}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="cta"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-indigo-600 rounded-[2.5rem] p-10 text-white space-y-8 relative overflow-hidden shadow-2xl shadow-indigo-900/30"
                                >
                                    <div className="absolute top-[-20%] right-[-20%] w-[150px] h-[150px] bg-white/10 rounded-full blur-[60px]" />
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                        <Zap size={32} className="text-amber-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tighter mb-2 leading-none">Initialize Relay</h3>
                                        <p className="text-xs font-bold opacity-80 leading-relaxed">Broadcast critical academic vectors to your cohorts with zero latency. Precision communication at scale.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowCreate(true)}
                                        className="w-full py-5 bg-white text-indigo-600 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 active:scale-95 transition-all"
                                    >
                                        Deploy Broadcast
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>


                    </div>
                </div>

                {/* Detailed Relay Modal */}
                <AnimatePresence>
                    {selectedNotice && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                                onClick={() => { stopSpeaking(); setSelectedNotice(null); }}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                className="bg-[#E5E7EB] dark:bg-[#1A1F2E] w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-[#E2E5E9]/50 dark:border-[#3D4556]/50"
                            >
                                <div className="h-2 w-full bg-indigo-600" />

                                <div className="p-8 md:p-12">
                                    <div className="flex justify-between items-start mb-8 md:mb-10">
                                        <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/30">
                                            <Megaphone size={28} md:size={32} />
                                        </div>
                                        <button
                                            onClick={() => { stopSpeaking(); setSelectedNotice(null); }}
                                            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:rounded-2xl transition-colors text-slate-400"
                                        >
                                            <X size={20} md:size={24} />
                                        </button>
                                    </div>

                                    <div className="space-y-6 md:space-y-10">
                                        <div className="space-y-3">
                                            <h2 className="text-2xl md:text-5xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter leading-tight md:leading-none">{selectedNotice.title}</h2>
                                            <div className="flex flex-wrap items-center gap-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest pt-5 border-t border-[#E2E5E9] dark:border-[#3D4556]">
                                                <div className="flex items-center gap-2.5">
                                                    <Clock size={14} className="text-indigo-500" />
                                                    {new Date(selectedNotice.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <User size={14} className="text-emerald-500" />
                                                    Vanguard: {selectedNotice.author}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative group p-8 md:p-12 bg-[#F1F3F7] dark:bg-[#2D3548] rounded-[2rem] md:rounded-[2.5rem] border border-[#E2E5E9]/50 dark:border-[#3D4556]/50 shadow-inner">
                                            <p className="text-[#475569] dark:text-[#B8BDC6] text-sm md:text-lg font-bold leading-relaxed whitespace-pre-wrap md:pr-16 italic">
                                                {selectedNotice.content}
                                            </p>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); isSpeaking ? stopSpeaking() : handleSpeak(selectedNotice.title, selectedNotice.content); }}
                                                className={cn(
                                                    "absolute bottom-4 right-4 md:top-6 md:right-6 p-5 md:p-6 rounded-2xl md:rounded-[2rem] shadow-2xl transition-all transform hover:scale-110 active:scale-95",
                                                    isSpeaking ? "bg-indigo-600 text-white animate-pulse" : "bg-white dark:bg-[#1A1F2E] text-indigo-600 shadow-xl"
                                                )}
                                            >
                                                {isSpeaking ? <VolumeX size={24} md:size={32} /> : <Volume2 size={24} md:size={32} />}
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleMarkAsRead(selectedNotice.id)}
                                            className="w-full py-5 md:py-6 bg-[#2563EB] dark:bg-[#60A5FA] text-white dark:text-[#0F1419] rounded-2xl md:rounded-[2rem] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            <CheckCircle2 size={20} /> Acknowledge Relay
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </Layout>
    );
};

export default FacultyNotifications;
