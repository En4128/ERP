import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle, ArrowRight, Users, Hash, GraduationCap, X, Building2, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Timetable = () => {
    const [schedule, setSchedule] = useState([]);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeDay, setActiveDay] = useState('');
    const [selectedSession, setSelectedSession] = useState(null);
    const currentDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

    const [workingDays, setWorkingDays] = useState(6);
    const [saturdayMapping, setSaturdayMapping] = useState('None');
    const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const days = defaultDays.slice(0, workingDays);

    const colors = {
        CLASS: 'from-blue-600/10 to-blue-400/10 text-[#2563EB] dark:text-[#60A5FA] dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50 ring-blue-500',
        LAB: 'from-[#2563EB] dark:from-[#60A5FA]/10 to-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50 ring-blue-500',
        default: 'from-slate-500/10 to-slate-600/10 text-[#475569] dark:text-[#B8BDC6] border-[#E2E5E9]/50 dark:border-[#3D4556]/50 ring-slate-500'
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
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [profileRes, scheduleRes, configRes, mappingRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/student/profile', config),
                    axios.get('http://localhost:5000/api/timetable', config),
                    axios.get('http://localhost:5000/api/timetable/settings/workingDays', config).catch(() => ({ data: { value: 6 } })),
                    axios.get('http://localhost:5000/api/timetable/settings/saturdayMapping', config).catch(() => ({ data: { value: 'None' } }))
                ]);

                setStudent(profileRes.data);
                const wDays = configRes.data?.value || 6;
                setWorkingDays(wDays);
                setSaturdayMapping(mappingRes.data?.value || 'None');

                // Ensure activeDay is valid for the number of working days
                const validDays = defaultDays.slice(0, wDays);
                setActiveDay(validDays.includes(currentDayName) ? currentDayName : 'Monday');

                const filtered = scheduleRes.data.filter(slot => {
                    const deptMatch = slot.department?.trim() === profileRes.data.department?.trim() || slot.department?.trim() === 'CDC';
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
    }, [currentDayName]); // currentDayName is static but good for dependency completeness

    const dailySchedule = useMemo(() => {
        const effectiveDay = (activeDay === 'Saturday' && saturdayMapping !== 'None') ? saturdayMapping : activeDay;
        return schedule.filter(slot => slot.day?.trim() === effectiveDay.trim());
    }, [schedule, activeDay, saturdayMapping]);

    if (loading) {
        return (
            <Layout role="student">
                <div className="space-y-6 animate-pulse p-4">
                    <div className="h-10 w-48 bg-[#E5E7EB] dark:bg-[#242B3D] rounded-lg"></div>
                    <div className="flex gap-2 pb-4 overflow-hidden">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-12 w-28 bg-[#E5E7EB]/50 dark:bg-[#242B3D]/50 rounded-2xl flex-shrink-0"></div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 w-full bg-[#E5E7EB]/40 dark:bg-[#1A1F2E]/40 rounded-3xl border border-[#E2E5E9] dark:border-[#3D4556]"></div>
                        ))}
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout role="student">
                <div className="flex flex-col items-center justify-center h-[60vh] text-[#64748B] dark:text-[#868D9D]">
                    <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-full mb-6">
                        <AlertCircle size={48} className="text-rose-500" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0F1419] dark:text-[#E8EAED] mb-2">Something went wrong</h3>
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
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-[#2563EB] dark:text-[#60A5FA] border border-blue-500/20 mb-2">
                            <Sparkles size={12} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Academic Timeline</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter">
                            Your <span className="text-[#2563EB] dark:text-[#60A5FA]">Schedule</span>
                        </h2>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth -mx-4 px-4 md:mx-0 md:px-0">
                        {days.map((day) => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`px-5 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black transition-all duration-300 whitespace-nowrap border-2 shadow-sm ${activeDay === day
                                    ? 'bg-[#2563EB] dark:bg-[#60A5FA] border-[#2563EB] dark:border-[#60A5FA] text-white shadow-[#2563EB]/20 dark:shadow-[#60A5FA]/20 dark:shadow-none scale-105'
                                    : 'bg-[#F3F4F6] dark:bg-[#1A1F2E] text-[#64748B] dark:text-[#868D9D] border-transparent hover:border-[#2563EB]/30 dark:border-[#60A5FA]/30 dark:hover:border-slate-800'
                                    }`}
                            >
                                {day.substring(0, 3)}
                                <span className="hidden md:inline">{day.substring(3)}</span>
                                {day === currentDayName && (
                                    <span className="ml-1.5 md:ml-2 w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] dark:bg-blue-400 inline-block animate-pulse" />
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
                                    const typeColor = colors[session.type?.toUpperCase()] || colors.default;
                                    return (
                                        <motion.div
                                            key={session._id || idx}
                                            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedSession(session)}
                                            className={`group relative overflow-hidden bg-gradient-to-br ${typeColor} p-6 rounded-[2.5rem] border shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-300`}
                                        >
                                            {/* Glassmorphism Overlay */}
                                            <div className="absolute inset-0 bg-[#F3F4F6]/40 dark:bg-[#1A1F2E]/40 backdrop-blur-[2px] pointer-events-none group-hover:backdrop-blur-none transition-all"></div>

                                            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                {/* Time and Type */}
                                                <div className="flex flex-row md:flex-col items-center md:items-start space-x-3 md:space-x-0 md:space-y-2 min-w-[120px] md:min-w-[140px]">
                                                    <div className="flex items-center space-x-2 py-1 md:py-1.5 px-2.5 md:px-3 bg-[#E5E7EB]/60 dark:bg-[#242B3D]/60 rounded-lg md:rounded-xl border border-[#E2E5E9]/40 dark:border-[#3D4556]/40 shadow-sm">
                                                        <Clock size={12} md:size={14} className="opacity-70" />
                                                        <span className="text-[10px] md:text-sm font-black tracking-tight">{session.startTime}</span>
                                                    </div>
                                                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-50 px-1">{session.type || 'CLASS'}</span>
                                                </div>

                                                {/* Course Details */}
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="px-2 py-0.5 bg-blue-500/10 text-[#2563EB] dark:text-[#60A5FA] dark:text-blue-400 rounded-md text-[10px] font-black border border-[#2563EB]/20 dark:border-[#60A5FA]/20">{session.courseCode}</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-[#0F1419] dark:text-[#E8EAED] leading-tight">{session.courseName}</h3>

                                                    <div className="flex flex-wrap gap-4">
                                                        <div className="flex items-center text-[10px] md:text-xs font-bold opacity-60">
                                                            <MapPin size={12} md:size={14} className="mr-1 md:mr-1.5 text-blue-500" />
                                                            {session.room}
                                                        </div>
                                                        <div className="flex items-center text-[10px] md:text-xs font-bold opacity-60">
                                                            <Users size={12} md:size={14} className="mr-1 md:mr-1.5 text-blue-400" />
                                                            {session.faculty || 'Unassigned'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Action/Indicator */}
                                                <div className="flex items-center justify-end md:static absolute bottom-6 right-6">
                                                    <div className="p-2 md:p-3 bg-[#E5E7EB]/50 dark:bg-[#242B3D]/50 rounded-xl md:rounded-2xl border border-[#E2E5E9]/50 dark:border-[#3D4556]/50 group-hover:bg-[#2563EB] dark:bg-[#60A5FA] group-hover:text-white transition-all duration-500">
                                                        <ArrowRight className="opacity-40 group-hover:opacity-100" size={16} md:size={20} />
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
                                    className="flex flex-col items-center justify-center py-20 bg-[#E5E7EB] dark:bg-[#1A1F2E] rounded-[3rem] border border-[#E2E5E9] dark:border-[#3D4556] shadow-inner"
                                >
                                    <div className="w-24 h-24 bg-[#F1F3F7] dark:bg-[#2D3548] rounded-full flex items-center justify-center mb-6">
                                        <BookOpen size={40} className="text-slate-300 dark:text-slate-700" />
                                    </div>
                                    <h4 className="text-xl font-black text-[#0F1419] dark:text-[#E8EAED] mb-2">No Classes Today</h4>
                                    <p className="text-[#64748B] dark:text-[#868D9D] font-bold">Enjoy your free time!</p>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[#E2E5E9] dark:border-[#3D4556]">
                    <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50 dark:border-blue-800/50">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-[#2563EB] dark:text-[#60A5FA] dark:text-blue-400">
                                <Clock size={20} />
                            </div>
                            <h4 className="font-black text-sm uppercase tracking-wider text-[#475569] dark:text-[#B8BDC6]">Daily Load</h4>
                        </div>
                        <p className="text-2xl font-black text-[#0F1419] dark:text-[#E8EAED]">{dailySchedule.length} Sessions</p>
                        <p className="text-xs font-bold text-[#64748B] dark:text-[#868D9D] mt-1">Scheduled for today</p>
                    </div>

                    <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50 dark:border-blue-800/50">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-[#2563EB] dark:text-[#60A5FA] dark:text-blue-400">
                                <Zap size={20} />
                            </div>
                            <h4 className="font-black text-sm uppercase tracking-wider text-[#475569] dark:text-[#B8BDC6]">Study Mode</h4>
                        </div>
                        <p className="text-2xl font-black text-[#0F1419] dark:text-[#E8EAED]">Full-Time</p>
                        <p className="text-xs font-bold text-[#64748B] dark:text-[#868D9D] mt-1">Academics Regular</p>
                    </div>

                    <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100/50 dark:border-indigo-800/50">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg text-indigo-400">
                                <MapPin size={20} />
                            </div>
                            <h4 className="font-black text-sm uppercase tracking-wider text-[#475569] dark:text-[#B8BDC6]">Campus Area</h4>
                        </div>
                        <p className="text-2xl font-black text-[#0F1419] dark:text-[#E8EAED]">Block A & B</p>
                        <p className="text-xs font-bold text-[#64748B] dark:text-[#868D9D] mt-1">Primary locations</p>
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
                                className="absolute inset-0 bg-[#F3F4F6]/60 dark:bg-[#0F1419]/60 backdrop-blur-sm"
                            ></motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-lg bg-[#E5E7EB] dark:bg-[#1A1F2E] rounded-[3rem] overflow-hidden shadow-2xl border border-[#E2E5E9] dark:border-[#3D4556]"
                            >
                                {/* Modal Header Decoration */}
                                <div className={`h-16 md:h-24 bg-gradient-to-r ${colors[selectedSession.type?.toUpperCase()] || colors.default} relative flex items-center justify-center`}>
                                    <div className="absolute inset-0 bg-[#F3F4F6]/20 dark:bg-[#1A1F2E]/20"></div>
                                    <h4 className="relative text-white font-black tracking-widest uppercase text-[10px] md:text-xs">Session Details</h4>
                                    <button
                                        onClick={() => setSelectedSession(null)}
                                        className="absolute right-4 md:right-6 top-4 md:top-6 p-1.5 md:p-2 bg-[#F1F3F7]/20 dark:bg-[#2D3548]/20 hover:bg-[#F1F3F7]/40 dark:bg-[#2D3548]/40 rounded-full text-white transition-colors"
                                    >
                                        <X size={16} md:size={20} />
                                    </button>
                                </div>

                                <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                                    {/* Subject Info */}
                                    <div className="space-y-2">
                                        <span className="text-[8px] md:text-[10px] font-black text-[#2563EB] dark:text-[#60A5FA] dark:text-blue-400 uppercase tracking-widest">{selectedSession.type} SESSION</span>
                                        <h3 className="text-xl md:text-3xl font-black text-[#0F1419] dark:text-[#E8EAED] leading-tight">{selectedSession.courseName}</h3>
                                        <div className="flex items-center space-x-2">
                                            <span className="px-2 py-0.5 bg-[#E5E7EB] dark:bg-[#242B3D] text-[#64748B] dark:text-[#868D9D] rounded-md text-[8px] md:text-[10px] font-black border border-[#E2E5E9] dark:border-[#3D4556]">{selectedSession.courseCode}</span>
                                            <span className="text-[10px] md:text-sm font-bold text-slate-400 italic">Semester {selectedSession.semester}</span>
                                        </div>
                                    </div>

                                    {/* Detail Grid */}
                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                        <div className="p-3 md:p-4 bg-[#F1F3F7] dark:bg-[#2D3548] rounded-xl md:rounded-2xl border border-[#E2E5E9] dark:border-[#3D4556]">
                                            <div className="flex items-center space-x-2 text-blue-500 mb-1.5 md:mb-2">
                                                <Users size={14} md:size={16} />
                                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tight">Faculty Name</span>
                                            </div>
                                            <p className="text-[11px] md:text-sm font-black text-[#0F1419] dark:text-[#E8EAED]">{selectedSession.faculty || 'Unassigned'}</p>
                                        </div>

                                        <div className="p-3 md:p-4 bg-[#F1F3F7] dark:bg-[#2D3548] rounded-xl md:rounded-2xl border border-[#E2E5E9] dark:border-[#3D4556]">
                                            <div className="flex items-center space-x-2 text-blue-500 mb-1.5 md:mb-2">
                                                <MapPin size={14} md:size={16} />
                                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tight">Room Number</span>
                                            </div>
                                            <p className="text-[11px] md:text-sm font-black text-[#0F1419] dark:text-[#E8EAED]">{selectedSession.room}</p>
                                        </div>

                                        <div className="p-3 md:p-4 bg-[#F1F3F7] dark:bg-[#2D3548] rounded-xl md:rounded-2xl border border-[#E2E5E9] dark:border-[#3D4556] col-span-2">
                                            <div className="flex items-center space-x-2 text-[#2563EB] dark:text-[#60A5FA] mb-1.5 md:mb-2">
                                                <Building2 size={14} md:size={16} />
                                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tight">Building Location</span>
                                            </div>
                                            <p className="text-[11px] md:text-sm font-black text-[#0F1419] dark:text-[#E8EAED]">{getBuilding(selectedSession.room)}</p>
                                        </div>

                                        <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl md:rounded-2xl border border-blue-500/20 col-span-2 flex items-center justify-between">
                                            <div className="flex items-center space-x-2 md:space-x-3 text-[#2563EB] dark:text-[#60A5FA] dark:text-blue-400">
                                                <Clock size={16} md:size={20} />
                                                <span className="text-sm md:text-lg font-black">{selectedSession.startTime} - {selectedSession.endTime}</span>
                                            </div>
                                            <span className="text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 bg-[#2563EB] dark:bg-[#60A5FA] text-white rounded-md md:rounded-lg">LIVE</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedSession(null)}
                                        className="w-full py-4 bg-[#2563EB] dark:bg-[#60A5FA] text-white dark:text-[#0F1419] rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-[#0F1419]/20"
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
