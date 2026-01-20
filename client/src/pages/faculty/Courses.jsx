import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    BookOpen,
    Users,
    Calendar,
    Clock,
    Search,
    ChevronRight,
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    FileText,
    Activity,
    Users2,
    Sparkles,
    Zap,
    Trophy,
    ArrowRight,
    X,
    MessageSquare,
    Save,
    LayoutDashboard,
    Globe,
    CheckCircle2
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

const FacultyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/faculty/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching courses:", error);
            setLoading(false);
        }
    };

    const handleViewCourse = async (course) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [studentsRes, statsRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/faculty/courses/${course._id}/students`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`http://localhost:5000/api/faculty/courses/${course._id}/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setSelectedCourse(course);
            setStudents(studentsRes.data);
            setStats(statsRes.data);
            setViewMode('detail');
            setLoading(false);
        } catch (error) {
            console.error("Error fetching course details:", error);
            setLoading(false);
        }
    };

    const handleEditClick = (e, course) => {
        e.stopPropagation();
        setEditForm(course);
        setIsEditOpen(true);
    };

    const handleUpdateCourse = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/courses/${editForm._id}`, {
                schedule: editForm.schedule,
                room: editForm.room,
                description: editForm.description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCourses(courses.map(c => c._id === editForm._id ? res.data : c));
            if (selectedCourse && selectedCourse._id === editForm._id) {
                setSelectedCourse(res.data);
            }
            setIsEditOpen(false);
            setEditForm(null);
        } catch (error) {
            console.error("Error updating course:", error);
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

                {viewMode === 'list' ? (
                    <>
                        {/* Courses Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-400/10 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 w-fit"
                                >
                                    <Sparkles size={14} className="text-indigo-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Academic Portfolio</span>
                                </motion.div>
                                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
                                    Curriculum <br />
                                    <span className="text-indigo-600 dark:text-indigo-400">Overview</span>
                                </h1>
                            </div>
                        </div>

                        {/* Courses Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map((course, idx) => (
                                <GlassCard
                                    key={course._id}
                                    className="group cursor-pointer p-1"
                                    delay={idx * 0.1}
                                >
                                    <div
                                        onClick={() => handleViewCourse(course)}
                                        className="p-8 rounded-[2rem] bg-white dark:bg-slate-910 flex flex-col h-full relative overflow-hidden"
                                    >
                                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={(e) => handleEditClick(e, course)}
                                                className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-500 hover:text-white rounded-2xl transition-all shadow-sm"
                                            >
                                                <FileText size={18} />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-start mb-10">
                                            <div className="p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 border border-indigo-100 dark:border-indigo-800 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                <BookOpen size={32} />
                                            </div>
                                            <span className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                                                {course.credits} Credits
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-none tracking-tight group-hover:text-indigo-600 transition-colors uppercase truncate">
                                            {course.name}
                                        </h3>
                                        <p className="text-indigo-500/60 dark:text-indigo-400/60 font-black tracking-[0.2em] text-[10px] uppercase mb-10">
                                            {course.code}
                                        </p>

                                        <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                            <div className="flex -space-x-3 overflow-hidden">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="inline-block h-8 w-8 rounded-xl ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400">ID</div>
                                                ))}
                                                <div className="inline-block h-8 w-8 rounded-xl ring-2 ring-white dark:ring-slate-900 bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-[8px] font-black text-indigo-600">+45</div>
                                            </div>
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-all">
                                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* Course Detail Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex items-start gap-6">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-all shadow-sm"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap size={16} className="text-indigo-500" />
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{selectedCourse.code} UNIT</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{selectedCourse.name}</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Academic Management & Performance Intelligence</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleEditClick(e, selectedCourse)}
                                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Edit size={16} /> Modify Parameters
                            </button>
                        </div>

                        {/* High-Level Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <GlassCard className="p-8 flex items-center gap-6">
                                <div className="p-4 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
                                    <Users2 size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{stats.totalStudents}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Cohort Members</p>
                                </div>
                            </GlassCard>
                            <GlassCard className="p-8 flex items-center gap-6">
                                <div className="p-4 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{stats.avgAttendance}%</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Engagement</p>
                                </div>
                            </GlassCard>
                            <GlassCard className="p-8 lg:col-span-2 flex items-start gap-6 bg-indigo-600 text-white border-none shadow-2xl shadow-indigo-600/20">
                                <div className="p-4 rounded-[1.5rem] bg-white/20">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1.5">Abstract / Description</p>
                                    <p className="text-xs font-bold leading-relaxed opacity-90">{selectedCourse.description || "Synthesizing comprehensive course objectives and modular learning outcomes for this academic cycle."}</p>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Student Roster Table */}
                        <GlassCard className="p-0 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Student Identity Directory</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorized Cohort Access</p>
                                </div>
                                <div className="relative group w-full md:w-80">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        placeholder="Scan roster by ID or name..."
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800">
                                            <th className="px-10 py-6">Biometric Identity</th>
                                            <th className="px-10 py-6">Engagement Vectors</th>
                                            <th className="px-10 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {students.map((student, idx) => (
                                            <motion.tr
                                                key={student._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.02 }}
                                                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                                            >
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-[1.2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-indigo-500 border border-slate-200 dark:border-slate-700">
                                                            {student.user.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight leading-none mb-1.5">{student.user.name}</p>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{student.admissionNumber}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                            <Mail size={12} className="text-indigo-500" /> {student.user.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                            <Phone size={12} className="text-emerald-500" /> +1 (800) LOG-CORE
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all">
                                                            <MessageSquare size={16} />
                                                        </button>
                                                        <button className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                                                            Inspect Profile
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* Edit Modal */}
                <AnimatePresence>
                    {isEditOpen && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                                onClick={() => setIsEditOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-slate-200/50 dark:border-slate-800/50"
                            >
                                <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Parameter Shift</h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">Modify curriculum biometrics</p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditOpen(false)}
                                        className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors text-slate-400"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="p-10 space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Temporal Schedule</label>
                                        <input
                                            value={editForm?.schedule || ''}
                                            onChange={(e) => setEditForm({ ...editForm, schedule: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white shadow-inner"
                                            placeholder="e.g. Mon, Wed 10:00 - 12:00"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Physical Locus (Room)</label>
                                        <input
                                            value={editForm?.room || ''}
                                            onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white shadow-inner"
                                            placeholder="e.g. Tech Annex 402"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Unit Abstract</label>
                                        <textarea
                                            rows="4"
                                            value={editForm?.description || ''}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white shadow-inner resize-none"
                                            placeholder="Briefly synthesize the course objectives..."
                                        />
                                    </div>

                                    <button
                                        onClick={handleUpdateCourse}
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} /> Synchronize Changes
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </Layout>
    );
};

export default FacultyCourses;
