import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BookOpen, UserCheck, TrendingUp, FileText, ShieldCheck, X, Search, Filter, Ban, CheckCircle2, Download, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    const [reportType, setReportType] = useState('attendance');
    const [reportRange, setReportRange] = useState('month');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/dashboard-stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data.stats);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            setLoading(false);
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

        // Add Header
        doc.setFontSize(22);
        doc.setTextColor(124, 58, 237); // Purple theme
        doc.text('LearNex Academic Report', 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
        doc.text(`Report Type: ${reportType.toUpperCase()}`, 20, 37);
        doc.text(`Date Range: ${reportRange.toUpperCase()}`, 20, 44);

        // Sample Data for PDF
        const tableData = [
            ['Student Name', 'ID', 'Department', 'Attendance %', 'Average Grade'],
            ['John Doe', 'STU1024', 'Computer Science', '92%', 'A'],
            ['Jane Smith', 'STU1025', 'Information Tech', '88%', 'B+'],
            ['Mike Johnson', 'STU1026', 'Electronics', '95%', 'O'],
            ['Sarah Williams', 'STU1027', 'Mechanical Eng', '84%', 'B'],
        ];

        doc.autoTable({
            startY: 55,
            head: [tableData[0]],
            body: tableData.slice(1),
            theme: 'striped',
            headStyles: { fillStyle: [124, 58, 237] }
        });

        doc.save(`LearNex_${reportType}_Report.pdf`);
        setActiveModal(null);
    };

    const filteredUsers = Array.isArray(users) ? users.filter(u =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    ) : [];

    const statCards = [
        { title: 'Total Students', value: stats.totalStudents, icon: <Users size={24} />, color: 'bg-blue-700' },
        { title: 'Total Faculty', value: stats.totalFaculty, icon: <UserCheck size={24} />, color: 'bg-teal-500' },
        { title: 'Active Courses', value: stats.totalCourses, icon: <BookOpen size={24} />, color: 'bg-amber-500' },
        { title: 'System Growth', value: '+12%', icon: <TrendingUp size={24} />, color: 'bg-blue-600' },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">Loading statistics...</div>;

    return (
        <div className="p-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${card.color} p-3 rounded-xl text-white shadow-lg shadow-blue-900/20`}>
                                {card.icon}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{card.title}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0">
                                <div className="w-2 h-2 rounded-full bg-teal-500 mt-2"></div>
                                <div>
                                    <p className="text-sm text-gray-800 dark:text-slate-200 font-medium">New faculty registration approved</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-500">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setActiveModal('reports')}
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/40 transition-all group"
                        >
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                <FileText size={24} />
                            </div>
                            <span className="text-sm font-bold">Generate Reports</span>
                        </button>
                        <button
                            onClick={() => {
                                setActiveModal('permissions');
                                fetchAllUsers();
                            }}
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:hover:bg-teal-900/40 transition-all group"
                        >
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                <ShieldCheck size={24} />
                            </div>
                            <span className="text-sm font-bold">Manage Users</span>
                        </button>
                    </div>
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {activeModal === 'reports' && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        <FileText className="text-indigo-500" />
                                        System Reports
                                    </h3>
                                    <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Report Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['attendance', 'performance', 'finance', 'system'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setReportType(type)}
                                                    className={`p-3 rounded-xl border-2 text-sm font-bold capitalize transition-all ${reportType === type
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                                        : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Date Range</label>
                                        <select
                                            value={reportRange}
                                            onChange={(e) => setReportRange(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-200"
                                        >
                                            <option value="today">Today</option>
                                            <option value="week">Past Week</option>
                                            <option value="month">Past Month</option>
                                            <option value="year">Full Academic Year</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={generatePDFReport}
                                        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                    >
                                        <Download size={20} />
                                        Generate & Download PDF
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {activeModal === 'permissions' && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col"
                            >
                                <div className="p-8 pb-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 mb-2">
                                        <ShieldCheck className="text-teal-500" size={32} />
                                        User Management
                                    </h3>
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-6">Security & Access Control</p>

                                    <button
                                        onClick={() => {
                                            setActiveModal(null);
                                            setUserSearch('');
                                        }}
                                        className="absolute top-6 right-6 p-4 bg-slate-100 hover:bg-rose-500 dark:bg-slate-800 dark:hover:bg-rose-500 text-slate-500 hover:text-white rounded-2xl transition-all z-30"
                                        title="Close Modal"
                                    >
                                        <X size={24} />
                                    </button>

                                    <div className="relative">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, or department..."
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-teal-500 transition-all outline-none font-bold text-slate-800 dark:text-white shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {userLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                                            <Loader2 className="animate-spin" size={40} />
                                            <span className="font-bold">Syncing user database...</span>
                                        </div>
                                    ) : filteredUsers.map(user => (
                                        <div key={user._id} className="group p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-900 transition-all shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner ${user.role === 'faculty' ? 'bg-purple-500' : 'bg-blue-500'
                                                    }`}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-slate-800 dark:text-white leading-tight">{user.name}</h4>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${user.role === 'faculty' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                {user.isBlocked && (
                                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-black uppercase animate-pulse">
                                                        <Ban size={14} />
                                                        Blocked
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleToggleBlock(user._id)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${user.isBlocked
                                                        ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/40'
                                                        : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white'
                                                        }`}
                                                >
                                                    {user.isBlocked ? 'Unblock User' : 'Block User'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {!userLoading && filteredUsers.length === 0 && (
                                        <div className="text-center py-10">
                                            <p className="text-slate-400 font-bold">No users matching your search.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DashboardOverview;
