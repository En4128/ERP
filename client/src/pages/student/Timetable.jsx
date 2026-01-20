import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle, ChevronRight, User, Hash, GraduationCap, X, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Timetable = () => {
    const [schedule, setSchedule] = useState([]);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeDay, setActiveDay] = useState('');
    const [selectedSession, setSelectedSession] = useState(null);
    const currentDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const colors = {
        lecture: 'from-blue-500/10 to-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-800/50 ring-indigo-500',
        lab: 'from-purple-500/10 to-fuchsia-500/10 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/50 ring-purple-500',
        tutorial: 'from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/50 ring-amber-500',
        default: 'from-slate-500/10 to-slate-600/10 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-800/50 ring-slate-500'
    };

    const getBuilding = (room) => {
        if (!room) return 'Main Academic Block';
        const r = room.toLowerCase();
        if (r.includes('lab') || r.startsWith('l')) return 'Science & Innovation Block';
        if (r.startsWith('a')) return 'Administrative Block A';
        if (r.startsWith('b')) return 'Instructional Block B';
        if (r.startsWith('c')) return 'Computer Center Block C';
        return 'Main Academic Block';
    };

    useEffect(() => {
        setActiveDay(days.includes(currentDayName) ? currentDayName : 'Monday');

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const profileRes = await axios.get('http://localhost:5000/api/student/profile', config);
                setStudent(profileRes.data);

                const scheduleRes = await axios.get('http://localhost:5000/api/timetable', config);

                const filtered = scheduleRes.data.filter(slot => {
                    const deptMatch = slot.department?.trim() === profileRes.data.department?.trim();
                    const semMatch = String(slot.semester || '').trim() === String(profileRes.data.sem || '').trim();
                    return deptMatch && semMatch;
                });

                // Sort by time
                const sorted = filtered.sort((a, b) => {
                    const timeA = new Date(`2000/01/01 ${a.startTime}`).getTime();
                    const timeB = new Date(`2000/01/01 ${b.startTime}`).getTime();
                    return timeA - timeB;
                });

                setSchedule(sorted);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching timetable:', err);
                setError('Failed to load timetable. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const dailySchedule = useMemo(() => {
        return schedule.filter(slot => slot.day?.trim() === activeDay.trim());
    }, [schedule, activeDay]);

    if (loading) {
        return (
            <Layout role="student">
                <div className="space-y-6 animate-pulse p-4">
                    <div className="h-10 w-48 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
                    <div className="flex gap-2 pb-4 overflow-hidden">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-12 w-28 bg-gray-100 dark:bg-slate-800/50 rounded-2xl flex-shrink-0"></div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 w-full bg-gray-50 dark:bg-slate-900/40 rounded-3xl border border-gray-100 dark:border-slate-800"></div>
                        ))}
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout role="student">
                <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
                    <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-full mb-6">
                        <AlertCircle size={48} className="text-rose-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h3>
                    <p className="font-medium text-center max-w-xs">{error}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="student">
            <div className="max-w-5xl mx-auto space-y-8 pb-12 transition-all duration-500 ease-in-out">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
                >
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-cyan-400 font-black tracking-widest uppercase text-xs mb-3">
                            <Calendar size={14} />
                            Academic Schedule
                        </div>
                        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Your Weekly <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-cyan-400 dark:to-blue-400">Timetable</span></h1>
                        <div className="flex items-center gap-3 mt-4">
                            <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-black border border-indigo-100 dark:border-indigo-800 flex items-center gap-2">
                                <BookOpen size={12} />
                                {student?.department || 'Computer Science'}
                            </div>
                            <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-full text-xs font-black border border-slate-200 dark:border-slate-700">
                                Semester {student?.sem || '4'}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                        {days.map((day) => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 whitespace-nowrap border-2 shadow-sm ${activeDay === day
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-indigo-200 dark:shadow-none scale-105'
                                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                                    }`}
                            >
                                {day}
                                {day === currentDayName && (
                                    <span className="ml-2 w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-cyan-400 inline-block animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Daily Schedule List */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeDay}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {dailySchedule.length > 0 ? (
                                dailySchedule.map((session, idx) => {
                                    const typeColor = colors[session.type?.toLowerCase()] || colors.default;
                                    return (
                                        <motion.div
                                            key={session._id || idx}
                                            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedSession(session)}
                                            className={`group relative overflow-hidden bg-gradient-to-br ${typeColor} p-6 rounded-[2.5rem] border shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-300`}
                                        >
                                            {/* Glassmorphism Overlay */}
                                            <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-[2px] pointer-events-none group-hover:backdrop-blur-none transition-all"></div>

                                            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                {/* Time and Type */}
                                                <div className="flex flex-row md:flex-col items-center md:items-start space-x-4 md:space-x-0 md:space-y-2 min-w-[140px]">
                                                    <div className="flex items-center space-x-2 py-1.5 px-3 bg-white/60 dark:bg-slate-950/60 rounded-xl border border-white/40 dark:border-white/5 shadow-sm">
                                                        <Clock size={14} className="opacity-70" />
                                                        <span className="text-sm font-black tracking-tight">{session.startTime}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50 px-1">{session.type || 'Lecture'}</span>
                                                </div>

                                                {/* Course Details */}
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-black border border-indigo-500/20">{session.courseCode}</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{session.courseName}</h3>

                                                    <div className="flex flex-wrap gap-4">
                                                        <div className="flex items-center text-xs font-bold opacity-60">
                                                            <MapPin size={14} className="mr-1.5 text-rose-500" />
                                                            {session.room}
                                                        </div>
                                                        <div className="flex items-center text-xs font-bold opacity-60">
                                                            <User size={14} className="mr-1.5 text-teal-500" />
                                                            {session.faculty || 'Unassigned'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Action/Indicator */}
                                                <div className="flex items-center justify-end">
                                                    <div className="p-3 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-white/50 dark:border-white/10 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                                                        <ChevronRight className="opacity-40 group-hover:opacity-100" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Animated background shape */}
                                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-current opacity-[0.03] rounded-full blur-3xl transform group-hover:scale-150 transition-transform duration-700"></div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-inner"
                                >
                                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                                        <BookOpen size={40} className="text-slate-300 dark:text-slate-700" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Classes Today</h4>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold">Enjoy your free time!</p>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100/50 dark:border-indigo-800/50">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Clock size={20} />
                            </div>
                            <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">Daily Load</h4>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{dailySchedule.length} Sessions</p>
                        <p className="text-xs font-bold text-slate-500 mt-1">Scheduled for today</p>
                    </div>

                    <div className="p-6 bg-teal-50/50 dark:bg-teal-900/10 rounded-3xl border border-teal-100/50 dark:border-teal-800/50">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-teal-100 dark:bg-teal-800 rounded-lg text-teal-600 dark:text-teal-400">
                                <BookOpen size={20} />
                            </div>
                            <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">Study Mode</h4>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">Full-Time</p>
                        <p className="text-xs font-bold text-slate-500 mt-1">Academics Regular</p>
                    </div>

                    <div className="p-6 bg-purple-50/50 dark:bg-purple-900/10 rounded-3xl border border-purple-100/50 dark:border-purple-800/50">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg text-purple-600 dark:text-purple-400">
                                <MapPin size={20} />
                            </div>
                            <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">Campus Area</h4>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">Block A & B</p>
                        <p className="text-xs font-bold text-slate-500 mt-1">Primary locations</p>
                    </div>
                </div>

                {/* Session Detail Modal */}
                <AnimatePresence>
                    {selectedSession && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedSession(null)}
                                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                            ></motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800"
                            >
                                {/* Modal Header Decoration */}
                                <div className={`h-24 bg-gradient-to-r ${colors[selectedSession.type?.toLowerCase()] || colors.default} relative flex items-center justify-center`}>
                                    <div className="absolute inset-0 bg-white/20 dark:bg-black/20"></div>
                                    <h4 className="relative text-white font-black tracking-widest uppercase text-xs">Session Details</h4>
                                    <button
                                        onClick={() => setSelectedSession(null)}
                                        className="absolute right-6 top-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-8 space-y-8">
                                    {/* Subject Info */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-teal-600 dark:text-cyan-400 uppercase tracking-widest">{selectedSession.type} SESSION</span>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{selectedSession.courseName}</h3>
                                        <div className="flex items-center space-x-2">
                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-black border border-slate-200 dark:border-slate-700">{selectedSession.courseCode}</span>
                                            <span className="text-sm font-bold text-slate-400 italic">Semester {selectedSession.semester}</span>
                                        </div>
                                    </div>

                                    {/* Detail Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center space-x-2 text-indigo-500 mb-2">
                                                <User size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-tight">Faculty Name</span>
                                            </div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{selectedSession.faculty || 'Unassigned'}</p>
                                        </div>

                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center space-x-2 text-rose-500 mb-2">
                                                <MapPin size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-tight">Room Number</span>
                                            </div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{selectedSession.room}</p>
                                        </div>

                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 col-span-2">
                                            <div className="flex items-center space-x-2 text-teal-500 mb-2">
                                                <Building2 size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-tight">Building Location</span>
                                            </div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{getBuilding(selectedSession.room)}</p>
                                        </div>

                                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800 col-span-2 flex items-center justify-between">
                                            <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400">
                                                <Clock size={20} />
                                                <span className="text-lg font-black">{selectedSession.startTime} - {selectedSession.endTime}</span>
                                            </div>
                                            <span className="text-[10px] font-black px-2 py-1 bg-indigo-500 text-white rounded-lg">LIVE SESSION</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedSession(null)}
                                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-slate-900/10 dark:shadow-white/5"
                                    >
                                        Got it, Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default Timetable;
