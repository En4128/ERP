import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BookOpen, UserCheck, TrendingUp } from 'lucide-react';

const DashboardOverview = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        totalCourses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchStats();
    }, []);

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
                        <button className="p-4 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/40 transition-colors text-sm font-semibold">
                            Generate Reports
                        </button>
                        <button className="p-4 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:hover:bg-teal-900/40 transition-colors text-sm font-semibold">
                            Manage Permissions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
