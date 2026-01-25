import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    Calendar,
    Check,
    X,
    Users,
    Clock,
    Save,
    Search,
    Download,
    AlertTriangle,
    ChevronRight,
    ArrowLeft,
    Filter,
    BarChart3,
    ArrowRight,
    Zap,
    Sparkles,
    UserCircle,
    CheckCircle2,
    TrendingUp,
    Plus,
    QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import QRGenerator from '../../components/QRGenerator';

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

const FacultyAttendance = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [activeTab, setActiveTab] = useState('mark');
    const [students, setStudents] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            fetchCourseSpecificData();
        }
    }, [selectedCourseId, date]);

    useEffect(() => {
        let interval;
        if (selectedCourseId && activeTab === 'mark') {
            interval = setInterval(fetchCourseSpecificData, 5000);
        }
        return () => clearInterval(interval);
    }, [selectedCourseId, date, activeTab]);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/faculty/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data);

            if (location.state?.courseId) {
                setSelectedCourseId(location.state.courseId);
            } else if (res.data.length > 0) {
                setSelectedCourseId(res.data[0]._id);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching courses:", error);
            setLoading(false);
        }
    };

    const fetchCourseSpecificData = async () => {
        try {
            const token = localStorage.getItem('token');

            const stdRes = await axios.get(`http://localhost:5000/api/faculty/courses/${selectedCourseId}/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(stdRes.data);

            const attRes = await axios.get(`http://localhost:5000/api/faculty/attendance?courseId=${selectedCourseId}&date=${date}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const currentMap = {};
            stdRes.data.forEach(s => currentMap[s._id] = 'Absent');
            attRes.data.forEach(rec => currentMap[typeof rec.student === 'object' ? rec.student._id : rec.student] = rec.status);
            setAttendanceData(currentMap);

            const histRes = await axios.get(`http://localhost:5000/api/faculty/courses/${selectedCourseId}/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(histRes.data);

        } catch (error) {
            console.error("Error fetching course data:", error);
        }
    };

    const currentCourse = courses.find(c => c._id === selectedCourseId);

    const filteredStudents = students.filter(student =>
        student.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const presentCount = Object.values(attendanceData).filter(v => v === 'Present').length;
    const absentCount = Object.values(attendanceData).filter(v => v === 'Absent').length;

    const markAll = (status) => {
        const newData = {};
        students.forEach(s => newData[s._id] = status);
        setAttendanceData(newData);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                courseId: selectedCourseId,
                date: date,
                attendanceData: Object.entries(attendanceData).map(([studentId, status]) => ({
                    studentId,
                    status
                }))
            };

            await axios.post('http://localhost:5000/api/faculty/attendance', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Attendance saved successfully!');
            fetchCourseSpecificData();
        } catch (error) {
            console.error("Error saving attendance:", error);
            alert('Failed to save attendance.');
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
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up">

                {courses.length === 0 ? (
                    <GlassCard className="p-20 flex flex-col items-center justify-center text-center min-h-[600px] border-dashed">
                        <div className="w-24 h-24 rounded-[3rem] bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                            <Sparkles size={40} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Start Your Journey</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 font-bold leading-relaxed">
                            You haven't joined any courses yet. Once you join a course unit, you'll be able to mark attendance and manage your students here.
                        </p>
                        <button
                            onClick={() => navigate('/faculty/courses')}
                            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <Plus size={16} /> Discover Courses
                        </button>
                    </GlassCard>
                ) : (
                    <>
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-400/10 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 w-fit"
                                >
                                    <Sparkles size={14} className="text-indigo-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Attendance Portal</span>
                                </motion.div>
                                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                                    Session <br />
                                    <span className="text-indigo-600 dark:text-indigo-400">Management</span>
                                </h1>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative group">
                                    <p className="absolute -top-6 left-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Course</p>
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        className="w-full sm:w-72 pl-6 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white appearance-none transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-800 uppercase tracking-wider"
                                    >
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>{course.code} • {course.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <Filter size={16} />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <p className="absolute -top-6 left-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full sm:w-48 pl-6 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all uppercase tracking-wider"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Info Bar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Enrolled', value: students.length, icon: Users, color: 'indigo' },
                                { label: 'Marked Present', value: presentCount, icon: CheckCircle2, color: 'emerald' },
                                { label: 'Marked Absent', value: absentCount, icon: X, color: 'rose' },
                                { label: 'Attendance Rate', value: `${students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0}%`, icon: TrendingUp, color: 'amber' },
                            ].map((stat, idx) => (
                                <GlassCard key={idx} className="p-6 md:p-8" delay={idx * 0.1}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={cn("p-3 rounded-2xl bg-opacity-10", {
                                            "bg-indigo-500 text-indigo-500": stat.color === 'indigo',
                                            "bg-emerald-500 text-emerald-500": stat.color === 'emerald',
                                            "bg-rose-500 text-rose-500": stat.color === 'rose',
                                            "bg-amber-500 text-amber-500": stat.color === 'amber',
                                        })}>
                                            <stat.icon size={20} />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
                                </GlassCard>
                            ))}
                        </div>

                        {/* Tabs & Content */}
                        <div className="space-y-6">
                            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                                {[
                                    { id: 'mark', label: 'Mark Attendance', icon: Check },
                                    { id: 'qr', label: 'QR Attendance', icon: QrCode },
                                    { id: 'history', label: 'Past Records', icon: Clock },
                                    { id: 'low', label: 'Alerts', icon: AlertTriangle },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 border",
                                            activeTab === tab.id
                                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg shadow-indigo-500/10"
                                                : "bg-white dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-500"
                                        )}
                                    >
                                        <tab.icon size={14} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'mark' && (
                                    <motion.div
                                        key="mark"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-6"
                                    >
                                        <GlassCard className="p-0">
                                            <div className="p-6 md:p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="relative flex-1 max-w-xl group">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                                    <input
                                                        placeholder="Search student by name or ID..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all shadow-inner"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => markAll('Present')}
                                                        className="px-6 py-4 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                                                    >
                                                        <CheckCircle2 size={16} /> All Present
                                                    </button>
                                                    <button
                                                        onClick={() => markAll('Absent')}
                                                        className="px-6 py-4 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
                                                    >
                                                        <X size={16} /> All Absent
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800">
                                                            <th className="px-10 py-6">Identity</th>
                                                            <th className="px-10 py-6">ID Number</th>
                                                            <th className="px-10 py-6 text-center">Current Status</th>
                                                            <th className="px-10 py-6 text-right">Toggle Presence</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                        {filteredStudents.map((std, idx) => (
                                                            <motion.tr
                                                                key={std._id}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: idx * 0.03 }}
                                                                className={cn(
                                                                    "group transition-colors",
                                                                    attendanceData[std._id] === 'Absent' ? "bg-rose-500/[0.02] dark:bg-rose-500/[0.05]" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                                                )}
                                                            >
                                                                <td className="px-10 py-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center overflow-hidden border border-indigo-200/50 dark:border-indigo-800/50">
                                                                            <img
                                                                                src={`https://ui-avatars.com/api/?name=${std.user.name}&background=6366f1&color=fff&bold=true`}
                                                                                alt={std.user.name}
                                                                                className="w-full h-full"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-black text-slate-900 dark:text-white text-sm">{std.user.name}</p>
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{std.user.email}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-10 py-6 font-black text-slate-500 dark:text-slate-400 text-xs tracking-widest">{std.admissionNumber}</td>
                                                                <td className="px-10 py-6 text-center">
                                                                    <span className={cn(
                                                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                                        attendanceData[std._id] === 'Present'
                                                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                                            : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                                                    )}>
                                                                        {attendanceData[std._id]}
                                                                    </span>
                                                                </td>
                                                                <td className="px-10 py-6">
                                                                    <div className="flex items-center justify-end gap-3">
                                                                        <button
                                                                            onClick={() => setAttendanceData(p => ({ ...p, [std._id]: 'Present' }))}
                                                                            className={cn(
                                                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border",
                                                                                attendanceData[std._id] === 'Present'
                                                                                    ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                                                                                    : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:text-emerald-500"
                                                                            )}
                                                                        >
                                                                            <Check size={20} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setAttendanceData(p => ({ ...p, [std._id]: 'Absent' }))}
                                                                            className={cn(
                                                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border",
                                                                                attendanceData[std._id] === 'Absent'
                                                                                    ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20"
                                                                                    : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 hover:border-rose-500 hover:text-rose-500"
                                                                            )}
                                                                        >
                                                                            <X size={20} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="p-10 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={saving}
                                                    className="px-10 py-5 rounded-[2.5rem] bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
                                                >
                                                    {saving ? 'Processing...' : <><Save size={18} /> Sync Attendance</>}
                                                </button>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                )}

                                {activeTab === 'qr' && (
                                    <motion.div
                                        key="qr"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <QRGenerator courses={courses} />
                                    </motion.div>
                                )}

                                {activeTab === 'history' && (
                                    <motion.div
                                        key="history"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                    >
                                        <GlassCard className="p-0">
                                            <div className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                                                    <BarChart3 size={24} className="text-indigo-600" /> Archive Records
                                                </h3>
                                                <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                                    <Download size={14} /> Export CSV
                                                </button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800">
                                                            <th className="px-10 py-6">Session Date</th>
                                                            <th className="px-10 py-6">Engagement</th>
                                                            <th className="px-10 py-6 text-center">Compliance</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                        {history.length > 0 ? history.map((record) => (
                                                            <tr key={record.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                                <td className="px-10 py-6 font-black text-slate-800 dark:text-white text-sm">
                                                                    {new Date(record.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                                </td>
                                                                <td className="px-10 py-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-sm">
                                                                            <Check size={14} /> {record.present}
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 text-rose-600 font-black text-sm">
                                                                            <X size={14} /> {record.absent}
                                                                        </div>
                                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                            Total {record.total}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-10 py-6 text-center">
                                                                    <div className={cn(
                                                                        "inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                                        record.present / record.total >= 0.75
                                                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                                    )}>
                                                                        {Math.round((record.present / record.total) * 100)}% SUCCESS
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )) : (
                                                            <tr>
                                                                <td colSpan="3" className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">No historical data found.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default FacultyAttendance;
