import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    BookOpen,
    Users,
    ClipboardList,
    TrendingUp,
    Calendar,
    GraduationCap,
    Award,
    FileText,
    Clock,
    ArrowRight,
    Search,
    Bell,
    CheckCircle2,
    Zap,
    Sparkles,
    MessageSquare,
    MapPin,
    Briefcase,
    CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

// --- Premium Bento Components ---

const BentoCard = ({ children, className, title, icon: Icon, delay = 0, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        onClick={onClick}
        className={cn(
            "relative overflow-hidden rounded-[2rem] bg-[#F3F4F6] dark:bg-[#1A1F2E] backdrop-blur-xl border border-[#E2E5E9]/50 dark:border-[#3D4556]/50 p-6 group",
            onClick && "cursor-pointer hover:border-blue-500/30 transition-all duration-300",
            className
        )}
    >
        {title && (
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2.5 rounded-2xl bg-[#2563EB]/10 dark:bg-[#60A5FA]/10 text-[#2563EB] dark:text-[#60A5FA]">
                            <Icon size={20} />
                        </div>
                    )}
                    <h3 className="font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tight uppercase text-xs">{title}</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#F1F3F7] dark:bg-[#2D3548] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <ArrowRight size={10} className="text-slate-400" />
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

    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formattedDate = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-[2.5rem] overflow-hidden p-8 md:p-10 flex flex-col justify-between min-h-[350px] shadow-2xl shadow-indigo-500/10"
        >
            {/* Animated Mesh Gradient Background - Professional Blue palette */}
            <div className="absolute inset-0 bg-[#2563EB] dark:bg-[#60A5FA]">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-300 rounded-full blur-[120px] animate-pulse delay-700" />
                <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-blue-500 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 w-fit mb-4"
                        >
                            <Sparkles size={14} className="text-amber-300" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">{formattedDate}</span>
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                            Hello, <br />
                            <span className="text-blue-100">{name.split(' ')[0]}</span>
                        </h1>
                    </div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/10 backdrop-blur-xl px-6 py-6 rounded-[3rem] border border-white/20 flex items-center justify-center shadow-2xl shadow-black/5"
                    >
                        <p className="text-white font-black text-xl tracking-tighter tabular-nums leading-none">{formattedTime}</p>
                    </motion.div>
                </div>

                <div className="flex flex-wrap gap-4 mt-12">
                    <div
                        onClick={() => navigate('/student/attendance')}
                        className="bg-white/10 backdrop-blur-md rounded-[2rem] p-4 border border-white/10 flex-1 min-w-[140px] cursor-pointer hover:bg-white/20 transition-colors"
                    >
                        <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-widest mb-1.5">Attendance</p>
                        <div className="flex items-end gap-2">
                            <p className="text-3xl font-black text-white leading-none">{stats.attendance}%</p>
                            <div className="h-1.5 flex-1 bg-white/10 rounded-full mb-1 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.attendance}%` }}
                                    className="h-full bg-white rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        onClick={() => navigate('/student/results')}
                        className="bg-white/10 backdrop-blur-md rounded-[2rem] p-4 border border-white/10 flex-1 min-w-[140px] cursor-pointer hover:bg-white/20 transition-colors"
                    >
                        <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-widest mb-1.5">CGPA Status</p>
                        <p className="text-3xl font-black text-white leading-none">{stats.cgpa}</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase mt-1 tracking-wider">Out of 10.0</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const TimetableWidget = ({ sessions, navigate }) => {
    const nextSession = sessions.find(s => s.isNext);
    const otherSessions = sessions.filter(s => !s.isNext);

    return (
        <BentoCard
            title="Daily Schedule"
            icon={Calendar}
            className="col-span-1 lg:row-span-1"
            delay={0.2}
            onClick={() => navigate('/student/timetable')}
        >
            <div className="space-y-6">
                {nextSession ? (
                    <div className="p-5 rounded-[2rem] bg-[#2563EB] dark:bg-[#60A5FA] text-white shadow-xl shadow-[#2563EB]/20 dark:shadow-[#60A5FA]/20 group-hover:scale-[1.02] transition-transform">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-white/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm">Upcoming Now</span>
                            <Zap size={18} className="text-amber-300 animate-pulse" />
                        </div>
                        <h4 className="text-xl font-black mb-1 leading-tight">{nextSession.subject}</h4>
                        <div className="flex items-center gap-3 text-blue-100/80 text-sm font-bold mt-2">
                            <Clock size={14} /> {nextSession.time}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <Users size={14} />
                                </div>
                                <span className="text-xs font-bold truncate max-w-[100px]">{nextSession.faculty}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg">
                                <MapPin size={12} /> {nextSession.room}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 rounded-[2rem] bg-[#E5E7EB] dark:bg-[#242B3D] border border-[#E2E5E9] dark:border-[#3D4556] text-center">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Active Sessions</p>
                    </div>
                )}

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Timeline</p>
                    {sessions.length > 0 ? sessions.map((slot, idx) => (
                        <div key={idx} className={cn(
                            "flex items-center gap-4 p-3 rounded-2xl transition-colors",
                            slot.isNext ? "bg-[#2563EB]/10 dark:bg-[#60A5FA]/10 border border-[#2563EB]/20 dark:border-[#60A5FA]/20" : "hover:bg-slate-50 hover:bg-[#F1F3F7] dark:bg-[#2D3548]"
                        )}>
                            <div className="text-[10px] font-black text-slate-500 w-16 text-right leading-none uppercase tracking-tighter">
                                {slot.time.split(' - ')[0]}
                            </div>
                            <div className={cn(
                                "w-1.5 h-8 rounded-full",
                                slot.isNext ? "bg-[#2563EB] dark:bg-[#60A5FA]" : "bg-[#E2E5E9] dark:bg-[#3D4556]"
                            )} />
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-black text-[#0F1419] dark:text-[#E8EAED] truncate">{slot.subject}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{slot.type}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center py-4 text-xs font-bold text-slate-400">Rest day! No classes scheduled.</p>
                    )}
                </div>
            </div>
        </BentoCard>
    );
};

const AssignmentList = ({ assignments, count, navigate }) => (
    <BentoCard
        title="Pending Tasks"
        icon={FileText}
        className="lg:col-span-1"
        delay={0.3}
        onClick={() => navigate('/student/assignments')}
    >
        <div className="space-y-4">
            <div className="flex items-end justify-between px-2 mb-2">
                <p className="text-4xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter">{count}</p>
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full mb-1">Items Due</p>
            </div>

            <div className="space-y-3">
                {assignments.length > 0 ? assignments.map((task, idx) => (
                    <div key={idx} className="p-4 rounded-3xl bg-[#E5E7EB] dark:bg-[#242B3D] border border-[#E2E5E9] dark:border-[#3D4556] group/task hover:border-blue-500/30 transition-all cursor-pointer">
                        <p className="text-[10px] font-black text-[#2563EB] dark:text-[#60A5FA] uppercase tracking-wider mb-1">{task.course}</p>
                        <h4 className="text-sm font-black text-[#0F1419] dark:text-[#E8EAED] leading-tight mb-3 line-clamp-1">{task.title}</h4>
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <Clock size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            <span className="bg-[#E2E5E9] dark:bg-[#3D4556] p-1.5 rounded-full group-hover/task:bg-[#2563EB] dark:bg-[#60A5FA] group-hover/task:text-white transition-colors">
                                <ArrowRight size={10} />
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="py-8 text-center bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                        <CheckCircle2 size={32} className="text-emerald-500/30 mx-auto mb-3" />
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">All caught up!</p>
                    </div>
                )}
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    navigate('/student/assignments');
                }}
                className="w-full mt-2 py-4 rounded-2xl bg-[#2563EB] dark:bg-[#60A5FA] text-white dark:text-[#0F1419] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 active:scale-95 transition"
            >
                View Workspace
            </button>
        </div>
    </BentoCard>
);

const LeaveStatusWidget = ({ stats, navigate }) => (
    <BentoCard
        title="Absence Status"
        icon={Briefcase}
        delay={0.6}
        onClick={() => navigate('/student/leave')}
    >
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <Clock size={16} />
                        </div>
                        <span className="text-xs font-black text-[#0F1419] dark:text-[#E8EAED] uppercase tracking-tighter">Pending</span>
                    </div>
                    <span className="text-xl font-black text-amber-600">{stats?.pending || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={16} />
                        </div>
                        <span className="text-xs font-black text-[#0F1419] dark:text-[#E8EAED] uppercase tracking-tighter">Approved</span>
                    </div>
                    <span className="text-xl font-black text-emerald-600">{stats?.approved || 0}</span>
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    navigate('/student/leave');
                }}
                className="w-full py-4 rounded-[2rem] bg-[#2563EB] dark:bg-[#60A5FA] text-white dark:text-[#0F1419] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 active:scale-95 transition"
            >
                Management Hub
            </button>
        </div>
    </BentoCard>
);

const FeesStatusWidget = ({ stats, navigate }) => (
    <BentoCard
        title="Fees & Payments"
        icon={CreditCard}
        className="lg:col-span-1"
        delay={0.65}
        onClick={() => navigate('/student/fees')}
    >
        <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10 text-center py-6">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
                <p className="text-2xl font-black text-[#0F1419] dark:text-[#E8EAED]">₹{(stats.totalFees || 0).toLocaleString()}</p>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    navigate('/student/fees');
                }}
                className="w-full py-4 rounded-[2rem] bg-[#2563EB] dark:bg-[#60A5FA] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#2563EB]/20 dark:shadow-[#60A5FA]/20 active:scale-95 transition"
            >
                Pay Now
            </button>
        </div>
    </BentoCard>
);

const DashboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        enrolledCourses: 0,
        attendance: 0,
        cgpa: 0,
        totalFees: 0,
        pendingAssignmentsCount: 0,
        pendingAssignments: [],
        leaveStats: { pending: 0, approved: 0, rejected: 0 }
    });
    const [timetable, setTimetable] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [grades, setGrades] = useState([]);
    const [attendanceOverview, setAttendanceOverview] = useState([]);
    const [studentName, setStudentName] = useState('Student');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                const res = await axios.get('http://localhost:5000/api/student/dashboard-stats', config);

                setStudentName(res.data.studentName);
                setStats(res.data.stats);
                setTimetable(res.data.timetable);
                setAnnouncements(res.data.announcements);
                setGrades(res.data.recentGrades);
                setAttendanceOverview(res.data.attendanceOverview);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Layout role="student">
                <div className="flex justify-center items-center h-screen">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-[#0066CC]/20 rounded-full animate-ping" />
                        <div className="absolute inset-0 w-20 h-20 border-t-4 border-[#0066CC] rounded-full animate-spin" />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="student">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in-up">

                {/* Bento Layer 1: Hero & High Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-1 gap-6">

                    {/* Hero Section */}
                    <MeshGradientHero name={studentName} stats={stats} navigate={navigate} />

                    {/* Today's Schedule (Spotlight + Timeline) */}
                    <TimetableWidget sessions={timetable} navigate={navigate} />

                    {/* Pending Assignments List */}
                    <AssignmentList
                        assignments={stats.pendingAssignments || []}
                        count={stats.pendingAssignmentsCount}
                        navigate={navigate}
                    />

                </div>

                {/* Bento Layer 2: Analytics & Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">


                    {/* Attendance Detail Bento */}
                    <BentoCard
                        title="Attendance Insights"
                        icon={TrendingUp}
                        className="md:col-span-2"
                        delay={0.4}
                        onClick={() => navigate('/student/attendance')}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                            {attendanceOverview.slice(0, 4).map((item, idx) => {
                                const percent = item.total > 0 ? Math.round((item.attended / item.total) * 100) : 0;
                                return (
                                    <div key={idx} className="p-6 rounded-[2.5rem] bg-[#E5E7EB] dark:bg-[#242B3D] border border-[#E2E5E9] dark:border-[#3D4556] transition-transform hover:translate-y-[-4px]">
                                        <div className="flex justify-between items-center mb-5">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject</p>
                                                <p className="text-sm font-black text-[#0F1419] dark:text-[#E8EAED] truncate max-w-[160px]">{item.subject}</p>
                                            </div>
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black",
                                                percent >= 75 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                                            )}>{percent}%</div>
                                        </div>
                                        <div className="w-full bg-[#E2E5E9] dark:bg-[#3D4556] rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 + (idx * 0.1) }}
                                                className={cn(
                                                    "h-full rounded-full",
                                                    percent >= 75 ? "bg-emerald-500" : "bg-rose-500"
                                                )}
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold mt-3 text-right">
                                            {item.attended} / {item.total} CLASSES
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </BentoCard>

                    {/* Quick Grades Bento */}
                    <BentoCard
                        title="Latest Grades"
                        icon={Award}
                        delay={0.5}
                        onClick={() => navigate('/student/results')}
                    >
                        <div className="space-y-3">
                            {grades.length > 0 ? grades.map((grade, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-3xl bg-[#E5E7EB] dark:bg-[#242B3D] border border-[#E2E5E9]/50 dark:border-[#3D4556]/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#2563EB] dark:bg-[#60A5FA] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-[#2563EB]/20 dark:shadow-[#60A5FA]/20">
                                            {grade.grade}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-[#0F1419] dark:text-[#E8EAED] line-clamp-1">{grade.subject}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified Entry</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-[#0F1419] dark:text-[#E8EAED]">{grade.marks}</p>
                                        <div className="w-8 h-1 bg-[#E2E5E9] dark:bg-[#3D4556] rounded-full mt-1 ml-auto overflow-hidden">
                                            <div className="h-full bg-[#2563EB] dark:bg-[#60A5FA]" style={{ width: `${(grade.marks / grade.maxMarks) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center bg-[#E5E7EB] dark:bg-[#242B3D] rounded-[2rem] border border-dashed border-[#E2E5E9] dark:border-[#3D4556]">
                                    <GraduationCap size={32} className="text-slate-300 mx-auto mb-3" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No results posted</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/student/results')}
                            className="w-full mt-6 py-4 rounded-[2rem] bg-blue-500/10 text-[#2563EB] dark:text-[#60A5FA] dark:bg-blue-400/10 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500/20 transition"
                        >
                            Explore Full Result
                        </button>
                    </BentoCard>

                    {/* Leave Status Bento */}
                    <LeaveStatusWidget stats={stats.leaveStats} navigate={navigate} />

                </div>

                {/* Layer 3 - Wide News & Features */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Announcements Ticker Style */}
                    <BentoCard
                        title="Announcements"
                        icon={Bell}
                        className="lg:col-span-2"
                        delay={0.6}
                        onClick={() => navigate('/student/notifications')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                            {announcements.slice(0, 2).map((notice, idx) => (
                                <div key={idx} className="p-6 rounded-[2.5rem] bg-[#E5E7EB] dark:bg-[#242B3D] border border-[#E2E5E9] dark:border-[#3D4556] flex flex-col justify-between group/ann">
                                    <div>
                                        <div className="flex items-center justify-between mb-5">
                                            <span className={cn(
                                                "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                                notice.type === 'urgent' ? "bg-rose-500 text-white" : "bg-[#2563EB] dark:bg-[#60A5FA] text-white"
                                            )}>{notice.type}</span>
                                            <div className="w-8 h-8 rounded-full bg-[#E5E7EB] dark:bg-[#242B3D] flex items-center justify-center opacity-0 group-hover/ann:opacity-100 transition-opacity">
                                                <ArrowRight size={14} className="text-[#2563EB] dark:text-[#60A5FA]" />
                                            </div>
                                        </div>
                                        <h4 className="font-black text-[#0F1419] dark:text-[#E8EAED] mb-3 leading-[1.2] line-clamp-2 text-base">{notice.title}</h4>
                                        <p className="text-xs text-[#64748B] dark:text-[#868D9D] line-clamp-3 leading-relaxed">{notice.content}</p>
                                    </div>
                                    <div className="mt-8 flex items-center justify-between pt-5 border-t border-[#E2E5E9]/50 dark:border-[#3D4556]/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] flex items-center justify-center text-[10px] font-black text-white">
                                                {notice.author[0]}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{notice.author}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">{new Date(notice.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </BentoCard>

                    {/* Fees Widget */}
                    <FeesStatusWidget stats={stats} navigate={navigate} />

                    {/* Support Button Integrated */}
                    <div className="lg:col-span-1">
                        <button
                            onClick={() => navigate('/student/support')}
                            className="w-full h-full group p-8 rounded-[3rem] bg-[#2563EB] dark:bg-[#60A5FA] text-white shadow-2xl shadow-[#2563EB]/20 dark:shadow-[#60A5FA]/20 flex flex-col justify-between transition-transform active:scale-95"
                        >
                            <div className="flex justify-between items-start w-full">
                                <div className="p-4 rounded-[1.5rem] bg-white/10 backdrop-blur-md">
                                    <MessageSquare size={28} />
                                </div>
                                <div className="p-2 rounded-full bg-white/20">
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="text-left mt-12">
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Internal Support</p>
                                <h3 className="text-3xl font-black tracking-tighter leading-none">Experience <br />Support</h3>
                                <p className="text-white/60 text-xs font-bold mt-4 leading-relaxed">Need help with registration, <br />fees, or courses? We're here.</p>
                            </div>
                        </button>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default DashboardPage;
