import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    ArrowDownRight,
    Filter,
    LayoutGrid,
    List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import StudentProfileModal from '../../components/StudentProfileModal';
import { toast } from 'sonner';

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

        <div className="relative bg-[#E5E7EB]/70 dark:bg-[#1A1F2E]/70 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] h-full">
            {children}
        </div>
    </motion.div>
);

const DetailTab = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px]",
            active
                ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-lg shadow-indigo-500/10 scale-105"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        )}
    >
        <Icon size={16} strokeWidth={2.5} />
        {label}
    </button>
);

const CountUp = ({ to, duration = 2, decimals = 0, suffix = "", prefix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;

        const updateCount = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            setCount(progress * (parseFloat(to) || 0));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(updateCount);
            }
        };

        animationFrame = requestAnimationFrame(updateCount);
        return () => cancelAnimationFrame(animationFrame);
    }, [to, duration]);

    return (
        <span>
            {prefix}
            {count.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })}
            {suffix}
        </span>
    );
};

const FacultyCourses = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
    const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'
    const [detailTab, setDetailTab] = useState('roster'); // 'roster' | 'materials'
    const [filterQuery, setFilterQuery] = useState('');
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

    const insights = React.useMemo(() => {
        if (!courses || courses.length === 0) return [];
        const totalEnrollment = courses.reduce((acc, c) => acc + (c.students?.length || 42), 0);
        const markedToday = courses.filter(c => c.isMarkedToday).length;
        const compliance = courses.length > 0 ? (markedToday / courses.length) * 100 : 0;

        return [
            { label: 'Active Units', value: courses.length, icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10', sub: 'Assigned Curriculum' },
            { label: 'Enrollment', value: totalEnrollment, icon: Users, color: 'text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-500/10', sub: 'Total Students' },
            { label: 'Marking Compliance', value: compliance, suffix: "%", icon: Activity, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10', sub: 'Daily Attendance' }
        ];
    }, [courses]);

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
            toast.success('Successfully joined course!');
            setIsDiscoverOpen(false);
            fetchCourses();
        } catch (error) {
            console.error("Error joining course:", error);
            toast.error(error.response?.data?.message || 'Failed to join course');
        } finally {
            setJoining(false);
        }
    };

    const handleUploadMaterial = async (e) => {
        e.preventDefault();
        if (!materialFile) return toast.error('Please select a file');

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
            toast.success('Material uploaded successfully!');
        } catch (error) {
            console.error("Error uploading material:", error);
            toast.error('Failed to upload material');
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
            toast.error('Failed to delete material');
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
                        {/* Premium Modern Header */}
                        <div className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-14 mb-10 shadow-2xl bg-slate-950 min-h-[320px] flex items-center">
                            {/* Dynamic Background Elements */}
                            <div className="absolute inset-0">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.3, 0.5, 0.3]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity }}
                                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px]"
                                />
                                <motion.div
                                    animate={{
                                        scale: [1.1, 1, 1.1],
                                        opacity: [0.2, 0.4, 0.2]
                                    }}
                                    transition={{ duration: 12, repeat: Infinity }}
                                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-600/20 rounded-full blur-[120px]"
                                />
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-soft-light" />
                            </div>

                            <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="space-y-6 text-center md:text-left">
                                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 w-fit mx-auto md:mx-0">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">Faculty Dashboard</span>
                                    </div>
                                    <div className="space-y-2">
                                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
                                            Manage your <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-rose-400">Courses</span>
                                        </h1>

                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setIsDiscoverOpen(true)}
                                        className="group relative px-8 py-5 bg-white text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-white/10 transition-all flex items-center gap-3 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-indigo-50 leading-none" />
                                        <Plus size={18} strokeWidth={3} className="relative z-10" />
                                        <span className="relative z-10">Add Unit</span>
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Search & Actions Bar */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                            <div className="relative w-full md:max-w-md group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                    <Search size={20} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Filter courses by name or code..."
                                    value={filterQuery}
                                    onChange={(e) => setFilterQuery(e.target.value)}
                                    className="w-full pl-16 pr-6 py-5 bg-white dark:bg-[#0d1118] border border-slate-200 dark:border-slate-700/60 rounded-[1.5rem] text-sm font-bold focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/60 outline-none transition-all shadow-sm dark:text-slate-200 dark:placeholder-slate-600"
                                />
                            </div>

                            <div className="flex p-1.5 bg-slate-100 dark:bg-[#0d1118] border border-slate-200 dark:border-slate-700/60 rounded-2xl">
                                <button
                                    onClick={() => setLayoutMode('grid')}
                                    className={cn(
                                        "p-3 rounded-xl transition-all",
                                        layoutMode === 'grid'
                                            ? "text-indigo-400 bg-white dark:bg-slate-800 shadow-sm"
                                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    )}
                                >
                                    <LayoutGrid size={20} />
                                </button>
                                <button
                                    onClick={() => setLayoutMode('list')}
                                    className={cn(
                                        "p-3 rounded-xl transition-all",
                                        layoutMode === 'list'
                                            ? "text-indigo-400 bg-white dark:bg-slate-800 shadow-sm"
                                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    )}
                                >
                                    <List size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Intelligence Layer (Insights) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {insights.map((insight, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -5, scale: 1.01 }}
                                    className="bg-white dark:bg-[#0d1118] border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-indigo-500/5 rounded-full -mr-8 -mt-8 blur-2xl opacity-60 group-hover:scale-150 transition-transform duration-700" />
                                    <div className={cn("p-5 rounded-2xl relative z-10", insight.color)}>
                                        <insight.icon size={26} strokeWidth={2.5} />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{insight.label}</p>
                                        <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                            <CountUp to={insight.value} suffix={insight.suffix || ""} />
                                        </h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">{insight.sub}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {layoutMode === 'grid' ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                                >
                                    {/* Animated Background Orbs for Grid Layout */}
                                    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                                        <motion.div
                                            animate={{
                                                x: [0, 100, 0],
                                                y: [0, 50, 0],
                                                scale: [1, 1.2, 1]
                                            }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]"
                                        />
                                        <motion.div
                                            animate={{
                                                x: [0, -100, 0],
                                                y: [0, -50, 0],
                                                scale: [1.1, 1, 1.1]
                                            }}
                                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px]"
                                        />
                                    </div>
                                    {courses
                                        .filter(c => c.name.toLowerCase().includes(filterQuery.toLowerCase()) || c.code.toLowerCase().includes(filterQuery.toLowerCase()))
                                        .map((course, idx) => (
                                            <motion.div
                                                key={course._id}
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.4, delay: idx * 0.06 }}
                                                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                                                onClick={() => handleViewCourse(course)}
                                                className="relative group cursor-pointer"
                                            >
                                                {/* Card */}
                                                <div className="relative bg-white dark:bg-[#0d1118] border border-slate-200/80 dark:border-slate-700/50 rounded-3xl overflow-hidden shadow-lg dark:shadow-black/40 group-hover:shadow-2xl group-hover:border-indigo-500/50 transition-all duration-400 flex flex-col">

                                                    {/* Gradient Header Block */}
                                                    <div className={cn(
                                                        "relative h-36 flex items-center justify-between px-8 overflow-hidden",
                                                        [
                                                            "bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600",
                                                            "bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-600",
                                                            "bg-gradient-to-br from-sky-600 via-cyan-500 to-teal-600",
                                                            "bg-gradient-to-br from-rose-600 via-pink-500 to-orange-500",
                                                            "bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600",
                                                            "bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500",
                                                        ][idx % 6]
                                                    )}>
                                                        {/* Large decorative letter */}
                                                        <span className="absolute right-4 top-0 text-[8rem] font-black text-white/10 leading-none select-none tracking-tighter">
                                                            {course.code?.charAt(0)}
                                                        </span>
                                                        <div>
                                                            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">{course.code}</p>
                                                            <h3 className="text-xl font-black text-white leading-tight tracking-tight max-w-[180px]">{course.name}</h3>
                                                        </div>
                                                        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white border border-white/20 flex-shrink-0">
                                                            <BookOpen size={20} strokeWidth={2.5} />
                                                        </div>
                                                    </div>

                                                    {/* Status Bar */}
                                                    <div className={cn("h-1 w-full", course.isMarkedToday ? "bg-emerald-400" : "bg-rose-400")} />

                                                    {/* Body */}
                                                    <div className="p-6 flex flex-col gap-5">

                                                        {/* Status + Department */}
                                                        <div className="flex items-center justify-between">
                                                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-transparent dark:border-slate-700/40">
                                                                {course.department || 'Academic'}
                                                            </span>
                                                            
                                                        </div>

                                                        {/* Quick Action Buttons */}
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); navigate('/faculty/attendance', { state: { courseId: course._id } }); }}
                                                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/[0.08] hover:bg-indigo-500 text-indigo-600 dark:text-indigo-300 hover:text-white transition-all border border-indigo-100 dark:border-indigo-500/25 group/btn"
                                                            >
                                                                <Users size={14} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Attendance</span>
                                                                <ArrowRight size={12} className="ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); navigate('/faculty/assignments', { state: { courseId: course._id } }); }}
                                                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-50 dark:bg-violet-500/[0.08] hover:bg-violet-500 text-violet-600 dark:text-violet-300 hover:text-white transition-all border border-violet-100 dark:border-violet-500/25 group/btn"
                                                            >
                                                                <FileText size={14} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Assignments</span>
                                                                <ArrowRight size={12} className="ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); navigate('/faculty/marks', { state: { courseId: course._id } }); }}
                                                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.08] hover:bg-emerald-500 text-emerald-600 dark:text-emerald-300 hover:text-white transition-all border border-emerald-100 dark:border-emerald-500/25 group/btn"
                                                            >
                                                                <Trophy size={14} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Marks</span>
                                                                <ArrowRight size={12} className="ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                            </button>
                                                        </div>

                                                        {/* Footer */}
                                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/40">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex -space-x-2">
                                                                    {(course.students?.slice(0, 3) || [1, 2, 3]).map((s, i) => (
                                                                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-[#0d1118] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-200 uppercase">
                                                                            {s.user?.name ? s.user.name[0] : `S${i + 1}`}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{course.students?.length || 0} enrolled</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                                                <Clock size={12} />
                                                                <span className="text-[10px] font-bold">{course.credits} cr</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white dark:bg-[#0d1118] border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] overflow-hidden shadow-2xl dark:shadow-black/50"
                                >
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-[#111827] text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-700/50">
                                                    <th className="px-10 py-6">Unit Designation</th>
                                                    <th className="px-10 py-6">Department</th>
                                                    <th className="px-10 py-6 text-center">Protocol Status</th>
                                                    <th className="px-10 py-6 text-center">Deployment</th>
                                                    <th className="px-10 py-6 text-right">Operations</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                                                {courses
                                                    .filter(c => c.name.toLowerCase().includes(filterQuery.toLowerCase()) || c.code.toLowerCase().includes(filterQuery.toLowerCase()))
                                                    .map((course, idx) => (
                                                        <motion.tr
                                                            key={course._id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.03 }}
                                                            onClick={() => handleViewCourse(course)}
                                                            className="hover:bg-slate-50/80 dark:hover:bg-indigo-500/[0.06] transition-all group cursor-pointer"
                                                        >
                                                            <td className="px-10 py-6">
                                                                <div className="flex items-center gap-5">
                                                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                                        <BookOpen size={20} strokeWidth={2.5} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-black text-slate-900 dark:text-white text-base tracking-tight leading-none mb-1.5">{course.name}</p>
                                                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{course.code}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-10 py-6">
                                                                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                                                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{course.department || 'Academic'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-10 py-6 text-center">
                                                                <div className={cn(
                                                                    "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                                    course.isMarkedToday
                                                                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                                                                        : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20"
                                                                )}>
                                                                    <div className={cn("w-1.5 h-1.5 rounded-full", course.isMarkedToday ? "bg-emerald-500" : "bg-rose-500")} />
                                                                    {course.isMarkedToday ? "Marked" : "Pending"}
                                                                </div>
                                                            </td>
                                                            <td className="px-10 py-6 text-center">
                                                                <div className="flex justify-center -space-x-3">
                                                                    {[1, 2].map(i => (
                                                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">S{i}</div>
                                                                    ))}
                                                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-600 flex items-center justify-center text-[8px] font-bold text-white">+40</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-10 py-6 text-right">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); navigate('/faculty/attendance', { state: { courseId: course._id } }); }}
                                                                        className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                                        title="Attendance"
                                                                    >
                                                                        <Users size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); navigate('/faculty/assignments', { state: { courseId: course._id } }); }}
                                                                        className="p-2.5 rounded-lg bg-violet-50/50 dark:bg-violet-500/10 text-violet-600 border border-violet-100 dark:border-violet-500/20 hover:bg-violet-600 hover:text-white transition-all shadow-sm"
                                                                        title="Assignments"
                                                                    >
                                                                        <FileText size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); navigate('/faculty/marks', { state: { courseId: course._id } }); }}
                                                                        className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                                        title="Marks"
                                                                    >
                                                                        <Trophy size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditClick(e, course);
                                                                        }}
                                                                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all border border-slate-100 dark:border-slate-700 hover:border-slate-300"
                                                                        title="Edit Unit"
                                                                    >
                                                                        <Edit size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* Intelligence Layer (Stats) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Enrollment', value: stats.totalStudents, icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10', sub: 'Verified Cohort' },
                                { label: 'Engagement', value: stats.avgAttendance, suffix: "%", icon: Activity, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10', decimals: 1, sub: 'Active Participation' },
                                { label: 'Academic Load', value: selectedCourse.credits, suffix: " ", icon: BookOpen, color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10', sub: 'Unit Weight' },
                                { label: 'Resources', value: selectedCourse.materials?.length || 0, icon: FileText, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10', sub: 'Stored Assets' }
                            ].map((s, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500", s.color)}>
                                            <s.icon size={26} strokeWidth={2.5} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{s.label}</p>
                                    <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                        <CountUp to={s.value} decimals={s.decimals || 0} suffix={s.suffix || ""} />
                                    </h4>
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.sub}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Detail Tabs Bar */}
                        <div className="flex justify-center md:justify-start w-full md:w-fit py-1.5 px-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.8rem] gap-2 mb-10">
                            <DetailTab
                                icon={User}
                                label="Registry"
                                active={detailTab === 'roster'}
                                onClick={() => setDetailTab('roster')}
                            />
                            <DetailTab
                                icon={FileText}
                                label="Materials"
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
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                        <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Student Registry</h3>
                                                <p className="text-sm font-medium text-slate-400 mt-2">Authorized performance analytics and communication center.</p>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-[#F3F4F6]/50 dark:bg-[#1A1F2E]/50 text-[8px] md:text-[10px] font-black text-slate-400 dark:text-[#64748B] dark:text-[#868D9D] uppercase tracking-[0.2em] md:tracking-[0.4em] border-b border-[#E2E5E9]/50 dark:border-[#3D4556]/50">
                                                        <th className="px-4 md:px-8 py-3 md:py-5">Biometric Token</th>
                                                        <th className="hidden sm:table-cell px-8 py-5">Communication</th>
                                                        <th className="px-4 md:px-8 py-3 md:py-5 text-right">Logic</th>
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
                                                            <td className="px-4 md:px-8 py-3 md:py-5">
                                                                <div className="flex items-center gap-3 md:gap-6">
                                                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-sm md:text-base font-black border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                                                        {student.user.name.split(' ').map(n => n[0]).join('')}
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <p className="font-black text-[#0F1419] dark:text-[#E8EAED] text-sm md:text-base tracking-tight mb-0.5 md:mb-1.5">{student.user.name}</p>
                                                                        <div className="flex items-center gap-1.5 md:gap-2">
                                                                            <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-teal-500" />
                                                                            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] md:tracking-[0.2em]">{student.admissionNumber}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="hidden sm:table-cell px-8 py-5">
                                                                <div className="space-y-1.5 md:space-y-2.5">
                                                                    <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-bold text-[#64748B] dark:text-[#868D9D] uppercase tracking-tighter">
                                                                        <Mail size={12} md:size={14} className="text-indigo-400" /> {student.user.email}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 md:px-8 py-3 md:py-5 text-right">
                                                                <div className="flex justify-end gap-2 md:gap-3">
                                                                    <button
                                                                        onClick={() => handleViewProfile(student._id)}
                                                                        className="px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl bg-indigo-600 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                                                                    >
                                                                        Audit
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
                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="relative group">
                                            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl overflow-hidden min-h-[500px]">
                                                <div className="flex justify-between items-center mb-10">
                                                    <div className="text-left">
                                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none uppercase">Unit Materials</h3>
                                                        <p className="text-sm font-medium text-slate-400 mt-2">Manage course syllabus, artifacts and knowledge payloads.</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
                                                        selectedCourse.materials.map((material, idx) => (
                                                            <motion.div
                                                                key={material._id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.1 }}
                                                                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-300"
                                                            >
                                                                <div className="flex items-center gap-6">
                                                                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-105">
                                                                        <FileText size={24} strokeWidth={2.5} />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <p className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1">{material.title}</p>
                                                                        <div className="flex items-center gap-3 text-slate-400">
                                                                            <Calendar size={12} />
                                                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                                                {new Date(material.uploadedAt).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-3">
                                                                    <a
                                                                        href={`http://localhost:5000${material.fileUrl}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-4 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
                                                                    >
                                                                        <Download size={18} strokeWidth={2.5} />
                                                                    </a>
                                                                    <button
                                                                        onClick={() => handleDeleteMaterial(material._id)}
                                                                        className="p-4 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
                                                                    >
                                                                        <Trash2 size={18} strokeWidth={2.5} />
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <div className="py-24 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center flex flex-col items-center justify-center space-y-6">
                                                            <Sparkles size={60} strokeWidth={1} className="text-slate-200 dark:text-slate-700 animate-pulse" />
                                                            <p className="text-sm font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">No materials found for this unit.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="relative group">
                                            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl">
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 leading-none uppercase">Load New Asset</h3>
                                                <form onSubmit={handleUploadMaterial} className="space-y-8">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Asset Label</label>
                                                        <input
                                                            type="text"
                                                            value={materialTitle}
                                                            onChange={(e) => setMaterialTitle(e.target.value)}
                                                            placeholder="e.g. Unit 1 Reference Node"
                                                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white shadow-inner"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Technical Payload</label>
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
                                                                className="w-full px-8 py-12 bg-slate-50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 transition-all group/upload overflow-hidden"
                                                            >
                                                                <FilePlus size={40} strokeWidth={1.5} className="text-slate-300 dark:text-slate-600 group-hover/upload:text-indigo-400 group-hover/upload:scale-110 transition-all duration-500 mb-3" />
                                                                <span className="text-[10px] font-black text-slate-400 text-center px-4 line-clamp-1 italic">
                                                                    {materialFile ? materialFile.name : "ATTACH SCHEMATIC DATA"}
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        disabled={uploading}
                                                        className="w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group/btn"
                                                    >
                                                        {uploading ? (
                                                            "TRANSMITTING..."
                                                        ) : (
                                                            <><Zap size={18} strokeWidth={2.5} /> Finalize Load</>
                                                        )}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div >
                )
                }

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
                                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800"
                            >
                                <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Unit Protocol</h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Modify curriculum biometrics</p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditOpen(false)}
                                        className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-indigo-600"
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
                                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white shadow-inner"
                                            placeholder="e.g. Mon, Wed 10:00 - 12:00"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Physical Locus (Room)</label>
                                        <input
                                            value={editForm?.room || ''}
                                            onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white shadow-inner"
                                            placeholder="e.g. Tech Annex 402"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Unit Abstract</label>
                                        <textarea
                                            rows="4"
                                            value={editForm?.description || ''}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white shadow-inner resize-none"
                                            placeholder="Briefly synthesize the course objectives..."
                                        />
                                    </div>

                                    <button
                                        onClick={handleUpdateCourse}
                                        className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Save size={18} /> Synchronize Changes
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
                                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800"
                            >
                                <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Discover</h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Integrate new course units</p>
                                    </div>
                                    <button
                                        onClick={() => setIsDiscoverOpen(false)}
                                        className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-indigo-600"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="p-10 space-y-6">
                                    <div className="relative group">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} strokeWidth={2.5} />
                                        <input
                                            placeholder="Search by name, code or department..."
                                            value={searchAllQuery}
                                            onChange={(e) => setSearchAllQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchAll()}
                                            className="w-full pl-16 pr-6 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white shadow-inner"
                                        />
                                        <button
                                            onClick={handleSearchAll}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Search
                                        </button>
                                    </div>

                                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                        {searchAllResults.map((course) => (
                                            <div key={course._id} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                        <BookOpen size={20} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 dark:text-white text-base tracking-tight leading-none mb-1.5">{course.name}</h4>
                                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{course.code} â€¢ {course.department}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <User size={10} className="text-slate-400" />
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Lead: {course.assignedFaculty?.user?.name || 'Authorized Personnel'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleJoinCourse(course._id)}
                                                    disabled={joining === course._id || courses.some(c => c._id === course._id)}
                                                    className={cn(
                                                        "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md",
                                                        courses.some(c => c._id === course._id)
                                                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-default"
                                                            : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-600/10"
                                                    )}
                                                >
                                                    {courses.some(c => c._id === course._id) ? 'Joined' : joining === course._id ? 'Joining...' : 'Join Unit'}
                                                </button>
                                            </div>
                                        ))}
                                        {searchAllResults.length === 0 && searchAllQuery && (
                                            <div className="text-center py-20">
                                                <Sparkles size={48} className="text-slate-200 dark:text-slate-800 mx-auto mb-4 animate-pulse" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No valid entities found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div >
        </Layout >
    );
};

export default FacultyCourses;
