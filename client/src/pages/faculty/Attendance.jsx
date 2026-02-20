import { useState, useEffect, useRef } from 'react';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

// --- Premium UI Components ---

const GlassCard = ({ children, className, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={cn(
            "bg-[#F3F4F6] dark:bg-[#1A1F2E] backdrop-blur-xl border border-[#E2E5E9]/50 dark:border-[#3D4556]/50 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500",
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
    const [markedViaData, setMarkedViaData] = useState({});
    const dirtyStudentsRef = useRef(new Set());

    // For UI triggering
    const [dirtyTrigger, setDirtyTrigger] = useState(0);
    const setDirty = (id) => {
        dirtyStudentsRef.current.add(id);
        setDirtyTrigger(prev => prev + 1);
    };
    const clearDirty = () => {
        dirtyStudentsRef.current.clear();
        setDirtyTrigger(0);
    };



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
            const viaMap = {};

            stdRes.data.forEach(s => {
                currentMap[s._id] = 'Absent';
                viaMap[s._id] = 'Manual';
            });

            attRes.data.forEach(rec => {
                const sId = typeof rec.student === 'object' ? rec.student._id : rec.student;
                currentMap[sId] = rec.status;
                viaMap[sId] = rec.markedVia === 'QR' ? 'QR Scan' : (rec.markedVia || 'Manual');
                // Store actual time if available
                if (rec.time) {
                    currentMap[`${sId}_time`] = rec.time;
                }
            });

            setAttendanceData(prev => {
                const merged = { ...prev };
                Object.keys(currentMap).forEach(sId => {
                    if (!dirtyStudentsRef.current.has(sId) || viaMap[sId] === 'QR') {
                        merged[sId] = currentMap[sId];
                    }
                });
                return merged;
            });


            setMarkedViaData(viaMap);


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
        const newData = { ...attendanceData };
        students.forEach(s => {
            if (markedViaData[s._id] !== 'QR') {
                newData[s._id] = status;
                dirtyStudentsRef.current.add(s._id);
            }
        });
        setAttendanceData(newData);
        setDirtyTrigger(prev => prev + 1);
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

            toast.success('Attendance saved successfully!');
            clearDirty();
            fetchCourseSpecificData();


        } catch (error) {
            console.error("Error saving attendance:", error);
            toast.error('Failed to save attendance.');
        } finally {
            setSaving(false);
        }
    };


    const exportPDF = () => {
        if (!history || history.length === 0) {
            toast.info("No archive records to export.");
            return;
        }

        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text("Attendance Archive Records", 14, 22);

        // Course Details
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Course: ${currentCourse?.code || ''} - ${currentCourse?.name || 'Unknown Course'}`, 14, 32);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);

        // Table Data
        const tableColumn = ["Session Date", "Present", "Absent", "Total", "Compliance"];
        const tableRows = [];

        history.forEach(record => {
            const dateStr = new Date(record.date).toLocaleDateString();
            const compliance = record.total > 0 ? Math.round((record.present / record.total) * 100) : 0;
            const rowData = [
                dateStr,
                record.present,
                record.absent,
                record.total,
                `${compliance}%`
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo color
            alternateRowStyles: { fillColor: [249, 250, 251] }
        });

        doc.save(`archive_records_${currentCourse?.code || 'course'}.pdf`);
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
                        <h2 className="text-4xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter mb-4">Start Your Journey</h2>
                        <p className="text-[#64748B] dark:text-[#868D9D] max-w-md mx-auto mb-10 font-bold leading-relaxed">
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
                            <div className="space-y-3 md:space-y-4 text-center md:text-left">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-400/10 px-3 py-1.5 md:px-4 md:py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 w-fit mx-auto md:mx-0"
                                >
                                    <Sparkles size={12} md:size={14} className="text-indigo-500" />
                                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Attendance Portal</span>
                                </motion.div>
                                <h1 className="text-4xl md:text-6xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter leading-[0.9]">
                                    Session <br />
                                    <span className="text-indigo-400">Management</span>
                                </h1>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-2 md:mt-0">
                                <div className="relative group">
                                    <p className="absolute -top-6 left-2 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Course</p>
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        className="w-full sm:w-72 pl-6 pr-12 py-3.5 md:py-4 bg-[#E5E7EB] dark:bg-[#1A1F2E] border border-[#E2E5E9] dark:border-[#3D4556] rounded-2xl text-[10px] md:text-xs font-black shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white appearance-none transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-800 uppercase tracking-wider"
                                    >
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>{course.code} • {course.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <Filter size={14} />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <p className="absolute -top-6 left-2 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full sm:w-48 pl-6 pr-6 py-3.5 md:py-4 bg-[#E5E7EB] dark:bg-[#1A1F2E] border border-[#E2E5E9] dark:border-[#3D4556] rounded-2xl text-[10px] md:text-xs font-black shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all uppercase tracking-wider"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Info Bar */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { label: 'Enrolled', value: students.length, icon: Users, color: 'indigo' },
                                { label: 'Present', value: presentCount, icon: CheckCircle2, color: 'emerald' },
                                { label: 'Absent', value: absentCount, icon: X, color: 'rose' },
                                { label: 'Rate', value: `${students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0}%`, icon: TrendingUp, color: 'amber' },
                            ].map((stat, idx) => (
                                <GlassCard key={idx} className="p-5 md:p-8" delay={idx * 0.1}>
                                    <div className="flex justify-between items-start mb-3 md:mb-5">
                                        <div className={cn("p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-opacity-10", {
                                            "bg-indigo-500 text-indigo-500": stat.color === 'indigo',
                                            "bg-emerald-500 text-emerald-500": stat.color === 'emerald',
                                            "bg-rose-500 text-rose-500": stat.color === 'rose',
                                            "bg-amber-500 text-amber-500": stat.color === 'amber',
                                        })}>
                                            <stat.icon size={14} md:size={24} />
                                        </div>
                                    </div>
                                    <p className="text-2xl md:text-4xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter leading-none">{stat.value}</p>
                                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-3">{stat.label}</p>
                                </GlassCard>
                            ))}
                        </div>

                        {/* Tabs & Content */}
                        <div className="space-y-6">
                            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                                {[
                                    { id: 'mark', label: 'Manual Control', icon: Check },
                                    { id: 'qr', label: 'QR Relay', icon: QrCode },
                                    { id: 'history', label: 'Archives', icon: Clock },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "px-8 py-3.5 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap flex items-center gap-2.5 border",
                                            activeTab === tab.id
                                                ? "bg-indigo-600 text-white border-transparent shadow-xl shadow-indigo-500/20"
                                                : "bg-[#F3F4F6] dark:bg-[#1A1F2E] text-slate-400 dark:text-[#64748B] dark:text-[#868D9D] border-[#E2E5E9] dark:border-[#3D4556] hover:border-indigo-400 hover:text-indigo-500"
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
                                            <div className="p-6 md:p-10 border-b border-[#E2E5E9] dark:border-[#3D4556] flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="relative flex-1 group">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                                    <input
                                                        placeholder="Quick search student ID..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full pl-12 pr-6 py-4 bg-[#F1F3F7] dark:bg-[#2D3548] border border-[#E2E5E9] dark:border-[#3D4556] rounded-2xl text-[10px] md:text-sm font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all shadow-inner uppercase tracking-wider"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <button
                                                        onClick={() => markAll('Present')}
                                                        className="flex-1 md:flex-none px-4 md:px-8 py-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle2 size={12} md:size={16} /> Present <span className="hidden sm:inline">All</span>
                                                    </button>
                                                    <button
                                                        onClick={() => markAll('Absent')}
                                                        className="flex-1 md:flex-none px-4 md:px-8 py-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <X size={12} md:size={16} /> Absent <span className="hidden sm:inline">All</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto no-scrollbar scroll-smooth">
                                                <table className="w-full text-left min-w-[700px]">
                                                    <thead>
                                                        <tr className="bg-[#F3F4F6]/50 dark:bg-[#1A1F2E]/50 text-[10px] font-black text-slate-400 dark:text-[#64748B] dark:text-[#868D9D] uppercase tracking-[0.3em] border-b border-[#E2E5E9] dark:border-[#3D4556]">
                                                            <th className="px-8 py-6">Vanguard Identity</th>
                                                            <th className="px-8 py-6">Registry ID</th>
                                                            <th className="px-8 py-6 text-center">Current Status</th>
                                                            <th className="px-8 py-6 text-right">Toggle Control</th>
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
                                                                    attendanceData[std._id] === 'Absent' ? "bg-rose-500/[0.02] dark:bg-rose-500/[0.05]" : "hover:bg-[#F1F3F7] dark:hover:bg-[#2D3548]"
                                                                )}
                                                            >
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center overflow-hidden border border-indigo-200/50 dark:border-indigo-800/50 flex-shrink-0">
                                                                            <img
                                                                                src={`https://ui-avatars.com/api/?name=${std.user.name}&background=6366f1&color=fff&bold=true`}
                                                                                alt={std.user.name}
                                                                                className="w-full h-full"
                                                                            />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="font-black text-[#0F1419] dark:text-[#E8EAED] text-xs md:text-sm truncate">{std.user.name}</p>
                                                                            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{std.user.email}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5 font-black text-[#64748B] dark:text-[#868D9D] text-[10px] md:text-xs tracking-widest">{std.admissionNumber}</td>
                                                                <td className="px-8 py-5 text-center">
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <span className={cn(
                                                                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border min-w-[80px]",
                                                                            attendanceData[std._id] === 'Present'
                                                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                                                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                                                        )}>
                                                                            {attendanceData[std._id]}
                                                                        </span>
                                                                        {markedViaData[std._id] === 'QR Scan' && (
                                                                            <span className="flex flex-col items-center gap-1">
                                                                                <span className="flex items-center gap-1 text-[8px] font-black text-indigo-500 uppercase tracking-tighter">
                                                                                    <QrCode size={10} /> QR Sync
                                                                                </span>
                                                                                <span className="text-[7px] font-bold text-slate-400">{attendanceData[`${std._id}_time`]}</span>
                                                                            </span>
                                                                        )}
                                                                        {markedViaData[std._id] === 'Manual' && attendanceData[std._id] === 'Present' && (
                                                                            <span className="flex flex-col items-center gap-1">
                                                                                <span className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-tighter">
                                                                                    <Clock size={10} /> Manual
                                                                                </span>
                                                                                <span className="text-[7px] font-bold text-slate-400">{attendanceData[`${std._id}_time`]}</span>
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>

                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center justify-end gap-2.5">
                                                                        <button
                                                                            onClick={() => {
                                                                                setAttendanceData(p => ({ ...p, [std._id]: 'Present' }));
                                                                                setDirty(std._id);
                                                                            }}
                                                                            disabled={markedViaData[std._id] === 'QR'}
                                                                            className={cn(
                                                                                "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border",
                                                                                attendanceData[std._id] === 'Present'
                                                                                    ? "bg-emerald-500 text-white border-transparent shadow-lg shadow-emerald-500/20 scale-105"
                                                                                    : "bg-[#F3F4F6] dark:bg-[#1A1F2E] text-slate-400 dark:text-slate-600 border-[#E2E5E9] dark:border-[#3D4556] hover:border-emerald-500/50 hover:text-emerald-500",
                                                                                markedViaData[std._id] === 'QR' && "opacity-50 cursor-not-allowed"
                                                                            )}
                                                                        >
                                                                            <Check size={18} md:size={20} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setAttendanceData(p => ({ ...p, [std._id]: 'Absent' }));
                                                                                setDirty(std._id);
                                                                            }}
                                                                            disabled={markedViaData[std._id] === 'QR'}
                                                                            className={cn(
                                                                                "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border",
                                                                                attendanceData[std._id] === 'Absent'
                                                                                    ? "bg-rose-500 text-white border-transparent shadow-lg shadow-rose-500/20 scale-105"
                                                                                    : "bg-[#F3F4F6] dark:bg-[#1A1F2E] text-slate-400 dark:text-slate-600 border-[#E2E5E9] dark:border-[#3D4556] hover:border-rose-500/50 hover:text-rose-500",
                                                                                markedViaData[std._id] === 'QR' && "opacity-50 cursor-not-allowed"
                                                                            )}
                                                                        >
                                                                            <X size={18} md:size={20} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        ))}
                                                    </tbody>
                                                </table>`   `
                                            </div>

                                            <div className="p-8 md:p-10 border-t border-[#E2E5E9] dark:border-[#3D4556] flex justify-center md:justify-end">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={saving}
                                                    className="w-full md:w-auto px-10 py-5 rounded-2xl md:rounded-[2.5rem] bg-indigo-600 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                                                >
                                                    {saving ? 'Processing...' : <><Save size={18} /> Give Attendance</>}
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
                                            <div className="p-8 md:p-10 border-b border-[#E2E5E9] dark:border-[#3D4556] flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <h3 className="text-xl font-black text-[#0F1419] dark:text-[#E8EAED] uppercase tracking-tighter flex items-center gap-3">
                                                    <BarChart3 size={24} className="text-indigo-600" /> Archive Records
                                                </h3>
                                                <button onClick={exportPDF} className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#F1F3F7] dark:bg-[#2D3548] text-[10px] font-black uppercase tracking-widest text-[#64748B] dark:text-[#868D9D] hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm border border-[#E2E5E9] dark:border-[#3D4556]">
                                                    <Download size={14} /> Export PDF
                                                </button>
                                            </div>
                                            <div className="overflow-x-auto no-scrollbar scroll-smooth">
                                                <table className="w-full text-left min-w-[700px]">
                                                    <thead>
                                                        <tr className="bg-[#F3F4F6]/50 dark:bg-[#1A1F2E]/50 text-[10px] font-black text-slate-400 dark:text-[#64748B] dark:text-[#868D9D] uppercase tracking-[0.3em] border-b border-[#E2E5E9] dark:border-[#3D4556]">
                                                            <th className="px-8 py-6">Session Identity</th>
                                                            <th className="px-8 py-6">Engagement Data</th>
                                                            <th className="px-8 py-6 text-center">Compliance Index</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                        {history.length > 0 ? history.map((record) => (
                                                            <tr key={record.date} className="hover:bg-[#F1F3F7] dark:hover:bg-[#2D3548] transition-colors">
                                                                <td className="px-8 py-6 font-black text-[#0F1419] dark:text-[#E8EAED] text-xs md:text-sm tracking-tight">
                                                                    {new Date(record.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] md:text-xs">
                                                                            <Check size={12} md:size={14} /> {record.present}
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 text-rose-600 font-black text-[10px] md:text-xs">
                                                                            <X size={12} md:size={14} /> {record.absent}
                                                                        </div>
                                                                        <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-[#F1F3F7] dark:bg-[#2D3548] px-2 py-1 rounded">
                                                                            Total {record.total}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6 text-center">
                                                                    <div className={cn(
                                                                        "inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
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
                                                                <td colSpan="3" className="px-10 py-20 text-center text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">No historical data found.</td>
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
