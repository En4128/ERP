import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Bell, Plus, Edit, Trash2, Send, Clock, Users,
    AlertCircle, Info, Star, Megaphone, Globe, X,
    ChevronRight, CheckCircle, Search, Filter, Volume2, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const AdminNotifications = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentNoticeId, setCurrentNoticeId] = useState(null);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'general',
        targetAudience: ['all'],
        isPublished: true
    });

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/notices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching notices:", error);
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.title || !formData.content) return toast.error("Fill all fields");
        try {
            const token = localStorage.getItem('token');
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/admin/notices/${currentNoticeId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/admin/notices', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setIsCreateOpen(false);
            resetForm();
            fetchNotices();
        } catch (error) {
            console.error("Error saving notice:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this notice?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/notices/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotices();
        } catch (error) {
            console.error("Error deleting notice:", error);
        }
    };

    const handleTogglePublish = async (notice) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/notices/${notice._id}`, {
                isPublished: !notice.isPublished
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotices();
        } catch (error) {
            console.error("Error toggling publish:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            type: 'general',
            targetAudience: ['all'],
            isPublished: true
        });
        setIsEditing(false);
        setCurrentNoticeId(null);
    };

    const handleEdit = (notice) => {
        setFormData({
            title: notice.title,
            content: notice.content,
            type: notice.type,
            targetAudience: notice.targetAudience,
            isPublished: notice.isPublished
        });
        setCurrentNoticeId(notice._id);
        setIsEditing(true);
        setIsCreateOpen(true);
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

    const getTypeBadge = (type) => {
        const configs = {
            general: { icon: Info, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', label: 'General' },
            exam: { icon: AlertCircle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20', label: 'Exam' },
            event: { icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20', label: 'Event' },
            urgent: { icon: Bell, color: 'text-rose-600 bg-rose-50 dark:bg-red-900/20', label: 'Urgent' },
            holiday: { icon: Globe, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', label: 'Holiday' },
        };
        const config = configs[type] || configs.general;
        const Icon = config.icon;
        return (
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const toggleAudience = (aud) => {
        setFormData(prev => {
            if (aud === 'all') return { ...prev, targetAudience: ['all'] };
            let newAud = prev.targetAudience.filter(a => a !== 'all');
            if (newAud.includes(aud)) {
                newAud = newAud.filter(a => a !== aud);
            } else {
                newAud.push(aud);
            }
            if (newAud.length === 0) newAud = ['all'];
            return { ...prev, targetAudience: newAud };
        });
    };

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <>
            <div className="space-y-8 animate-fade-in-up pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Announcements</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium">Create and manage institution-wide notifications.</p>
                    </div>

                    <button
                        onClick={() => { resetForm(); setIsCreateOpen(true); }}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-amber-200 dark:shadow-none transition transform active:scale-95 flex items-center"
                    >
                        <Plus size={18} className="mr-2" /> New Announcement
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Total', count: notices.length, icon: Megaphone, color: 'indigo' },
                        { label: 'Published', count: notices.filter(n => n.isPublished).length, icon: Send, color: 'emerald' },
                        { label: 'Drafts/Unpublished', count: notices.filter(n => !n.isPublished).length, icon: Clock, color: 'amber' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center space-x-4">
                            <div className={`p-4 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{stat.count}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Notices List */}
                <div className="space-y-4">
                    {notices.map((notice) => (
                        <motion.div
                            layout
                            key={notice._id}
                            onClick={() => setSelectedNotice(notice)}
                            className={`bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group cursor-pointer active:scale-[0.99] ${!notice.isPublished ? 'border-amber-200 dark:border-amber-900/30' : ''}`}
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="space-y-3 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {getTypeBadge(notice.type)}
                                        {!notice.isPublished && (
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                                                Draft
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-2">
                                            <Users size={12} />
                                            {notice.targetAudience.includes('all') ? 'Everyone' : notice.targetAudience.join(', ')}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                            {notice.title}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                                            {notice.content}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2 border-t border-gray-50 dark:border-slate-700/50">
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={12} />
                                            {new Date(notice.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </span>
                                        <span>By {notice.postedBy?.name || 'Admin'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-start pt-4 md:pt-0">
                                    <button
                                        onClick={() => handleTogglePublish(notice)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all transform active:scale-95 flex items-center gap-1.5 ${notice.isPublished ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                        title={notice.isPublished ? "Unpublish" : "Publish Now"}
                                    >
                                        <Send size={14} />
                                        {notice.isPublished ? "Unpublish" : "Publish"}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(notice)}
                                        className="p-3 bg-white dark:bg-slate-700/50 text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 rounded-xl transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(notice._id)}
                                        className="p-3 bg-white dark:bg-slate-700/50 text-gray-400 hover:text-rose-500 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {notices.length === 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                            <Megaphone size={48} className="text-gray-200 dark:text-slate-600 mb-4" />
                            <h4 className="font-black text-gray-400 dark:text-slate-500 text-lg">No Announcements Yet</h4>
                            <p className="text-sm text-gray-400 dark:text-slate-600 mt-2">Create your first institution-wide notice to keep everyone informed.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setIsCreateOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-gray-100 dark:border-slate-700"
                        >
                            <div className="p-8 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-white/30 dark:bg-slate-900/20">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{isEditing ? 'Edit Announcement' : 'Create Announcement'}</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Fill the details below</p>
                                </div>
                                <button
                                    onClick={() => setIsCreateOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-gray-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title *</label>
                                    <input
                                        type="text"
                                        placeholder="Announcement title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white transition-all hover:border-indigo-300 dark:hover:border-indigo-800"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="general">General</option>
                                            <option value="exam">Exam</option>
                                            <option value="event">Event</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="holiday">Holiday</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Publish Status</label>
                                        <select
                                            value={formData.isPublished ? 'true' : 'false'}
                                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === 'true' })}
                                            className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="true">Publish Immediately</option>
                                            <option value="false">Save as Draft</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Audience</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['student', 'faculty', 'all'].map(aud => (
                                            <button
                                                key={aud}
                                                type="button"
                                                onClick={() => toggleAudience(aud)}
                                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${formData.targetAudience.includes(aud)
                                                    ? 'bg-amber-500 text-white shadow-md'
                                                    : 'bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-gray-200 shadow-sm'
                                                    }`}
                                            >
                                                {aud}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Content *</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Write announcement content here..."
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white transition-all hover:border-indigo-300 dark:hover:border-indigo-800 resize-none"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        onClick={() => setIsCreateOpen(false)}
                                        className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-black text-slate-600 hover:bg-white dark:hover:bg-slate-700 transition transform active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        className="flex-[2] bg-amber-500 hover:bg-amber-600 text-white px-6 py-4 rounded-2xl text-sm font-black shadow-lg shadow-amber-200 dark:shadow-none transition transform active:scale-95 flex items-center justify-center"
                                    >
                                        <CheckCircle size={18} className="mr-2" />
                                        {isEditing ? 'Update Announcement' : 'Create & Send'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedNotice && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => { stopSpeaking(); setSelectedNotice(null); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-gray-100 dark:border-slate-700"
                        >
                            <div className={`h-2 w-full bg-gradient-to-r ${selectedNotice.type === 'exam' ? 'from-rose-500 to-red-600' : 'from-indigo-500 to-purple-600'}`}></div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        {getTypeBadge(selectedNotice.type)}
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-gray-100 dark:border-slate-700">
                                            {selectedNotice.targetAudience.includes('all') ? 'Everyone' : selectedNotice.targetAudience.join(', ')}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => { stopSpeaking(); setSelectedNotice(null); }}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-gray-400"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                        {selectedNotice.title}
                                    </h2>

                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest py-3 border-y border-gray-50 dark:border-slate-700/50">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {new Date(selectedNotice.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users size={14} />
                                            By {selectedNotice.postedBy?.name || 'Admin'}
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <p className="text-gray-600 dark:text-slate-300 text-lg leading-relaxed font-medium py-4 whitespace-pre-wrap">
                                            {selectedNotice.content}
                                        </p>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); isSpeaking ? stopSpeaking() : handleSpeak(selectedNotice.title, selectedNotice.content); }}
                                            className={`absolute -right-4 top-0 p-4 rounded-2xl shadow-xl transition-all transform hover:scale-110 active:scale-95 ${isSpeaking ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500 text-white'}`}
                                            title={isSpeaking ? "Stop Reading" : "Read Aloud"}
                                        >
                                            <Volume2 size={24} />
                                        </button>
                                    </div>

                                    {!selectedNotice.isPublished && (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                                            <ShieldAlert size={20} className="text-amber-500" />
                                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Draft: Not yet visible to the intended audience.</p>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-gray-50 dark:border-slate-700/50 flex gap-4">
                                        <button
                                            onClick={() => { setSelectedNotice(null); handleEdit(selectedNotice); }}
                                            className="flex-1 px-6 py-4 bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-2xl text-sm font-black text-gray-600 dark:text-white transition transform active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Edit size={18} /> Edit Notice
                                        </button>
                                        <button
                                            onClick={() => { stopSpeaking(); setSelectedNotice(null); }}
                                            className="flex-1 px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-100 transition transform active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={18} /> Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminNotifications;
