import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    Search,
    Users,
    ChevronRight,
    Mail,
    Phone,
    Activity,
    CheckCircle,
    XCircle,
    TrendingUp,
    Filter,
    Plus,
    Trash2,
    AlertCircle,
    UserPlus,
    X,
    ArrowRight,
    Sparkles,
    UserCircle,
    GraduationCap,
    MapPin,
    MailCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

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

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCourse, setFilterCourse] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [enrollSearch, setEnrollSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [facultyCourses, setFacultyCourses] = useState([]);
    const [enrollCourseId, setEnrollCourseId] = useState('');
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        fetchStudents();
        fetchFacultyCourses();
    }, []);

    const fetchFacultyCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/faculty/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFacultyCourses(res.data);
            if (res.data.length > 0) setEnrollCourseId(res.data[0]._id);
        } catch (error) {
            console.error("Error fetching faculty courses:", error);
        }
    };

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/faculty/all-students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching students:", error);
            setLoading(false);
        }
    };

    const fetchStudentDetail = async (studentId) => {
        setDetailLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/faculty/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedStudent(res.data);
            setDetailLoading(false);
        } catch (error) {
            console.error("Error fetching detail:", error);
            setDetailLoading(false);
        }
    };

    const handleSearchStudents = async (val) => {
        setEnrollSearch(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/faculty/search-students?query=${val}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(res.data);
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    const handleEnroll = async (studentId) => {
        if (!enrollCourseId) return alert("Select a course first");
        setEnrolling(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/faculty/enroll-student', {
                studentId,
                courseId: enrollCourseId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Student enrolled successfully!");
            setIsEnrollModalOpen(false);
            setEnrollSearch('');
            setSearchResults([]);
            fetchStudents();
        } catch (error) {
            alert(error.response?.data?.message || "Enrollment failed");
        } finally {
            setEnrolling(false);
        }
    };

    const handleUnenroll = async (studentId, courseCode) => {
        const course = facultyCourses.find(c => c.code === courseCode);
        if (!course) return;

        if (!window.confirm(`Are you sure you want to unenroll this student from ${course.name}?`)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/faculty/unenroll-student', {
                studentId,
                courseId: course._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Student unenrolled successfully!");
            setSelectedStudent(null);
            fetchStudents();
        } catch (error) {
            alert("Unenrollment failed");
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCourse = filterCourse === 'all' || s.enrolledCourses.some(c => c.name === filterCourse);
        return matchesSearch && matchesCourse;
    });

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

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-400/10 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 w-fit"
                        >
                            <Sparkles size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Student Directory</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
                            Manage <br />
                            <span className="text-indigo-600 dark:text-indigo-400">Cohorts</span>
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => setIsEnrollModalOpen(true)}
                            className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <UserPlus size={16} /> Enroll New Student
                        </button>
                    </div>
                </div>

                {/* Main Directory Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Filter & List Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    placeholder="Search by name, ID or department..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all shadow-inner"
                                />
                            </div>
                            <div className="relative group">
                                <select
                                    value={filterCourse}
                                    onChange={(e) => setFilterCourse(e.target.value)}
                                    className="h-full pl-6 pr-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white appearance-none cursor-pointer min-w-[180px]"
                                >
                                    <option value="all">Global Roster</option>
                                    {facultyCourses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <Filter size={14} />
                                </div>
                            </div>
                        </div>

                        <GlassCard className="p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800">
                                            <th className="px-10 py-6">Student Identity</th>
                                            <th className="px-10 py-6 text-center">Engagement</th>
                                            <th className="px-10 py-6 text-center">Academy</th>
                                            <th className="px-10 py-6 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {filteredStudents.map((std, idx) => (
                                            <motion.tr
                                                key={std._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.02 }}
                                                className={cn(
                                                    "group transition-colors cursor-pointer",
                                                    selectedStudent?.profile._id === std._id
                                                        ? "bg-indigo-500/[0.05] dark:bg-indigo-500/[0.1] border-l-4 border-l-indigo-500"
                                                        : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                                )}
                                                onClick={() => fetchStudentDetail(std._id)}
                                            >
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-indigo-500 border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                                            {std.user.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{std.user.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{std.admissionNumber}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span className={cn(
                                                            "text-[10px] font-black px-3 py-1 rounded-full border",
                                                            Number(std.summary.attendancePercentage) < 75
                                                                ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                        )}>
                                                            {std.summary.attendancePercentage}%
                                                        </span>
                                                        <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn("h-full", Number(std.summary.attendancePercentage) < 75 ? "bg-rose-500" : "bg-emerald-500")}
                                                                style={{ width: `${std.summary.attendancePercentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-center">
                                                    <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                                                        {std.summary.coursesEnrolled} UNITS
                                                    </p>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <div className="flex justify-end">
                                                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-500/10 transition-all">
                                                            <ChevronRight size={18} />
                                                        </div>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Detailed Profile Column */}
                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            {detailLoading ? (
                                <GlassCard className="p-16 flex flex-col items-center justify-center h-[600px]">
                                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest anim-pulse">Analyzing Records...</p>
                                </GlassCard>
                            ) : selectedStudent ? (
                                <motion.div
                                    key={selectedStudent.profile._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6 sticky top-24"
                                >
                                    <GlassCard className="p-10 text-center">
                                        <div className="mx-auto w-24 h-24 rounded-[2rem] bg-indigo-500 text-white flex items-center justify-center text-2xl font-black shadow-2xl shadow-indigo-500/30 mb-6">
                                            {selectedStudent.profile.user.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 leading-none">{selectedStudent.profile.user.name}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedStudent.profile.admissionNumber}</p>

                                        <div className="grid grid-cols-2 gap-3 mt-8">
                                            <div className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p>
                                                <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{selectedStudent.profile.department}</p>
                                            </div>
                                            <div className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Semester</p>
                                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">{selectedStudent.profile.semester}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <button className="flex-1 px-4 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                                                <MailCheck size={14} /> Send Alert
                                            </button>
                                            <button className="p-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                                                <Phone size={14} />
                                            </button>
                                        </div>
                                    </GlassCard>

                                    <GlassCard title="Academic Units" icon={GraduationCap} className="p-8">
                                        <div className="space-y-6 mt-2">
                                            {selectedStudent.courseDetails.map((course, idx) => (
                                                <div key={idx} className="group/unit">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{course.courseCode}</p>
                                                            <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{course.courseName}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleUnenroll(selectedStudent.profile._id, course.courseCode)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover/unit:opacity-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${course.attendance.total > 0 ? (course.attendance.present / course.attendance.total) * 100 : 0}%` }}
                                                                className="h-full bg-indigo-500"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-500">
                                                            {course.attendance.total > 0 ? Math.round((course.attendance.present / course.attendance.total) * 100) : 0}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full mt-8 py-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                            View Academic Transcript
                                        </button>
                                    </GlassCard>
                                </motion.div>
                            ) : (
                                <GlassCard className="p-16 flex flex-col items-center justify-center text-center h-[600px] border-dashed">
                                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-200 dark:text-slate-700 mb-8">
                                        <Users size={32} />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-tight">Selective Focus</h4>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-600 mt-2 leading-relaxed">Choose a student identity to inspect <br />their scholarly trajectory and biometrics.</p>
                                </GlassCard>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Enrollment Modal */}
            <AnimatePresence>
                {isEnrollModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                            onClick={() => setIsEnrollModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-slate-200/50 dark:border-slate-800/50"
                        >
                            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Cohort Expansion</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">Enroll new biological identities</p>
                                </div>
                                <button
                                    onClick={() => setIsEnrollModalOpen(false)}
                                    className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors text-slate-400"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Knowledge Unit</label>
                                        <select
                                            value={enrollCourseId}
                                            onChange={(e) => setEnrollCourseId(e.target.value)}
                                            className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl text-sm font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all appearance-none cursor-pointer"
                                        >
                                            {facultyCourses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Identity Query</label>
                                        <div className="relative">
                                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Name or biometric ID..."
                                                value={enrollSearch}
                                                onChange={(e) => handleSearchStudents(e.target.value)}
                                                className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl text-sm font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                    {searchResults.length > 0 ? (
                                        searchResults.map((res, i) => (
                                            <motion.div
                                                key={res._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-[2rem] group hover:border-indigo-500 transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black">
                                                        {res.user.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 dark:text-white text-sm">{res.user.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{res.admissionNumber}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleEnroll(res._id)}
                                                    disabled={enrolling}
                                                    className="w-12 h-12 bg-white dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-indigo-600 hover:text-white rounded-2xl shadow-sm transition-all flex items-center justify-center"
                                                >
                                                    {enrolling ? <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" /> : <Plus size={20} />}
                                                </button>
                                            </motion.div>
                                        ))
                                    ) : enrollSearch.length >= 2 ? (
                                        <div className="text-center py-12">
                                            <AlertCircle size={40} className="mx-auto text-slate-200 mb-4" />
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Query returned void results</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <Users size={48} className="mx-auto text-slate-100 dark:text-slate-800 mb-4" />
                                            <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">Input parameters to begin scan</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default ManageStudents;
