import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    Clock, CheckCircle, XCircle, User, Calendar, MessageSquare,
    Sparkles, Zap, ShieldCheck, ArrowRight, UserCheck, UserX,
    MessageCircle, Send, CheckCircle2, AlertCircle, X, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// --- Premium UI Components ---

const GlassCard = ({ children, className, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={cn(
            "bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500",
            className
        )}
    >
        {children}
    </motion.div>
);

const FacultyLeaveRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // ID of request being processed
    const [comment, setComment] = useState('');
    const [activeAction, setActiveAction] = useState({ id: null, type: null }); // { id: '123', type: 'Approved' }

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/faculty/leave-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (id, type) => {
        setActiveAction({ id, type });
        setComment('');
    };

    const submitAction = async () => {
        if (!comment.trim()) {
            alert("Please provide a reason or comment.");
            return;
        }

        setActionLoading(activeAction.id);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/faculty/leave-requests/${activeAction.id}`,
                { status: activeAction.type, facultyComment: comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRequests(requests.map(req =>
                req._id === activeAction.id
                    ? { ...req, status: activeAction.type, facultyComment: comment }
                    : req
            ));
            setActiveAction({ id: null, type: null });
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'Rejected': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
            default: return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
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
            <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-400/10 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 w-fit"
                        >
                            <Sparkles size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Personnel Logistics</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
                            Absence <br />
                            <span className="text-indigo-600 dark:text-indigo-400">Adjudication</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <GlassCard className="px-6 py-4 flex items-center gap-4 bg-emerald-500/[0.02]">
                            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600">
                                <CheckCircle2 size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Queue Status</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white leading-none tracking-tight">{requests.filter(r => r.status === 'Pending').length} Pending Requests</p>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {requests.length === 0 ? (
                    <GlassCard className="p-24 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-200 dark:text-slate-700 mb-8 border border-slate-100 dark:border-slate-800 border-dashed">
                            <Clock size={40} />
                        </div>
                        <h4 className="text-3xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-tight">Zero Latency</h4>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-600 mt-2 leading-relaxed">No pending absence vectors in the current cycle.</p>
                    </GlassCard>
                ) : (
                    <div className="grid gap-8">
                        {requests.map((request, idx) => (
                            <GlassCard key={request._id} className="p-0 border-none shadow-xl hover:shadow-2xl transition-all" delay={idx * 0.1}>
                                <div className="flex flex-col md:flex-row">
                                    {/* Sidebar of card */}
                                    <div className={cn(
                                        "md:w-32 flex md:flex-col items-center justify-center p-6 gap-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50",
                                        request.status === 'Approved' && "bg-emerald-500/[0.05]",
                                        request.status === 'Rejected' && "bg-rose-500/[0.05]"
                                    )}>
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-black text-xl shadow-lg border border-slate-100 dark:border-slate-700">
                                            {request.student?.user?.name?.charAt(0) || 'S'}
                                        </div>
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            request.status === 'Approved' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                                request.status === 'Rejected' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                        )} />
                                    </div>

                                    <div className="flex-1 p-10">
                                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-10">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{request.student?.user?.name}</h3>
                                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/10">ID: {request.student?.admissionNumber}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-indigo-500" /> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{request.type}</span>
                                                </div>
                                            </div>

                                            <div className={cn(
                                                "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-3 self-start lg:self-center",
                                                getStatusStyles(request.status)
                                            )}>
                                                {request.status === 'Approved' ? <CheckCircle size={14} /> : request.status === 'Rejected' ? <XCircle size={14} /> : <Clock size={14} className="animate-spin-slow" />}
                                                {request.status} Status
                                            </div>
                                        </div>

                                        <div className="relative group p-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 mb-8 overflow-hidden">
                                            <MessageSquare size={80} className="absolute -bottom-4 -right-4 opacity-[0.03] rotate-12" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Absence Rationale</p>
                                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 tracking-tight leading-relaxed italic">"{request.reason}"</p>
                                        </div>

                                        {/* Action Engine */}
                                        <AnimatePresence mode="wait">
                                            {request.status === 'Pending' ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="pt-8 border-t border-slate-50 dark:border-slate-800"
                                                >
                                                    {activeAction.id === request._id ? (
                                                        <div className="space-y-6 animate-fade-in">
                                                            <div className="space-y-3">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Decision Context <span className="text-rose-500">*</span></label>
                                                                <textarea
                                                                    className="w-full p-6 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-bold dark:text-white shadow-inner resize-none"
                                                                    rows="3"
                                                                    placeholder={`Synthesis for ${activeAction.type.toLowerCase()} decision...`}
                                                                    value={comment}
                                                                    onChange={(e) => setComment(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex justify-end gap-3">
                                                                <button
                                                                    onClick={() => setActiveAction({ id: null, type: null })}
                                                                    className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-200 rounded-[1.5rem] transition-all"
                                                                >
                                                                    Abort
                                                                </button>
                                                                <button
                                                                    onClick={submitAction}
                                                                    disabled={actionLoading === request._id}
                                                                    className={cn(
                                                                        "px-10 py-4 rounded-[1.5rem] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center gap-2",
                                                                        activeAction.type === 'Approved' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-600 shadow-rose-500/20'
                                                                    )}
                                                                >
                                                                    {actionLoading === request._id ? 'Synchronizing...' : `Deploy ${activeAction.type}`}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-4 justify-end">
                                                            <button
                                                                onClick={() => handleActionClick(request._id, 'Rejected')}
                                                                className="px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2"
                                                            >
                                                                <UserX size={16} /> Veto Application
                                                            </button>
                                                            <button
                                                                onClick={() => handleActionClick(request._id, 'Approved')}
                                                                className="px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center gap-2"
                                                            >
                                                                <UserCheck size={16} /> Authorize Absence
                                                            </button>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ) : (
                                                <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-start gap-4">
                                                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400">
                                                        <ShieldCheck size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorization Feedback</p>
                                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 italic">"{request.facultyComment}"</p>
                                                    </div>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default FacultyLeaveRequests;
