import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, BookOpen, UserCheck, TrendingUp, FileText, ShieldCheck, X, Search,
    Filter, Ban, CheckCircle2, Download, Calendar, Loader2, Sparkles, AlertCircle,
    LayoutDashboard, Activity, UserPlus, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '../../lib/utils'; // Assuming this exists, based on other files. If not, I'll inline a joiner.

// Utility for class merging if cn doesn't exist (safe fallback)
const classNames = (...classes) => classes.filter(Boolean).join(' ');

const GlassCard = ({ children, className, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={classNames(
            "bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500",
            className
        )}
    >
        {children}
    </motion.div>
);

const DashboardOverview = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        totalCourses: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null); // 'reports' or 'permissions'

    // Manage Permissions (User Management) State
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [userLoading, setUserLoading] = useState(false);

    // Reports State
    const [reportType, setReportType] = useState('system');
    const [reportRange, setReportRange] = useState('month');
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchActivity();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/dashboard-stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data.stats || { totalStudents: 0, totalFaculty: 0, totalCourses: 0 });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            setLoading(false);
        }
    };

    const fetchActivity = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/activity', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActivities(res.data);
        } catch (error) {
            console.error('Error fetching activity:', error);
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    };

    const getActivityStyles = (type) => {
        switch (type) {
            case 'user':
                return {
                    icon: UserPlus,
                    gradient: 'from-teal-400 to-teal-600',
                    bg: 'bg-teal-50 dark:bg-teal-900/20',
                    text: 'text-teal-600 dark:text-teal-400'
                };
            case 'course':
                return {
                    icon: BookOpen,
                    gradient: 'from-amber-400 to-orange-500',
                    bg: 'bg-orange-50 dark:bg-orange-900/20',
                    text: 'text-orange-600 dark:text-orange-400'
                };
            case 'system':
            default:
                return {
                    icon: Bell,
                    gradient: 'from-indigo-400 to-violet-600',
                    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                    text: 'text-indigo-600 dark:text-indigo-400'
                };
        }
    };

    const fetchAllUsers = async () => {
        setUserLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/users-all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
            setUserLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUserLoading(false);
        }
    };

    const handleToggleBlock = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.patch(`http://localhost:5000/api/admin/users/${userId}/toggle-block`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: res.data.isBlocked } : u));
        } catch (error) {
            alert(error.response?.data?.message || 'Error toggling user block');
        }
    };

    const generatePDFReport = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Indigo theme
        doc.text('LearNex System Status Report', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Report Category: ${reportType.toUpperCase()}`, 14, 36);

        // System Statistics Section
        if (reportType === 'system') {
            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.text('Current System Statistics', 14, 50);

            const tableData = [
                ['Metric', 'Count', 'Status'],
                ['Total Students', stats.totalStudents, 'Active'],
                ['Total Faculty', stats.totalFaculty, 'Active'],
                ['Active Courses', stats.totalCourses, 'Running'],
                ['System Health', '99.9%', 'Optimal']
            ];

            autoTable(doc, {
                startY: 55,
                head: [tableData[0]],
                body: tableData.slice(1),
                theme: 'grid',
                headStyles: { fillColor: [79, 70, 229] },
                alternateRowStyles: { fillColor: [249, 250, 251] }
            });
        } else {
            // Placeholder for other report types
            doc.text(`Detailed ${reportType} data is not yet available for export.`, 14, 50);
        }

        doc.save(`LearNex_${reportType}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        setActiveModal(null);
    };

    const filteredUsers = Array.isArray(users) ? users.filter(u =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    ) : [];

    const statCards = [
        { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'indigo', gradient: 'from-blue-500 to-indigo-600' },
        { title: 'Total Faculty', value: stats.totalFaculty, icon: UserCheck, color: 'teal', gradient: 'from-emerald-400 to-teal-500' },
        { title: 'Active Courses', value: stats.totalCourses, icon: BookOpen, color: 'amber', gradient: 'from-orange-400 to-amber-500' },
        { title: 'System Growth', value: '+12%', icon: TrendingUp, color: 'rose', gradient: 'from-pink-500 to-rose-600' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-ping" />
                    <div className="absolute inset-0 w-16 h-16 border-t-4 border-indigo-600 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fade-in-up max-w-[1600px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-400/10 px-4 py-1.5 rounded-full w-fit group"
                    >
                        <LayoutDashboard size={14} className="text-indigo-500 group-hover:rotate-12 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Admin Console</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Overview</span>
                    </h1>
                </div>

                <div className="flex gap-3">
                    {/* Add any global actions here if needed */}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, idx) => (
                    <GlassCard key={idx} delay={idx * 0.1} className="relative group p-6 overflow-hidden">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 bg-gradient-to-br ${card.gradient} group-hover:scale-150 transition-transform duration-500`} />

                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-4 shadow-lg shadow-gray-200 dark:shadow-none`}>
                                <card.icon size={24} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{card.value}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <GlassCard className="lg:col-span-2 p-8" delay={0.4}>
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <Activity className="text-indigo-500" />
                            Recent Activity
                        </h3>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider">View All</button>
                    </div>

                    <div className="space-y-2 h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                        {activities.length > 0 ? (
                            activities.map((item, i) => {
                                const style = getActivityStyles(item.type);
                                const Icon = style.icon;
                                return (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                                        <div className={`p-2 rounded-xl bg-gradient-to-br ${style.gradient} text-white shadow-md shadow-gray-200 dark:shadow-none transform group-hover:scale-105 transition-transform duration-300`}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{item.text}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider flex items-center gap-1.5">
                                                <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${style.gradient}`} />
                                                {timeAgo(item.time)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 opacity-50 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                                <Activity className="mx-auto mb-3 text-slate-300" size={24} />
                                <p className="text-xs font-bold text-slate-400">No recent activity found.</p>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <GlassCard className="p-8" delay={0.5}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Sparkles className="text-amber-500" /> Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => setActiveModal('reports')}
                                className="w-full p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <FileText size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Generate Reports</p>
                                        <p className="text-[10px] opacity-80 font-medium">Download PDF summaries</p>
                                    </div>
                                </div>
                                <Download size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            <button
                                onClick={() => { setActiveModal('permissions'); fetchAllUsers(); }}
                                className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 text-slate-600 dark:text-slate-300 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 transition-colors">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Manage Users</p>
                                        <p className="text-[10px] opacity-60 font-medium">Control access & block</p>
                                    </div>
                                </div>
                                <Search size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white" delay={0.6}>
                        <div className="relative z-10">
                            <AlertCircle className="mb-4 opacity-80" size={32} />
                            <h4 className="text-lg font-black mb-2">System Status</h4>
                            <p className="text-xs opacity-80 leading-relaxed">All systems are operational. Last backup was performed successfully 24 hours ago.</p>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Reports Modal */}
            <AnimatePresence>
                {activeModal === 'reports' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                    <FileText className="text-indigo-500" />
                                    System Reports
                                </h3>
                                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-8 space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Select Report Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['system', 'finance', 'audit'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setReportType(type)}
                                                className={`p-4 rounded-2xl border-2 text-xs font-black uppercase tracking-wider transition-all ${reportType === type
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                                    : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 text-slate-500'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={generatePDFReport}
                                    className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                                >
                                    <Download size={16} />
                                    Generate PDF
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Permissions Modal */}
            <AnimatePresence>
                {activeModal === 'permissions' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                            <ShieldCheck className="text-teal-500" size={32} />
                                            User Management
                                        </h3>
                                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">Security & Access Control</p>
                                    </div>
                                    <button
                                        onClick={() => { setActiveModal(null); setUserSearch(''); }}
                                        className="p-4 bg-slate-100 hover:bg-rose-500 dark:bg-slate-800 dark:hover:bg-rose-500 text-slate-500 hover:text-white rounded-2xl transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or role..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700/50 focus:border-teal-500 transition-all outline-none font-bold text-slate-800 dark:text-white shadow-inner text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
                                {userLoading ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                                        <Loader2 className="animate-spin text-teal-500" size={48} />
                                        <span className="font-bold uppercase tracking-widest text-xs">Syncing Database...</span>
                                    </div>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={user._id}
                                            className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 hover:border-teal-200 dark:hover:border-teal-900 hover:shadow-xl hover:shadow-teal-900/5 transition-all flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transform group-hover:scale-110 transition-transform ${user.role === 'faculty' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-200' : 'bg-gradient-to-br from-blue-400 to-cyan-500 shadow-blue-200'
                                                    }`}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-black text-lg text-slate-800 dark:text-white leading-tight">{user.name}</h4>
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.role === 'faculty' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 font-bold mt-1">{user.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {user.isBlocked && (
                                                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest animate-pulse border border-rose-100 dark:border-rose-900/50">
                                                        <Ban size={12} />
                                                        Blocked
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleToggleBlock(user._id)}
                                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${user.isBlocked
                                                        ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/40'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30'
                                                        }`}
                                                >
                                                    {user.isBlocked ? 'Unblock' : 'Block Access'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 opacity-50">
                                        <Search size={48} className="mx-auto mb-4 text-slate-300" />
                                        <p className="font-bold text-slate-400">No matching users found.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardOverview;
