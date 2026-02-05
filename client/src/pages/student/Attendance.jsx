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
        <div className="w-full bg-[#F1F3F7] dark:bg-[#2D3548] rounded-full h-2.5 mt-2">
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
        <div className="bg-[#E5E7EB] dark:bg-[#242B3D] rounded-2xl p-6 shadow-sm border border-[#E2E5E9] dark:border-[#3D4556] hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-[#0F1419] dark:text-[#E8EAED]">{subject.name}</h3>
                    <p className="text-sm text-[#64748B] dark:text-[#868D9D]">{subject.faculty}</p>
                </div>
                <div className={`text-xl font-bold ${percentage < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {percentage}%
                </div>
            </div>

            <div className="flex justify-between text-sm text-gray-600 dark:text-slate-300 mb-2">
                <span className="flex items-center"><CheckCircle size={14} className="mr-1 text-emerald-500" /> {subject.attended} Attended</span>
                <span className="text-[#64748B] dark:text-[#868D9D]">/</span>
                <span className="flex items-center">{subject.total} Total</span>
            </div>

            <ProgressBar value={subject.attended} total={subject.total} />

            {percentage < 75 && (
                <div className="mt-4 flex items-center p-3 bg-rose-50 dark:bg-red-900/20 rounded-lg text-rose-700 dark:text-red-300 text-xs font-medium border border-rose-500/20">
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
            headStyles: { fillColor: [0, 102, 204] },
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
                        <p className="mt-4 text-[#64748B] dark:text-[#868D9D]">Loading attendance data...</p>
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
                        <h2 className="text-3xl font-extrabold text-[#0F1419] dark:text-[#E8EAED] tracking-tight">Attendance</h2>
                        <p className="text-[#64748B] dark:text-[#868D9D] mt-1">Track your daily progress and maintain eligibility.</p>
                    </div>
                    <div className="bg-[#E5E7EB] dark:bg-[#242B3D] rounded-2xl shadow-sm border border-red-200 dark:border-red-800 p-12">
                        <div className="text-center">
                            <AlertTriangle className="mx-auto h-16 w-16 text-red-500 dark:text-red-400 mb-4" />
                            <h3 className="text-xl font-bold text-[#0F1419] dark:text-[#E8EAED] mb-2">Error Loading Attendance</h3>
                            <p className="text-[#64748B] dark:text-[#868D9D] max-w-md mx-auto mb-6">
                                {error}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-[#2563EB] dark:bg-[#60A5FA] hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
                        <h2 className="text-3xl font-extrabold text-[#0F1419] dark:text-[#E8EAED] tracking-tight">Attendance</h2>
                        <p className="text-[#64748B] dark:text-[#868D9D] mt-1">Track your daily progress and maintain eligibility.</p>
                    </div>
                    <div className="bg-[#E5E7EB] dark:bg-[#242B3D] rounded-2xl shadow-sm border border-[#E2E5E9] dark:border-[#3D4556] p-12">
                        <div className="text-center">
                            <Calendar className="mx-auto h-16 w-16 text-[#64748B] dark:text-[#868D9D] dark:text-slate-600 mb-4" />
                            <h3 className="text-xl font-bold text-[#0F1419] dark:text-[#E8EAED] mb-2">No Attendance Records Found</h3>
                            <p className="text-[#64748B] dark:text-[#868D9D] max-w-md mx-auto">
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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F1419] dark:text-[#E8EAED] tracking-tight">Attendance</h2>
                        <p className="text-xs md:text-sm text-[#64748B] dark:text-[#868D9D] mt-1">Track your daily progress and maintain eligibility.</p>
                    </div>
                    <div className="flex gap-1 bg-[#E5E7EB] dark:bg-[#242B3D] p-1.5 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth">
                        {['overview', 'scan', 'reports', 'heatmap'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                                    : 'text-[#64748B] dark:text-[#868D9D] hover:text-slate-700 dark:hover:text-slate-200'
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
                            <div className="lg:col-span-2 bg-[#E5E7EB] dark:bg-[#242B3D] p-4 md:p-6 rounded-3xl shadow-sm border border-[#E2E5E9] dark:border-[#3D4556]">
                                <h3 className="font-bold text-sm md:text-base text-[#0F1419] dark:text-[#E8EAED] mb-4 md:mb-6">Attendance Overview</h3>
                                <div className="h-48 md:h-64">
                                    <Bar options={chartOptions} data={chartData} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                                <div className="bg-gradient-to-br from-[#2563EB] dark:from-[#60A5FA] to-blue-700 rounded-3xl p-6 text-white shadow-lg">
                                    <h4 className="opacity-80 font-bold text-xs uppercase tracking-widest">Average Attendance</h4>
                                    <div className="text-3xl md:text-4xl font-black mt-2">{stats.averageAttendance}%</div>
                                    <div className="mt-4 text-[10px] font-black bg-white/20 inline-block px-3 py-1 rounded-full uppercase tracking-tighter">
                                        <TrendingUp className="inline w-3 h-3 mr-1" /> +2.5% vs last month
                                    </div>
                                </div>
                                <div className="bg-[#E5E7EB] dark:bg-[#242B3D] rounded-3xl p-6 shadow-sm border border-[#E2E5E9] dark:border-[#3D4556]">
                                    <h4 className="font-black text-[10px] text-[#0F1419] dark:text-[#E8EAED] uppercase tracking-widest mb-4">Safe Zone Status</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center text-xs">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-3"></div>
                                            <span className="flex-1 text-gray-600 dark:text-slate-300 font-bold">Safe (&gt;75%)</span>
                                            <span className="font-black text-[#0F1419] dark:text-[#E8EAED]">{stats.safeZone.safe} Subjects</span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-3"></div>
                                            <span className="flex-1 text-gray-600 dark:text-slate-300 font-bold">Warning (65-75%)</span>
                                            <span className="font-black text-[#0F1419] dark:text-[#E8EAED]">{stats.safeZone.warning} Subject</span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-3"></div>
                                            <span className="flex-1 text-gray-600 dark:text-slate-300 font-bold">Critical (&lt;65%)</span>
                                            <span className="font-black text-[#0F1419] dark:text-[#E8EAED]">{stats.safeZone.critical} Subject</span>
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
                    <div className="bg-[#E5E7EB] dark:bg-[#242B3D] rounded-3xl shadow-sm border border-[#E2E5E9] dark:border-[#3D4556] p-5 md:p-8" id="attendance-report">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-8 gap-6">
                            <div className="text-center md:text-left">
                                <h3 className="text-xl md:text-2xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tight">Detailed Report</h3>
                                <p className="text-[10px] md:text-xs font-bold text-[#64748B] dark:text-[#868D9D] uppercase tracking-widest mt-1">Export your attendance history</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 relative">
                                <button
                                    onClick={() => setShowFilter(!showFilter)}
                                    className={`flex items-center px-4 py-2.5 border rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all ${showFilter ? 'bg-blue-50 border-blue-200 text-[#2563EB] dark:text-[#60A5FA] dark:bg-blue-900/30' : 'bg-[#F3F4F6] dark:bg-[#1A1F2E] border-[#E2E5E9] dark:border-[#3D4556] text-[#64748B] dark:text-[#868D9D] hover:bg-white dark:hover:bg-slate-800 shadow-sm'}`}
                                >
                                    <Filter size={14} className="mr-2" /> {(startDate || endDate) ? 'Filtered' : 'Filter'}
                                </button>

                                <AnimatePresence>
                                    {showFilter && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full right-0 mt-3 bg-[#E5E7EB] dark:bg-[#1A1F2E] border border-[#E2E5E9] dark:border-[#3D4556] rounded-[2rem] shadow-2xl p-6 z-50 w-[calc(100vw-4rem)] md:w-80"
                                        >
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        className="w-full bg-[#F1F3F7] dark:bg-[#2D3548] border border-[#E2E5E9] dark:border-[#3D4556] rounded-xl p-3 text-xs font-bold outline-none dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">End Date</label>
                                                    <input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="w-full bg-[#F1F3F7] dark:bg-[#2D3548] border border-[#E2E5E9] dark:border-[#3D4556] rounded-xl p-3 text-xs font-bold outline-none dark:text-white"
                                                    />
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                                        className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#64748B] dark:text-[#868D9D] hover:text-rose-500 transition-colors"
                                                    >
                                                        Reset
                                                    </button>
                                                    <button
                                                        onClick={() => setShowFilter(false)}
                                                        className="flex-[2] bg-indigo-600 text-white rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button onClick={exportPDF} className="flex items-center px-4 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all">
                                    <Download size={14} className="mr-2" /> Export PDF
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto no-scrollbar scroll-smooth">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-[#F9FAFB] dark:bg-slate-800/50 border-b border-[#E2E5E9] dark:border-[#3D4556] text-[10px] font-black uppercase tracking-[0.2em]">
                                        <th className="py-5 px-6 font-bold text-[#4A5568] dark:text-slate-300">Session Date</th>
                                        <th className="py-5 px-6 font-bold text-[#4A5568] dark:text-slate-300">Time Segment</th>
                                        <th className="py-5 px-6 font-bold text-[#4A5568] dark:text-slate-300">Course Identifier</th>
                                        <th className="py-5 px-6 font-bold text-[#4A5568] dark:text-slate-300 text-center">Outcome</th>
                                        <th className="py-5 px-6 font-bold text-[#4A5568] dark:text-slate-300 text-right">Verification</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-transparent divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredHistory.map((record, idx) => (
                                        <tr key={record.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} dark:bg-transparent hover:bg-blue-50/50 hover:bg-[#F1F3F7] dark:bg-[#2D3548] transition-colors border-b border-slate-50 dark:border-slate-800/50`}>
                                            <td className="py-5 px-6 text-xs md:text-sm font-bold text-slate-900 dark:text-slate-200 tracking-tighter">{record.date}</td>
                                            <td className="py-5 px-6 text-[10px] md:text-xs font-black text-[#64748B] dark:text-[#868D9D] uppercase tracking-widest">{record.time}</td>
                                            <td className="py-5 px-6 text-xs md:text-sm font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tight">{record.subject}</td>
                                            <td className="py-5 px-6 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block min-w-[80px] ${record.status === 'Present'
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <span className="inline-flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest gap-2">
                                                    {record.mode === 'QR Scan' && <QrCode size={14} className="text-indigo-500" />}
                                                    {record.mode === 'Geo-Fence' && <MapPin size={14} className="text-emerald-500" />}
                                                    {record.mode === 'Manual' && <Clock size={14} className="text-amber-500" />}
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
                    <div className="bg-[#E5E7EB] dark:bg-[#242B3D] rounded-[2.5rem] shadow-sm border border-[#E2E5E9] dark:border-[#3D4556] p-5 md:p-10">
                        <div className="mb-8 text-center md:text-left">
                            <h3 className="text-xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter uppercase">Attendance Map</h3>
                            <p className="text-[10px] md:text-xs font-bold text-[#64748B] dark:text-[#868D9D] uppercase tracking-widest mt-1">Select a quadrant to view session data</p>
                        </div>

                        <div className="grid grid-cols-7 gap-2 md:gap-4 max-w-2xl mx-auto mb-10 overflow-x-auto no-scrollbar py-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-widest py-2">{day}</div>
                            ))}
                            {heatmapData.map((day, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(day)}
                                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:outline-none ${selectedDate?.date === day.date ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 z-10 scale-110' : ''
                                        } ${day.status === 'present' ? 'bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none' :
                                            day.status === 'absent' ? 'bg-rose-500 text-white shadow-rose-200 dark:shadow-none' :
                                                day.status === 'partial' ? 'bg-amber-400 text-white shadow-amber-200 dark:shadow-none' :
                                                    'bg-[#F1F3F7] dark:bg-[#2D3548] text-[#64748B] dark:text-[#868D9D]'
                                        } shadow-sm`}
                                >
                                    {new Date(day.date).getDate()}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-center space-x-6 pb-8 border-b border-[#E2E5E9] dark:border-[#3D4556]">
                            <div className="flex items-center"><div className="w-3 h-3 bg-emerald-500 rounded mr-2"></div><span className="text-sm text-gray-600 dark:text-slate-300">Present</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-rose-500 rounded mr-2"></div><span className="text-sm text-gray-600 dark:text-slate-300">Absent</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-amber-400 rounded mr-2"></div><span className="text-sm text-gray-600 dark:text-slate-300">Partial</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-[#F1F3F7] dark:bg-[#2D3548] rounded mr-2"></div><span className="text-sm text-gray-600 dark:text-slate-300">Holiday</span></div>
                        </div>

                        {/* Selected Day Details */}
                        <div className="mt-8 transition-all duration-300">
                            {selectedDate ? (
                                <div className="animate-fade-in-up md:p-4 rounded-xl">
                                    <h4 className="text-lg font-bold text-[#0F1419] dark:text-[#E8EAED] mb-4 flex items-center">
                                        <Calendar size={20} className="mr-2 text-[#2563EB] dark:text-[#60A5FA]" />
                                        Details for {new Date(selectedDate.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </h4>

                                    {selectedDate.status === 'holiday' ? (
                                        <div className="p-4 bg-white dark:bg-slate-700/50 rounded-lg text-center text-[#64748B] dark:text-[#868D9D] italic">
                                            No classes scheduled (Holiday / Weekend)
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedDate.classes.map((cls, i) => (
                                                <div key={i} className={`p-4 rounded-xl border flex justify-between items-center ${cls.status === 'Present'
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/20'
                                                    : 'bg-rose-50 dark:bg-rose-900/20 border-rose-500/20'
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
                                <div className="text-center text-[#64748B] dark:text-[#868D9D] py-8">
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
