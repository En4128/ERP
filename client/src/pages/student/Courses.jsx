import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { BookOpen, Users, Clock, ChevronRight, CheckCircle, GraduationCap, Search, X, Filter, FileText, Download, ExternalLink, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';

const StudentCourses = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('enrolled');

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [creditsFilter, setCreditsFilter] = useState('all');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [enrollingId, setEnrollingId] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [profileRes, coursesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/student/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/courses', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const student = profileRes.data;
            const allCourses = coursesRes.data;
            setUser(student);

            const enrolledIds = student.enrolledCourses.map(c => typeof c === 'object' ? c._id : c);

            const enrolled = [];
            const available = [];
            const completed = [];

            allCourses.forEach(course => {
                if (enrolledIds.includes(course._id)) {
                    enrolled.push({ ...course, status: 'enrolled', progress: Math.floor(Math.random() * 100) });
                } else if (course.status === 'active') {
                    const isFull = (course.enrolled || 0) >= (course.seats || 50);
                    available.push({ ...course, status: isFull ? 'full' : 'available' });
                }
            });

            setEnrolledCourses(enrolled);
            setAvailableCourses(available);
            setCompletedCourses(completed);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching courses:", error);
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            setEnrollingId(courseId);
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/student/enroll', { courseId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to enroll');
        } finally {
            setEnrollingId(null);
        }
    };

    const filterCourses = useCallback((courses) => {
        if (!Array.isArray(courses)) return [];

        const query = (searchTerm || '').trim().toLowerCase();
        const dept = (departmentFilter || 'all').toLowerCase();
        const credits = (creditsFilter || 'all').toString();

        return courses.filter(course => {
            if (!course) return false;

            // Search matches
            const courseName = (course.name || '').toLowerCase();
            const courseCode = (course.code || '').toLowerCase();
            const facultyName = (
                course.assignedFaculty?.user?.name ||
                course.assignedFaculty?.name ||
                ''
            ).toLowerCase();

            const matchesSearch = !query ||
                courseName.includes(query) ||
                courseCode.includes(query) ||
                facultyName.includes(query);

            // Department matches
            const matchesDepartment = dept === 'all' ||
                (course.department || '').toLowerCase() === dept;

            // Credits matches
            const matchesCredits = credits === 'all' ||
                (course.credits || '').toString() === credits;

            return matchesSearch && matchesDepartment && matchesCredits;
        });
    }, [searchTerm, departmentFilter, creditsFilter]);

    const filteredEnrolled = useMemo(() => filterCourses(enrolledCourses), [enrolledCourses, filterCourses]);
    const filteredAvailable = useMemo(() => filterCourses(availableCourses), [availableCourses, filterCourses]);
    const filteredCompleted = useMemo(() => filterCourses(completedCourses), [completedCourses, filterCourses]);

    const clearFilters = () => {
        setSearchTerm('');
        setDepartmentFilter('all');
        setCreditsFilter('all');
    };

    const totalCredits = enrolledCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
    const completedCredits = completedCourses.reduce((sum, c) => sum + (c.credits || 0), 0);

    const departments = ['all', ...new Set(enrolledCourses.concat(availableCourses).map(c => c.department).filter(Boolean))];
    const creditOptions = ['all', '1', '2', '3', '4', '5', '6'];

    if (loading) {
        return (
            <Layout role="student">
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="student">
            <div className="space-y-6 animate-fade-in-up">
                <Toaster position="top-right" />

                {/* Header with Stats */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-1 bg-indigo-600 rounded-full"></div>
                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Academic Portal</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">My Courses</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md font-medium">
                            Manage your academic path, track detailed progress, and explore new learning opportunities.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-indigo-50/40 dark:bg-slate-800/50 p-4 rounded-3xl border border-indigo-100/50 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 rounded-xl bg-blue-100/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active</span>
                            </div>
                            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{enrolledCourses.length}</p>
                        </div>

                        <div className="bg-indigo-50/40 dark:bg-slate-800/50 p-4 rounded-3xl border border-indigo-100/50 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 rounded-xl bg-indigo-100/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Credits</span>
                            </div>
                            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{totalCredits}</p>
                        </div>

                        <div className="bg-indigo-50/40 dark:bg-slate-800/50 p-4 rounded-3xl border border-indigo-100/50 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 rounded-xl bg-emerald-100/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Done</span>
                            </div>
                            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{completedCredits}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-indigo-100/50 dark:border-slate-800/50 p-6 shadow-xl shadow-indigo-100/50 dark:shadow-none">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400 group-hover:text-indigo-600 transition-colors pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Find a course, faculty member, or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 w-full p-4 rounded-2xl border border-indigo-50 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 dark:text-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 focus:outline-none text-slate-900 transition-all font-medium placeholder:text-slate-400 shadow-sm"
                            />
                        </div>

                        <div className="flex gap-3">
                            <select
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="p-4 rounded-2xl border border-indigo-50 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 dark:text-white focus:ring-4 focus:ring-indigo-500/5 outline-none text-slate-900 transition-all font-semibold text-sm min-w-[170px] appearance-none cursor-pointer shadow-sm"
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>
                                        {dept === 'all' ? 'All Departments' : dept}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={creditsFilter}
                                onChange={(e) => setCreditsFilter(e.target.value)}
                                className="p-4 rounded-2xl border border-indigo-50 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 dark:text-white focus:ring-4 focus:ring-indigo-500/5 outline-none text-slate-900 transition-all font-semibold text-sm min-w-[140px] appearance-none cursor-pointer shadow-sm"
                            >
                                {creditOptions.map(credit => (
                                    <option key={credit} value={credit}>
                                        {credit === 'all' ? 'Any Credits' : `${credit} Credits`}
                                    </option>
                                ))}
                            </select>

                            {(searchTerm || departmentFilter !== 'all' || creditsFilter !== 'all') && (
                                <button
                                    onClick={clearFilters}
                                    className="p-4 rounded-2xl bg-rose-100/50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-200/50 dark:hover:bg-rose-500/20 transition-all flex items-center justify-center aspect-square shadow-sm"
                                    title="Reset filters"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-indigo-50/50 dark:bg-slate-950/50 p-1.5 rounded-[2rem] flex gap-2 border border-indigo-100/50 dark:border-slate-800/50 shadow-inner shadow-indigo-100/20">
                    <button
                        onClick={() => setActiveTab('enrolled')}
                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-500 ${activeTab === 'enrolled'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xl shadow-indigo-200/50'
                            : 'text-slate-500 hover:text-indigo-600 dark:hover:text-slate-300'
                            }`}
                    >
                        <BookOpen className={`h-4 w-4 transition-transform duration-500 ${activeTab === 'enrolled' ? 'scale-125' : ''}`} />
                        ENROLLED
                        <span className={`ml-1 px-2.5 py-0.5 rounded-lg text-[10px] ${activeTab === 'enrolled' ? 'bg-indigo-600 text-white' : 'bg-indigo-100/50 text-indigo-600 dark:bg-slate-800'}`}>
                            {filteredEnrolled.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('available')}
                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-500 ${activeTab === 'available'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xl shadow-indigo-200/50'
                            : 'text-slate-500 hover:text-indigo-600 dark:hover:text-slate-300'
                            }`}
                    >
                        <GraduationCap className={`h-4 w-4 transition-transform duration-500 ${activeTab === 'available' ? 'scale-125' : ''}`} />
                        DISCOVER
                        <span className={`ml-1 px-2.5 py-0.5 rounded-lg text-[10px] ${activeTab === 'available' ? 'bg-indigo-600 text-white' : 'bg-indigo-100/50 text-indigo-600 dark:bg-slate-800'}`}>
                            {filteredAvailable.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-500 ${activeTab === 'completed'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xl shadow-indigo-200/50'
                            : 'text-slate-500 hover:text-indigo-600 dark:hover:text-slate-300'
                            }`}
                    >
                        <CheckCircle className={`h-4 w-4 transition-transform duration-500 ${activeTab === 'completed' ? 'scale-125' : ''}`} />
                        COMPLETED
                        <span className={`ml-1 px-2.5 py-0.5 rounded-lg text-[10px] ${activeTab === 'completed' ? 'bg-indigo-600 text-white' : 'bg-indigo-100/50 text-indigo-600 dark:bg-slate-800'}`}>
                            {filteredCompleted.length}
                        </span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="mt-8">
                    {/* Enrolled Tab */}
                    {activeTab === 'enrolled' && (
                        filteredEnrolled.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredEnrolled.map((course) => (
                                    <CourseCard
                                        key={course._id}
                                        course={course}
                                        type="enrolled"
                                        enrollingId={enrollingId}
                                        onEnroll={(c) => {
                                            setSelectedCourse(c);
                                            setDialogOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={BookOpen} message="No enrolled courses found matching your filters." />
                        )
                    )}

                    {/* Available Tab */}
                    {activeTab === 'available' && (
                        filteredAvailable.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredAvailable.map((course) => (
                                    <CourseCard
                                        key={course._id}
                                        course={course}
                                        type="available"
                                        enrollingId={enrollingId}
                                        onEnroll={(id) => handleEnroll(id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={GraduationCap} message="No available courses found matching your filters." />
                        )
                    )}

                    {/* Completed Tab */}
                    {activeTab === 'completed' && (
                        filteredCompleted.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredCompleted.map((course) => (
                                    <CourseCard key={course._id} course={course} type="completed" enrollingId={enrollingId} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={CheckCircle} message="No completed courses found." />
                        )
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/20 dark:bg-slate-950/20 backdrop-blur-3xl"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden"
                        >
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative z-10"
                            >
                                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/40">
                                    <CheckCircle className="text-white w-12 h-12" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Success!</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">You have been successfully enrolled.</p>
                            </motion.div>

                            {/* Decorative Background Elements */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Course Details Modal */}
            <AnimatePresence>
                {dialogOpen && selectedCourse && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                            onClick={() => { setDialogOpen(false); setSelectedCourse(null); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-slate-200/50 dark:border-slate-800/50 max-h-[85vh] flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{selectedCourse.code}</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{selectedCourse.name}</h2>
                                </div>
                                <button
                                    onClick={() => { setDialogOpen(false); setSelectedCourse(null); }}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Course Description</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {selectedCourse.description || "No description available for this course yet."}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Course Materials</h3>
                                    <div className="space-y-3">
                                        {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
                                            selectedCourse.materials.map((material) => (
                                                <div key={material._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-indigo-500 shadow-sm border border-slate-100 dark:border-slate-800">
                                                            <FileText size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{material.title}</p>
                                                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">
                                                                Uploaded on {new Date(material.uploadedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={`http://localhost:5000${material.fileUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-all shadow-md shadow-indigo-500/20"
                                                    >
                                                        <Download size={16} />
                                                    </a>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center">
                                                <BookOpen size={32} className="mx-auto text-slate-200 dark:text-slate-800 mb-2" />
                                                <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">No materials available yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Schedule</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedCourse.schedule || "TBA"}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Location</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedCourse.room || "TBA"}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout >
    );
};

// Course Card Component
const CourseCard = ({ course, type, onEnroll, enrollingId }) => {
    const isFull = course.status === 'full';
    const isEnrolling = enrollingId === course._id;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            className="group relative bg-white/90 dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50/50 dark:border-slate-800 overflow-hidden transition-all duration-500 hover:bg-white"
        >
            {/* Visual Accents */}
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${type === 'enrolled' ? 'from-indigo-500 to-blue-500' :
                type === 'completed' ? 'from-emerald-500 to-teal-500' :
                    'from-amber-500 to-orange-500'
                }`}></div>

            <div className="flex items-start justify-between mb-6">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{course.code}</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {course.name}
                    </h3>
                </div>
                {type === 'available' && (
                    <div className={`p-2 rounded-xl ${isFull
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                        }`}>
                        {isFull ? <X size={16} /> : <CheckCircle size={16} />}
                    </div>
                )}
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-white dark:border-slate-700">
                        <img
                            src={`https://ui-avatars.com/api/?name=${course.assignedFaculty?.user?.name || 'TBA'}&background=random`}
                            alt="faculty"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {course.assignedFaculty?.user?.name || course.assignedFaculty?.name || 'TBA'}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-2xl bg-indigo-50/30 dark:bg-slate-800/50 border border-indigo-100/20 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-tighter mb-1">Credits</p>
                        <p className="text-xs font-bold text-indigo-600 dark:text-white flex items-center gap-1.5">
                            <Award className="h-3 w-3 text-indigo-500" />
                            {course.credits} UNIT
                        </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-indigo-50/30 dark:bg-slate-800/50 border border-indigo-100/20 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-tighter mb-1">Enrolled</p>
                        <p className="text-xs font-bold text-indigo-600 dark:text-white flex items-center gap-1.5">
                            <Users className="h-3 w-3 text-blue-500" />
                            {course.enrolled || 0}/{course.seats}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-tighter">{course.schedule || 'TBA'}</span>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                {type === 'available' && (
                    <button
                        onClick={() => onEnroll(course._id)}
                        disabled={isFull || isEnrolling}
                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all transform active:scale-95 flex items-center justify-center gap-3 ${isFull || isEnrolling
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/20'
                            }`}
                    >
                        {isEnrolling ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <Clock className="w-4 h-4" />
                                </motion.div>
                                ENROLLING...
                            </>
                        ) : (
                            isFull ? 'FULLY BOOKED' : 'SECURE SPOT'
                        )}
                    </button>
                )}

                {type === 'enrolled' && (
                    <button
                        onClick={() => onEnroll(course)}
                        className="w-full py-4 rounded-2xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 group"
                    >
                        LEARNING HUB
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                )}

                {type === 'completed' && (
                    <div className="w-full py-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-[0.2em]">
                        <CheckCircle className="h-4 w-4" />
                        RECORDS STORED
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Empty State Component
const EmptyState = ({ icon: Icon, message }) => (
    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{message}</p>
    </div>
);

export default StudentCourses;
