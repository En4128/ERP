import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    BookOpen,
    Users,
    Calendar,
    ClipboardList,
    Bell,
    PlusCircle,
    CheckCircle,
    ArrowRight,
    TrendingUp,
    Clock,
    Zap,
    Sparkles,
    MessageSquare,
    UserCircle,
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// --- Premium Bento Components ---

const BentoCard = ({ children, className, title, icon: Icon, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={cn(
            "relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8 group",
            className
        )}
    >
        {title && (
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-400">
                            <Icon size={20} />
                        </div>
                    )}
                    <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase text-xs">{title}</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <ArrowRight size={14} className="text-slate-400" />
                </div>
            </div>
        )}
        {children}
    </motion.div>
);

const MeshGradientHero = ({ name, stats, navigate }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-[3rem] overflow-hidden p-8 md:p-10 flex flex-col justify-between min-h-[350px] shadow-2xl shadow-indigo-500/10"
        >
            {/* Animated Mesh Gradient Background */}
            <div className="absolute inset-0 bg-indigo-600">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400 rounded-full blur-[120px] animate-pulse delay-700" />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-indigo-400 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 w-fit mb-6"
                        >
                            <Sparkles size={14} className="text-amber-300" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Faculty Leadership Portal</span>
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                            Welcome, <br />
                            <span className="text-indigo-200">Prof. {name.split(' ').pop()}</span>
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-12">
                    <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-5 border border-white/10 flex-1 min-w-[150px]">
                        <p className="text-indigo-100/60 text-[10px] font-black uppercase tracking-widest mb-1.5">Assigned Courses</p>
                        <p className="text-4xl font-black text-white leading-none">{stats.totalCourses?.value || 0}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-5 border border-white/10 flex-1 min-w-[150px]">
                        <p className="text-indigo-100/60 text-[10px] font-black uppercase tracking-widest mb-1.5">Scheduled Today</p>
                        <p className="text-4xl font-black text-white leading-none">{stats.classesToday?.value || 0}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ActivityWidget = ({ title, value, icon: Icon, variant = "indigo", onClick }) => {
    const variants = {
        indigo: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/50",
        emerald: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50",
        purple: "bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50",
        amber: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "p-6 rounded-[2rem] border flex flex-col justify-between items-start text-left h-[180px] w-full transition-all shadow-sm hover:shadow-xl",
                variants[variant]
            )}
        >
            <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-current opacity-20 group-hover:opacity-100">
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">{title}</p>
                <p className="text-3xl font-black tracking-tighter">{value}</p>
            </div>
        </motion.button>
    );
};

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        facultyName: '',
        stats: { totalCourses: 0, classesToday: 0, pendingEvaluations: 0 },
        todayClasses: [],
        announcements: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/faculty/dashboard-stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Dashboard error:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in-up">

                {/* Layer 1: Hero & Primary Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    <MeshGradientHero name={data.facultyName} stats={data.stats} />

                    <div className="grid grid-cols-2 gap-4 lg:col-span-1">
                        <ActivityWidget
                            title="Pending Evals"
                            value={data.stats.pendingEvaluations?.value || 0}
                            icon={ClipboardList}
                            variant="amber"
                            onClick={() => navigate('/faculty/marks')}
                        />
                        <ActivityWidget
                            title="Messages"
                            value="4"
                            icon={MessageSquare}
                            variant="purple"
                            onClick={() => { }}
                        />
                        <button
                            onClick={() => navigate('/faculty/notifications')}
                            className="col-span-2 group p-6 rounded-[2.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-slate-900 dark:border-white shadow-xl shadow-indigo-500/10 flex items-center justify-between transition-transform active:scale-95"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-white/10 dark:bg-slate-900/10">
                                    <PlusCircle size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-white/60 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Action Center</p>
                                    <p className="font-black">Create Announcement</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>

                    <BentoCard title="Daily Schedule" icon={Calendar} className="lg:row-span-1">
                        <div className="space-y-4">
                            {data.todayClasses.length > 0 ? data.todayClasses.map((session, idx) => (
                                <div key={idx} className="p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 group/item hover:border-indigo-500/30 transition-all cursor-pointer" onClick={() => navigate('/faculty/attendance', { state: { courseId: session.courseId } })}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight line-clamp-1">{session.subject}</h4>
                                        <div className="bg-indigo-500/10 text-indigo-500 p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <ArrowRight size={12} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                        <div className="flex items-center gap-1.5"><Clock size={12} /> {session.time}</div>
                                        <div className="flex items-center gap-1.5"><MapPin size={12} /> {session.room}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                                    <Clock size={32} className="text-slate-300 mx-auto mb-3" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No classes today</p>
                                </div>
                            )}
                            <button
                                onClick={() => navigate('/faculty/timetable')}
                                className="w-full mt-2 py-4 rounded-[2rem] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500/20 transition"
                            >
                                View Timeline
                            </button>
                        </div>
                    </BentoCard>

                </div>

                {/* Layer 2: Main Features */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <BentoCard title="Quick Management" className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                onClick={() => navigate('/faculty/attendance')}
                                className="p-8 rounded-[2.5rem] bg-emerald-500 dark:bg-emerald-600 text-white cursor-pointer group shadow-lg shadow-emerald-500/10"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md">
                                        <CheckCircle size={32} />
                                    </div>
                                    <div className="p-2 rounded-full bg-white/20">
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                                <h4 className="text-2xl font-black tracking-tight mb-2">Mark Attendance</h4>
                                <p className="text-emerald-100 text-xs font-bold leading-relaxed">Update daily attendance records for all assigned course units.</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                onClick={() => navigate('/faculty/marks')}
                                className="p-8 rounded-[2.5rem] bg-indigo-600 dark:bg-indigo-700 text-white cursor-pointer group shadow-lg shadow-indigo-500/10"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md">
                                        <TrendingUp size={32} />
                                    </div>
                                    <div className="p-2 rounded-full bg-white/20">
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                                <h4 className="text-2xl font-black tracking-tight mb-2">Academic Performance</h4>
                                <p className="text-indigo-100 text-xs font-bold leading-relaxed">Upload and manage student examination and assessment results.</p>
                            </motion.div>
                        </div>
                    </BentoCard>

                    <BentoCard title="Student Directory" icon={Users}>
                        <div className="p-6 rounded-[2rem] bg-slate-900 text-white h-full flex flex-col justify-between">
                            <div>
                                <h4 className="text-xl font-black tracking-tighter mb-4">Manage <br />Cohort</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><UserCircle size={16} /></div>
                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-400 w-[70%]" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><UserCircle size={16} /></div>
                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-400 w-[85%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/faculty/students')}
                                className="w-full mt-8 py-4 rounded-2xl bg-white text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition"
                            >
                                Open Directory
                            </button>
                        </div>
                    </BentoCard>
                </div>

                {/* Layer 3: Announcements */}
                <BentoCard title="Faculty Notice Board" icon={Bell}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {data.announcements.length > 0 ? data.announcements.slice(0, 3).map((a, idx) => (
                            <div key={idx} className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 flex flex-col justify-between group/ann">
                                <div>
                                    <div className="flex justify-between items-start mb-5">
                                        <span className="text-[10px] font-black px-3 py-1 bg-indigo-500 text-white rounded-full uppercase tracking-widest">Notice</span>
                                        <span className="text-[10px] font-bold text-slate-400">{new Date(a.date).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-black text-slate-800 dark:text-white mb-3 text-base leading-tight group-hover/ann:text-indigo-500 transition-colors">{a.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{a.content}</p>
                                </div>
                                <div className="mt-8 flex items-center gap-2 pt-5 border-t border-slate-200/50 dark:border-slate-700/50">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">
                                        {a.author[0]}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{a.author}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-3 py-16 text-center">
                                <Bell size={48} className="text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold">No active notices for your department.</p>
                            </div>
                        )}
                    </div>
                </BentoCard>

            </div>
        </Layout>
    );
};

const MapPin = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

export default FacultyDashboard;
