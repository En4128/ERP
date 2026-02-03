import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import {
    Calendar,
    BarChart2,
    Download,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Filter,
    Clock,
    MapPin,
    QrCode,
    TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import QRScanner from '../../components/QRScanner';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// --- Components ---

const ProgressBar = ({ value, total }) => {
    const percentage = Math.round((value / total) * 100);
    let colorClass = 'bg-emerald-500';
    if (percentage < 65) colorClass = 'bg-rose-500';
    else if (percentage < 75) colorClass = 'bg-amber-500';

    return (
        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 mt-2">
            <div
                className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

const AttendanceCard = ({ subject }) => {
    const percentage = Math.round((subject.attended / subject.total) * 100);
    const classesNeeded = Math.max(0, Math.ceil((0.75 * subject.total - subject.attended) / 0.25));

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{subject.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{subject.faculty}</p>
                </div>
                <div className={`text-xl font-bold ${percentage < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {percentage}%
                </div>
            </div>

            <div className="flex justify-between text-sm text-gray-600 dark:text-slate-300 mb-2">
                <span className="flex items-center"><CheckCircle size={14} className="mr-1 text-emerald-500" /> {subject.attended} Attended</span>
                <span className="text-gray-400">/</span>
                <span className="flex items-center">{subject.total} Total</span>
            </div>

            <ProgressBar value={subject.attended} total={subject.total} />

            {percentage < 75 && (
                <div className="mt-4 flex items-center p-3 bg-rose-50 dark:bg-red-900/20 rounded-lg text-rose-700 dark:text-red-300 text-xs font-medium border border-rose-100 dark:border-rose-800/50">
                    <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                    You need to attend {classesNeeded} more classes to reach 75%.
                </div>
            )}
        </div>
    );
};

export default function AttendancePage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ averageAttendance: 0, safeZone: { safe: 0, warning: 0, critical: 0 } });
    const [heatmapData, setHeatmapData] = useState([]);

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found. Please login again.');
                    setLoading(false);
                    return;
                }
                const config = { headers: { Authorization: `Bearer ${token}` } };
                console.log('Fetching attendance data...');
                const res = await axios.get('http://localhost:5000/api/student/attendance', config);
                console.log('API Response:', res.data);
                console.log('Subjects:', res.data.subjects);
                console.log('Stats:', res.data.stats);
                setSubjects(res.data.subjects || []);
                setHistory(res.data.history || []);
                setStats(res.data.stats || { averageAttendance: 0, safeZone: { safe: 0, warning: 0, critical: 0 } });
                setHeatmapData(res.data.heatmap || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching attendance:", error);
                console.error("Error response:", error.response?.data);
                let errorMessage = 'Failed to load attendance data. ';
                if (error.response) {
                    // Server responded with error
                    errorMessage += error.response.data?.message || `Server error: ${error.response.status}`;
                } else if (error.request) {
                    // Request made but no response
                    errorMessage += 'Cannot connect to server. Please check if the server is running.';
                } else {
                    // Something else happened
                    errorMessage += error.message;
                }
                setError(errorMessage);
                setLoading(false);
            }
        };
        fetchAttendanceData();
    }, []);

    const filteredHistory = history.filter((record) => {
        if (!startDate && !endDate) return true;
        try {
            // Assuming record.date is "YYYY-MM-DD" or similar parseable format
            const recordDate = new Date(record.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start) {
                start.setHours(0, 0, 0, 0);
                if (recordDate < start) return false;
            }
            if (end) {
                end.setHours(23, 59, 59, 999);
                if (recordDate > end) return false;
            }
            return true;
        } catch (e) {
            return true;
        }
    });

    const exportPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text("Attendance Report", 14, 22);

        // Filter Info
        doc.setFontSize(10);
        doc.setTextColor(100);
        const dateRange = startDate && endDate
            ? `From: ${startDate} To: ${endDate}`
            : startDate ? `From: ${startDate}`
                : endDate ? `To: ${endDate}`
                    : "All Records";
        doc.text(`Date Range: ${dateRange}`, 14, 32);

        // Table Data
        const tableColumn = ["Date", "Time", "Subject", "Status", "Mode"];
        const tableRows = [];

        filteredHistory.forEach(record => {
            const rowData = [
                record.date,
                record.time,
                record.subject,
                record.status,
                record.mode
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
            alternateRowStyles: { fillColor: [249, 250, 251] }
        });

        // Footer
        const date = new Date().toLocaleDateString();
        doc.setFontSize(8);
        doc.text(`Generated on: ${date}`, 14, doc.internal.pageSize.height - 10);

        doc.save('attendance_report.pdf');
    };

    // Chart Options
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
        }
    };

    const chartData = {
        labels: subjects.map(s => s.name.split(' ').map(w => w[0]).join('')),
        datasets: [{
            data: subjects.map(s => s.total > 0 ? Math.round((s.attended / s.total) * 100) : 0),
            backgroundColor: subjects.map(s => {
                const p = s.total > 0 ? (s.attended / s.total) * 100 : 0;
                return p < 65 ? 'rgba(239, 68, 68, 0.7)' : p < 75 ? 'rgba(234, 179, 8, 0.7)' : 'rgba(16, 185, 129, 0.7)';
            }),
            borderRadius: 8,
        }],
    };

    // Loading State
    if (loading) {
        return (
            <Layout role="student">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
                        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading attendance data...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Error State
    if (error) {
        return (
            <Layout role="student">
                <div className="animate-fade-in-up space-y-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Attendance</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Track your daily progress and maintain eligibility.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-red-200 dark:border-red-800 p-12">
                        <div className="text-center">
                            <AlertTriangle className="mx-auto h-16 w-16 text-red-500 dark:text-red-400 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Attendance</h3>
                            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                                {error}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Empty State
    if (!subjects || subjects.length === 0) {
        return (
            <Layout role="student">
                <div className="animate-fade-in-up space-y-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Attendance</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Track your daily progress and maintain eligibility.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-12">
                        <div className="text-center">
                            <Calendar className="mx-auto h-16 w-16 text-gray-400 dark:text-slate-600 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Attendance Records Found</h3>
                            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                                There are no attendance records available yet. Your attendance will appear here once your faculty starts marking attendance for your courses.
                            </p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="student">
            <div className="animate-fade-in-up space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Attendance</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Track your daily progress and maintain eligibility.</p>
                    </div>
                    <div className="flex space-x-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                        {['overview', 'scan', 'reports', 'heatmap'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    } capitalize`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- OVERVIEW TAB --- */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-6">Attendance Overview</h3>
                                <div className="h-64">
                                    <Bar options={chartOptions} data={chartData} />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                                    <h4 className="opacity-80 font-medium">Average Attendance</h4>
                                    <div className="text-4xl font-bold mt-2">{stats.averageAttendance}%</div>
                                    <div className="mt-4 text-sm bg-white/20 inline-block px-3 py-1 rounded-full">
                                        <TrendingUp className="inline w-4 h-4 mr-1" /> +2.5% vs last month
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">Safe Zone Status</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center text-sm">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 mr-3"></div>
                                            <span className="flex-1 text-gray-600 dark:text-slate-300">Safe (&gt;75%)</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{stats.safeZone.safe} Subjects</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <div className="w-3 h-3 rounded-full bg-amber-500 mr-3"></div>
                                            <span className="flex-1 text-gray-600 dark:text-slate-300">Warning (65-75%)</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{stats.safeZone.warning} Subject</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <div className="w-3 h-3 rounded-full bg-rose-500 mr-3"></div>
                                            <span className="flex-1 text-gray-600 dark:text-slate-300">Critical (&lt;65%)</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{stats.safeZone.critical} Subject</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subject Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {subjects.map(subject => (
                                <AttendanceCard key={subject.id} subject={subject} />
                            ))}
                        </div>
                    </div>
                )}

                {/* --- SCAN QR TAB --- */}
                {activeTab === 'scan' && (
                    <div className="space-y-6">
                        <QRScanner />
                    </div>
                )}

                {/* --- REPORTS TAB --- */}
                {activeTab === 'reports' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6" id="attendance-report">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Detailed Attendance Report</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">View history and export data.</p>
                            </div>
                            <div className="flex items-center space-x-3 relative">
                                <button
                                    onClick={() => setShowFilter(!showFilter)}
                                    className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilter ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700'}`}
                                >
                                    <Filter size={16} className="mr-2" /> {(startDate || endDate) ? 'Filtered' : 'Filter Date'}
                                </button>

                                <AnimatePresence>
                                    {showFilter && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 z-50 w-72"
                                        >
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">End Date</label>
                                                    <input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                                        className="flex-1 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors"
                                                    >
                                                        Clear
                                                    </button>
                                                    <button
                                                        onClick={() => setShowFilter(false)}
                                                        className="flex-1 bg-indigo-600 text-white rounded-lg px-3 py-2 text-xs font-bold hover:bg-indigo-700 transition-colors"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button onClick={exportPDF} className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 shadow-md shadow-amber-200 dark:shadow-none transition-colors">
                                    <Download size={16} className="mr-2" /> Export PDF
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-700">
                                        <th className="py-4 px-4 font-semibold text-gray-600 dark:text-slate-300">Date</th>
                                        <th className="py-4 px-4 font-semibold text-gray-600 dark:text-slate-300">Time</th>
                                        <th className="py-4 px-4 font-semibold text-gray-600 dark:text-slate-300">Subject</th>
                                        <th className="py-4 px-4 font-semibold text-gray-600 dark:text-slate-300">Status</th>
                                        <th className="py-4 px-4 font-semibold text-gray-600 dark:text-slate-300">Mode</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                                    {filteredHistory.map((record) => (
                                        <tr key={record.id} className="hover:bg-white dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="py-4 px-4 text-sm text-slate-900 dark:text-slate-200">{record.date}</td>
                                            <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">{record.time}</td>
                                            <td className="py-4 px-4 text-sm font-medium text-slate-900 dark:text-white">{record.subject}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${record.status === 'Present'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-rose-100 text-rose-700 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">
                                                <span className="flex items-center">
                                                    {record.mode === 'QR Scan' && <QrCode size={14} className="mr-1" />}
                                                    {record.mode === 'Geo-Fence' && <MapPin size={14} className="mr-1" />}
                                                    {record.mode === 'Manual' && <Clock size={14} className="mr-1" />}
                                                    {record.mode}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- HEATMAP TAB --- */}
                {activeTab === 'heatmap' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Attendance Heatmap</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Click on a day to view detailed class attendance.</p>
                        </div>

                        <div className="grid grid-cols-7 gap-3 max-w-2xl mx-auto mb-8">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">{day}</div>
                            ))}
                            {heatmapData.map((day, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(day)}
                                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:outline-none ${selectedDate?.date === day.date ? 'ring-2 ring-teal-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 z-10 scale-110' : ''
                                        } ${day.status === 'present' ? 'bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none' :
                                            day.status === 'absent' ? 'bg-rose-500 text-white shadow-rose-200 dark:shadow-none' :
                                                day.status === 'partial' ? 'bg-amber-400 text-white shadow-amber-200 dark:shadow-none' :
                                                    'bg-gray-100 dark:bg-slate-700 text-gray-400'
                                        } shadow-sm`}
                                >
                                    {new Date(day.date).getDate()}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-center space-x-6 pb-8 border-b border-gray-100 dark:border-slate-700">
                            <div className="flex items-center"><div className="w-3 h-3 bg-emerald-500 rounded mr-2"></div><span className="text-sm text-gray-600 dark:text-slate-300">Present</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-rose-500 rounded mr-2"></div><span className="text-sm text-gray-600 dark:text-slate-300">Absent</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-amber-400 rounded mr-2"></div><span className="text-sm text-gray-600 dark:text-slate-300">Partial</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-gray-100 dark:bg-slate-700 rounded mr-2"></div><span className="text-sm text-gray-600 dark:text-slate-300">Holiday</span></div>
                        </div>

                        {/* Selected Day Details */}
                        <div className="mt-8 transition-all duration-300">
                            {selectedDate ? (
                                <div className="animate-fade-in-up md:p-4 rounded-xl">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                        <Calendar size={20} className="mr-2 text-blue-700" />
                                        Details for {new Date(selectedDate.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </h4>

                                    {selectedDate.status === 'holiday' ? (
                                        <div className="p-4 bg-white dark:bg-slate-700/50 rounded-lg text-center text-slate-600 dark:text-slate-400 italic">
                                            No classes scheduled (Holiday / Weekend)
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedDate.classes.map((cls, i) => (
                                                <div key={i} className={`p-4 rounded-xl border flex justify-between items-center ${cls.status === 'Present'
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800'
                                                    : 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800'
                                                    }`}>
                                                    <div>
                                                        <p className={`font-bold ${cls.status === 'Present' ? 'text-emerald-900 dark:text-emerald-100' : 'text-rose-900 dark:text-rose-100'}`}>
                                                            {cls.name}
                                                        </p>
                                                        <p className="text-xs opacity-75 dark:text-gray-300 flex items-center mt-1">
                                                            <Clock size={12} className="mr-1" /> {cls.time}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls.status === 'Present'
                                                        ? 'bg-white/50 text-emerald-700 dark:text-emerald-300'
                                                        : 'bg-white/50 text-rose-700 dark:text-rose-300'
                                                        }`}>
                                                        {cls.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-8">
                                    Select a date from the calendar to view class details.
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
};
