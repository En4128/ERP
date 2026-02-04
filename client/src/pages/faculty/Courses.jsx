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
    Plus,
    FilePlus,
    Trash2,
    Download,
    X,
    Save,
    Edit,
    MessageSquare,
    User,
    ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import StudentProfileModal from '../../components/StudentProfileModal';

// --- Premium UI Components ---

const GlassCard = ({ children, className, delay = 0, noHover = false }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        whileHover={noHover ? {} : { y: -20, scale: 1.05, rotateX: -2, rotateY: 2 }}
        transition={{
            duration: 0.8,
            delay,
            type: "spring",
            stiffness: 120,
            damping: 12
        }}
        className={cn(
            "relative group",
            className
        )}
    >
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/20 to-teal-500/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

        <div className="relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] h-full">
            {children}
        </div>
    </motion.div>
);

const DetailTab = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden",
            active
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                : "bg-white/50 dark:bg-slate-800/50 text-slate-400 hover:text-indigo-500 border border-slate-100 dark:border-slate-800"
        )}
    >
        <Icon size={18} strokeWidth={2.5} />
        {label}
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-indigo-600 -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
    </button>
);

const FacultyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
    const [detailTab, setDetailTab] = useState('roster'); // 'roster' | 'materials'
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
    const [searchAllQuery, setSearchAllQuery] = useState('');
    const [searchAllResults, setSearchAllResults] = useState([]);
    const [joining, setJoining] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [materialFile, setMaterialFile] = useState(null);
    const [materialTitle, setMaterialTitle] = useState('');
    const [viewingStudent, setViewingStudent] = useState(null);
    const [studentProfileLoading, setStudentProfileLoading] = useState(false);

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

    const handleSearchAll = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/faculty/search-courses?query=${searchAllQuery}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchAllResults(res.data);
        } catch (error) {
            console.error("Error searching courses:", error);
        }
    };

    const handleJoinCourse = async (courseId) => {
        setJoining(courseId);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/faculty/join-course', { courseId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Successfully joined course!');
            setIsDiscoverOpen(false);
            fetchCourses();
        } catch (error) {
            console.error("Error joining course:", error);
            alert(error.response?.data?.message || 'Failed to join course');
        } finally {
            setJoining(false);
        }
    };

    const handleUploadMaterial = async (e) => {
        e.preventDefault();
        if (!materialFile) return alert('Please select a file');

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', materialFile);
            formData.append('title', materialTitle);

            const res = await axios.post(`http://localhost:5000/api/faculty/courses/${selectedCourse._id}/materials`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            const updatedMaterials = [...(selectedCourse.materials || []), res.data];
            setSelectedCourse({ ...selectedCourse, materials: updatedMaterials });
            setCourses(courses.map(c => c._id === selectedCourse._id ? { ...c, materials: updatedMaterials } : c));

            setMaterialFile(null);
            setMaterialTitle('');
            alert('Material uploaded successfully!');
        } catch (error) {
            console.error("Error uploading material:", error);
            alert('Failed to upload material');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/faculty/courses/${selectedCourse._id}/materials/${materialId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const updatedMaterials = selectedCourse.materials.filter(m => m._id !== materialId);
            setSelectedCourse({ ...selectedCourse, materials: updatedMaterials });
            setCourses(courses.map(c => c._id === selectedCourse._id ? { ...c, materials: updatedMaterials } : c));
        } catch (error) {
            console.error("Error deleting material:", error);
            alert('Failed to delete material');
        }
    };

    const handleViewProfile = async (studentId) => {
        setViewingStudent({});
        setStudentProfileLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/faculty/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setViewingStudent(res.data.profile);
        } catch (error) {
            console.error("Error fetching student profile:", error);
            setViewingStudent(null);
        } finally {
            setStudentProfileLoading(false);
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
            <div className="max-w-[1600px] mx-auto p-3 md:p-6 space-y-6 animate-fade-in-up">
                <StudentProfileModal
                    isOpen={!!viewingStudent}
                    onClose={() => setViewingStudent(null)}
                    student={viewingStudent}
                    loading={studentProfileLoading}
                />

                {viewMode === 'list' ? (
                    <>
                        {/* Premium Mesh Header */}
                        <div className="relative rounded-[3rem] overflow-hidden p-8 md:p-12 mb-10 shadow-2xl shadow-indigo-500/10 min-h-[300px] flex items-center">
                            {/* Animated Background Layers */}
                            <div className="absolute inset-0 bg-slate-950">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 90, 0],
                                        opacity: [0.15, 0.25, 0.15]
                                    }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-600 rounded-full blur-[140px]"
                                />
                                <motion.div
                                    animate={{
                                        scale: [1.2, 1, 1.2],
                                        rotate: [0, -90, 0],
                                        opacity: [0.1, 0.2, 0.1]
                                    }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-rose-600 rounded-full blur-[140px]"
                                />
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

                                {/* Floating Particles */}
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            y: [0, -100, 0],
                                            x: [0, Math.random() * 50 - 25, 0],
                                            opacity: [0, 0.3, 0]
                                        }}
                                        transition={{
                                            duration: 10 + Math.random() * 10,
                                            repeat: Infinity,
                                            delay: i * 2
                                        }}
                                        className="absolute w-2 h-2 bg-indigo-400 rounded-full blur-sm"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                                <div className="space-y-6 text-center md:text-left">
                                    <motion.div
                                        initial={{ x: -30, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-5 py-2 rounded-full border border-white/10 w-fit mx-auto md:mx-0 shadow-xl"
                                    >
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-200">Academic Courses</span>
                                    </motion.div>
                                    <div className="space-y-2">
                                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.8] italic">
                                            Academic <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">Notes </span>
                                        </h1>
                                    </div>

                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsDiscoverOpen(true)}
                                    className="group relative px-8 py-5 bg-white text-slate-900 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-white/10 overflow-hidden flex items-center gap-4"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <Plus size={20} strokeWidth={4} className="relative z-10 group-hover:text-white transition-colors" />
                                    <span className="relative z-10 group-hover:text-white transition-colors">Integrate Units</span>
                                </motion.button>
                            </div>
                        </div>

                        {/* Global Insights Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <motion.div
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="bg-[#0f172a] border border-white/5 rounded-[2rem] p-6 flex items-center gap-6 shadow-2xl group"
                            >
                                <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                                    <BookOpen size={24} strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Total Units</p>
                                    <p className="text-3xl font-black text-white tracking-tighter italic">{courses.length}</p>
                                </div>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="bg-[#0f172a] border border-white/5 rounded-[2rem] p-6 flex items-center gap-6 shadow-2xl group"
                            >
                                <div className="p-4 rounded-2xl bg-teal-500/10 text-teal-500 group-hover:scale-110 transition-transform">
                                    <Users size={24} strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Avg Engagement</p>
                                    <p className="text-3xl font-black text-white tracking-tighter italic">84.2%</p>
                                </div>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="bg-[#0f172a] border border-white/5 rounded-[2rem] p-6 flex items-center gap-6 shadow-2xl group"
                            >
                                <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
                                    <Activity size={24} strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Marking Status</p>
                                    <p className="text-3xl font-black text-white tracking-tighter italic">92.1%</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Courses Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map((course, idx) => (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: idx * 0.1,
                                        type: "spring",
                                        stiffness: 120,
                                        damping: 12
                                    }}
                                    onClick={() => handleViewCourse(course)}
                                    className="relative group cursor-pointer"
                                >
                                    {/* Glow Effect */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500" />

                                    {/* Card Container */}
                                    <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl h-[420px]">
                                        {/* Background Decoration */}
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full -ml-16 -mb-16 blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />

                                        {/* Content */}
                                        <div className="relative p-8 flex flex-col h-full">
                                            {/* Header Section */}
                                            <div className="flex justify-between items-start mb-8">
                                                {/* Icon with Badge */}
                                                <div className="relative">
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40 group-hover:scale-110 group-hover:shadow-indigo-600/60 transition-all duration-500">
                                                        <BookOpen size={28} strokeWidth={2} />
                                                    </div>
                                                    {!course.isMarkedToday && (
                                                        <motion.div
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ repeat: Infinity, duration: 2 }}
                                                            className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full border-4 border-slate-900"
                                                        />
                                                    )}
                                                </div>

                                                {/* Status Badge & Edit Button */}
                                                <div className="flex flex-col items-end gap-3">
                                                    <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border ${course.isMarkedToday
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                        }`}>
                                                        {course.isMarkedToday ? "MARKED" : "PENDING"}
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleEditClick(e, course)}
                                                        className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all backdrop-blur-md border border-white/5 hover:border-white/20"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Course Info */}
                                            <div className="space-y-3 mb-6">
                                                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 tracking-tight leading-tight uppercase group-hover:scale-[1.02] origin-left transition-transform duration-500">
                                                    {course.name}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-white/40 font-black tracking-wider text-[10px] uppercase">
                                                        {course.code}
                                                    </p>
                                                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                                </div>
                                            </div>

                                            {/* Engagement Metric */}
                                            <div className="mt-auto bg-slate-800/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5 group-hover:border-indigo-500/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-full border-[3px] border-indigo-500/20 border-t-indigo-500 flex items-center justify-center bg-slate-900/50 group-hover:rotate-180 transition-transform duration-1000">
                                                        <span className="text-[10px] font-black text-indigo-400">AS</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-wider mb-0.5">Active Engagement</p>
                                                        <p className="text-[10px] font-bold text-white/70">Premium Cohort Metric</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="mt-5 pt-5 border-t border-white/5 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-3">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className="w-9 h-9 rounded-full ring-2 ring-slate-900 bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-[9px] font-black text-white/30">
                                                                {i}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-wider">
                                                        {course.credits} Credits
                                                    </p>
                                                </div>
                                                <motion.div
                                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                                    className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-600/50 transition-all"
                                                >
                                                    <ArrowDownRight size={20} strokeWidth={3} />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
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
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                            <div className="flex items-start gap-8">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className="p-5 rounded-2xl bg-slate-900/50 dark:bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all shadow-xl backdrop-blur-3xl group"
                                >
                                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <GraduationCap size={16} className="text-indigo-400" />
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] font-mono">{selectedCourse.code} UNIT</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic">{selectedCourse.name}</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic opacity-60">Academic Management & Performance Intelligence</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleEditClick(e, selectedCourse)}
                                className="px-8 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)] active:scale-95 transition-all flex items-center gap-3 hover:bg-slate-50"
                            >
                                <Edit size={16} strokeWidth={2.5} /> Modify Parameters
                            </button>
                        </div>

                        {/* Intelligence Layer (Stats) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="relative group overflow-hidden bg-indigo-600 rounded-[2rem] p-6 text-white shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-3 bg-white/10 rounded-2xl">
                                        <Users size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Global Cohort</span>
                                </div>
                                <p className="text-4xl font-black tracking-tighter mb-1">{stats.totalStudents}</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Verified Identities</p>
                            </div>

                            <div className="relative group overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-xl">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-3 bg-teal-500/10 text-teal-500 rounded-2xl">
                                        <Activity size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Avg Engagement</span>
                                </div>
                                <div className="flex items-end gap-2 mb-1">
                                    <p className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{stats.avgAttendance}</p>
                                    <p className="text-2xl font-black text-teal-500 mb-2">%</p>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.avgAttendance}%` }}
                                        className="h-full bg-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-2 relative group overflow-hidden bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent" />
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                            <FileText size={20} className="text-indigo-400" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Conceptual Framework</p>
                                    </div>
                                    <p className="text-xl font-medium leading-relaxed italic text-white/90 line-clamp-3">
                                        {selectedCourse.description || "Synthesizing comprehensive course objectives through modular recursive intelligence vectors."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detail Tabs */}
                        <div className="flex gap-4 p-2 bg-slate-900/50 dark:bg-white/5 border border-white/10 rounded-[1.5rem] w-fit mx-auto md:mx-0 backdrop-blur-xl mb-12 shadow-2xl">
                            <DetailTab
                                icon={(props) => <User {...props} size={20} strokeWidth={2.5} />}
                                label="Student Directory"
                                active={detailTab === 'roster'}
                                onClick={() => setDetailTab('roster')}
                            />
                            <DetailTab
                                icon={(props) => <FileText {...props} size={20} strokeWidth={2.5} />}
                                label="Course Materials"
                                active={detailTab === 'materials'}
                                onClick={() => setDetailTab('materials')}
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            {detailTab === 'roster' ? (
                                <motion.div
                                    key="roster"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    {/* Student Roster Table */}
                                    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                        <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">Cohort Registry</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 italic">Authorized Performance Analytics</p>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] border-b border-slate-100 dark:border-slate-800/50">
                                                        <th className="px-8 py-5">Biometric Token</th>
                                                        <th className="px-8 py-5">Communication Channels</th>
                                                        <th className="px-8 py-5 text-right">Operational Logic</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                                                    {students.map((student, idx) => (
                                                        <motion.tr
                                                            key={student._id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.03 }}
                                                            className="hover:bg-slate-50/80 dark:hover:bg-indigo-500/5 transition-all group"
                                                        >
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-base font-black border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                                                        {student.user.name.split(' ').map(n => n[0]).join('')}
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <p className="font-black text-slate-900 dark:text-white text-base tracking-tight mb-1.5">{student.user.name}</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{student.admissionNumber}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className="space-y-2.5">
                                                                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                                                        <Mail size={14} className="text-indigo-400" /> {student.user.email}
                                                                    </div>
                                                                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                                                        <Phone size={14} className="text-teal-400" /> VECTORS_SYNCHRONIZED
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                <div className="flex justify-end gap-3">
                                                                    <button
                                                                        onClick={() => handleViewProfile(student._id)}
                                                                        className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                                                                    >
                                                                        Detailed Audit
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="materials"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                                >
                                    <div className="lg:col-span-2 space-y-10">
                                        <div className="relative group">
                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-indigo-500/5 blur-3xl opacity-50" />
                                            <div className="relative bg-slate-800/80 dark:bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-3xl shadow-2xl overflow-hidden min-h-[500px]">
                                                <div className="flex justify-between items-center mb-12">
                                                    <div className="text-left">
                                                        <h3 className="text-3xl font-black text-white tracking-tighter italic">Knowledge Repository</h3>
                                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-2 italic">Modular Learning Artifacts</p>
                                                    </div>
                                                    <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:scale-110 transition-transform cursor-pointer">
                                                        <Zap size={28} strokeWidth={2.5} />
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
                                                        selectedCourse.materials.map((material, idx) => (
                                                            <motion.div
                                                                key={material._id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.1 }}
                                                                className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-between group hover:border-indigo-500/50 transition-all duration-500 hover:bg-white/10"
                                                            >
                                                                <div className="flex items-center gap-6">
                                                                    <div className="p-5 rounded-[1.5rem] bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                                                        <FileText size={28} strokeWidth={2.5} />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <p className="font-black text-white text-xl tracking-tight mb-1">{material.title}</p>
                                                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                                                            <Calendar size={12} /> {new Date(material.uploadedAt).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-4">
                                                                    <a
                                                                        href={`http://localhost:5000${material.fileUrl}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-5 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all border border-white/5 hover:border-white/20"
                                                                    >
                                                                        <Download size={20} strokeWidth={2.5} />
                                                                    </a>
                                                                    <button
                                                                        onClick={() => handleDeleteMaterial(material._id)}
                                                                        className="p-5 rounded-2xl bg-white/5 text-white/40 hover:text-rose-500 transition-all border border-white/5 hover:border-rose-500/20"
                                                                    >
                                                                        <Trash2 size={20} strokeWidth={2.5} />
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <div className="py-32 border-4 border-dashed border-white/5 rounded-[4rem] text-center bg-white/[0.02] flex flex-col items-center justify-center space-y-8 group/empty hover:border-indigo-500/20 transition-all duration-700">
                                                            <div className="relative">
                                                                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-0 group-hover/empty:opacity-20 transition-opacity" />
                                                                <Sparkles size={80} strokeWidth={1} className="text-white/10 group-hover/empty:text-indigo-400 group-hover/empty:scale-110 transition-all duration-1000 animate-pulse" />
                                                            </div>
                                                            <p className="text-xl font-black text-white/10 uppercase tracking-[0.5em] group-hover/empty:text-white/20 transition-colors">Neural Repository Empty</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-indigo-500/5 rounded-[3rem] blur-3xl opacity-50" />
                                            <div className="relative bg-slate-800/60 dark:bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-3xl shadow-2xl">
                                                <h3 className="text-2xl font-black text-white mb-10 tracking-tighter text-left italic">Ingest New Data</h3>
                                                <form onSubmit={handleUploadMaterial} className="space-y-10">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] px-4 block text-left italic">Asset Descriptor</label>
                                                        <input
                                                            type="text"
                                                            value={materialTitle}
                                                            onChange={(e) => setMaterialTitle(e.target.value)}
                                                            placeholder="e.g. Theoretical Framework - Phase 1"
                                                            className="w-full px-10 py-6 bg-white/[0.03] border border-white/10 rounded-[2.5rem] text-sm font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white shadow-inner placeholder:text-white/10"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] px-4 block text-left italic">Temporal Payload</label>
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                onChange={(e) => setMaterialFile(e.target.files[0])}
                                                                className="hidden"
                                                                id="material-upload"
                                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*"
                                                            />
                                                            <label
                                                                htmlFor="material-upload"
                                                                className="w-full px-10 py-16 bg-white/[0.01] border-4 border-dashed border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/40 transition-all group/upload overflow-hidden"
                                                            >
                                                                <div className="relative mb-6">
                                                                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-0 group-hover/upload:opacity-20 transition-opacity" />
                                                                    <FilePlus size={56} strokeWidth={1.5} className="text-white/5 group-hover/upload:text-indigo-400 group-hover/upload:scale-110 transition-all duration-700 relative" />
                                                                </div>
                                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center px-8 line-clamp-2 italic group-hover/upload:text-white/40 transition-colors">
                                                                    {materialFile ? materialFile.name : "SYNCHRONIZE TECHNICAL ASSETS"}
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        disabled={uploading}
                                                        className="w-full py-8 bg-indigo-600 text-white rounded-[3rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_25px_50px_-15px_rgba(79,70,229,0.5)] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 group/btn overflow-hidden relative"
                                                    >
                                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                                                        {uploading ? (
                                                            "TRANSMITTING..."
                                                        ) : (
                                                            <><Zap size={20} strokeWidth={2.5} className="animate-pulse" /> FINALIZE INGESTION</>
                                                        )}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>


                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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

                {/* Discover Courses Modal */}
                <AnimatePresence>
                    {isDiscoverOpen && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                                onClick={() => setIsDiscoverOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-slate-200/50 dark:border-slate-800/50"
                            >
                                <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Discover</h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">Join new course units</p>
                                    </div>
                                    <button
                                        onClick={() => setIsDiscoverOpen(false)}
                                        className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors text-slate-400"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="p-10 space-y-6">
                                    <div className="relative group">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            placeholder="Search by name, code or department..."
                                            value={searchAllQuery}
                                            onChange={(e) => setSearchAllQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchAll()}
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white shadow-inner"
                                        />
                                        <button
                                            onClick={handleSearchAll}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase"
                                        >
                                            Search
                                        </button>
                                    </div>

                                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                        {searchAllResults.map((course) => (
                                            <div key={course._id} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-black text-slate-900 dark:text-white text-sm">{course.name}</h4>
                                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{course.code} • {course.department}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Faculty: {course.assignedFaculty?.user?.name || 'Unassigned'}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleJoinCourse(course._id)}
                                                    disabled={joining === course._id || courses.some(c => c._id === course._id)}
                                                    className={cn(
                                                        "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        courses.some(c => c._id === course._id)
                                                            ? "bg-emerald-500/10 text-emerald-600 cursor-default"
                                                            : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
                                                    )}
                                                >
                                                    {courses.some(c => c._id === course._id) ? 'Joined' : joining === course._id ? 'Joining...' : 'Join Course'}
                                                </button>
                                            </div>
                                        ))}
                                        {searchAllResults.length === 0 && searchAllQuery && (
                                            <p className="text-center py-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No results found</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </Layout >
    );
};

export default FacultyCourses;
