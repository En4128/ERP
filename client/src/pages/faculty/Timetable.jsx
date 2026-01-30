import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Download,
    BookOpen,
    Filter,
    PlusCircle,
    Bell,
    AlertCircle,
    Sparkles,
    Zap,
    Users,
    ArrowRight
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

const FacultyTimetable = () => {
    const [fullSchedule, setFullSchedule] = useState([]);
    const [faculty, setFaculty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDay, setCurrentDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const profileRes = await axios.get('http://localhost:5000/api/faculty/profile', config);
            setFaculty(profileRes.data);

            const scheduleRes = await axios.get('http://localhost:5000/api/timetable', config);

            const mySchedule = scheduleRes.data.filter(slot =>
                slot.faculty?.trim() === profileRes.data.user?.name?.trim()
            );

            setFullSchedule(mySchedule);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching timetable:", error);
            setError("Failed to load your timetable.");
            setLoading(false);
        }
    };

    const dayTimetable = fullSchedule.filter(slot => slot.day === currentDay);

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

    if (error) {
        return (
            <Layout role="faculty">
                <div className="flex flex-col items-center justify-center h-screen text-slate-500">
                    <AlertCircle size={48} className="mb-4 text-rose-500 opacity-50" />
                    <p className="font-black uppercase tracking-widest text-xs">{error}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="faculty">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-400/10 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 w-fit"
                        >
                            <Sparkles size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Academic Schedule</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
                            Teaching <br />
                            <span className="text-indigo-600 dark:text-indigo-400">Timeline</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                    </div>
                </div>

                {/* Day Selection Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {days.map((day) => (
                        <button
                            key={day}
                            onClick={() => setCurrentDay(day)}
                            className={cn(
                                "px-10 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border",
                                currentDay === day
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20"
                                    : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-500"
                            )}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Perspective Summary */}
                    <div className="space-y-6">
                        <GlassCard className="p-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Day Overview</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{dayTimetable.length}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Planned Units</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">Active</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Class</p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8 bg-slate-900 text-white border-none shadow-2xl shadow-indigo-900/20 overflow-hidden relative">
                            <div className="absolute top-[-20%] right-[-20%] w-[100px] h-[100px] bg-indigo-500/20 rounded-full blur-[40px]" />
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 relative z-10">Room Allocation</h3>
                            <div className="space-y-4 relative z-10">
                                {[...new Set(dayTimetable.map(s => s.room))].map((room, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <MapPin size={14} className="text-indigo-400" />
                                            <span className="text-xs font-black tracking-widest uppercase">{room}</span>
                                        </div>
                                        <ArrowRight size={12} className="opacity-40" />
                                    </div>
                                ))}
                                {dayTimetable.length === 0 && <p className="text-xs font-bold text-slate-500 italic">No rooms assigned.</p>}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Interactive Timeline */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentDay}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-6"
                            >
                                {dayTimetable.length > 0 ? (
                                    <div className="relative space-y-8 pl-12 before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[1px] before:bg-slate-200 dark:before:bg-slate-800">
                                        {dayTimetable.map((slot, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="relative group"
                                            >
                                                {/* Node Circle */}
                                                <div className="absolute -left-[30px] top-8 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 z-10 shadow-sm group-hover:scale-125 transition-transform" />

                                                {/* Content Component */}
                                                <GlassCard className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group-hover:border-indigo-500/50 transition-all">
                                                    <div className="flex items-center gap-6">
                                                        <div className="p-5 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 border border-indigo-100 dark:border-indigo-800 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                            <BookOpen size={28} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Session {idx + 1}</p>
                                                            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">{slot.courseName}</h4>
                                                            <div className="flex flex-wrap items-center gap-4">
                                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-full bg-slate-50/50 dark:bg-slate-800/20">
                                                                    <Clock size={12} /> {slot.startTime} - {slot.endTime}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-full bg-slate-50/50 dark:bg-slate-800/20">
                                                                    <MapPin size={12} /> Room {slot.room}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-6 md:pt-0 md:pl-10">
                                                        <span className="px-4 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest">
                                                            {slot.type} Class
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <Users size={14} className="text-slate-400" />
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronized</span>
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-32 flex flex-col items-center justify-center text-center">
                                        <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-200 dark:text-slate-700 mb-8 border border-slate-100 dark:border-slate-800">
                                            <CalendarIcon size={40} />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-tight">Open Horizon</h4>
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-600 mt-2 leading-relaxed">No teaching engagements scheduled <br />for this specific diurnal cycle.</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>

            </div>
        </Layout>
    );
};

export default FacultyTimetable;
