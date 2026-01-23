import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { BookOpen, Users, Clock, ChevronRight, CheckCircle, GraduationCap, Search, X, Filter, FileText, Download, ExternalLink } from 'lucide-react';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [creditsFilter, setCreditsFilter] = useState('all');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

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
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/student/enroll', { courseId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Enrolled successfully!');
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to enroll');
        }
    };

    const filterCourses = (courses) => {
        return courses.filter(course => {
            const matchesSearch =
                course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (course.assignedFaculty?.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesDepartment =
                departmentFilter === 'all' ||
                course.department?.toLowerCase() === departmentFilter.toLowerCase();

            const matchesCredits =
                creditsFilter === 'all' ||
                course.credits.toString() === creditsFilter;

            return matchesSearch && matchesDepartment && matchesCredits;
        });
    };

    const filteredEnrolled = useMemo(() => filterCourses(enrolledCourses), [enrolledCourses, searchQuery, departmentFilter, creditsFilter]);
    const filteredAvailable = useMemo(() => filterCourses(availableCourses), [availableCourses, searchQuery, departmentFilter, creditsFilter]);
    const filteredCompleted = useMemo(() => filterCourses(completedCourses), [completedCourses, searchQuery, departmentFilter, creditsFilter]);

    const clearFilters = () => {
        setSearchQuery('');
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="student">
            <div className="space-y-6 animate-fade-in-up">
                <Toaster position="top-right" />

                {/* Header with Stats */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Courses</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Manage your course registrations and track progress
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                                    <BookOpen className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-slate-600 dark:text-slate-400 text-xs">Current</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{enrolledCourses.length} Courses</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30">
                                    <Clock className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                                </div>
                                <div>
                                    <p className="text-slate-600 dark:text-slate-400 text-xs">Credits</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{totalCredits} This Sem</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-slate-600 dark:text-slate-400 text-xs">Completed</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{completedCredits} Credits</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search courses, faculty..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900"
                            />
                        </div>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none text-slate-900"
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
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none text-slate-900"
                        >
                            {creditOptions.map(credit => (
                                <option key={credit} value={credit}>
                                    {credit === 'all' ? 'All Credits' : `${credit} Credits`}
                                </option>
                            ))}
                        </select>
                        {(searchQuery || departmentFilter !== 'all' || creditsFilter !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="border-b border-gray-100 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-900">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('enrolled')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'enrolled'
                                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <BookOpen className="h-4 w-4" />
                                Enrolled ({filteredEnrolled.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('available')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'available'
                                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <GraduationCap className="h-4 w-4" />
                                Available ({filteredAvailable.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'completed'
                                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <CheckCircle className="h-4 w-4" />
                                Completed ({filteredCompleted.length})
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Enrolled Tab */}
                        {activeTab === 'enrolled' && (
                            filteredEnrolled.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredEnrolled.map((course) => (
                                        <CourseCard
                                            key={course._id}
                                            course={course}
                                            type="enrolled"
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
                                        <CourseCard key={course._id} course={course} type="completed" />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={CheckCircle} message="No completed courses found." />
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Course Details Modal */}
            <AnimatePresence>
                {dialogOpen && selectedCourse && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                                        <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">{selectedCourse.code}</span>
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
                                                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-teal-500 shadow-sm border border-slate-100 dark:border-slate-800">
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
                                                        className="p-2.5 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-all shadow-md shadow-teal-500/20"
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
        </Layout>
    );
};

// Course Card Component
const CourseCard = ({ course, type, onEnroll }) => {
    const isFull = course.status === 'full';
    const progress = course.progress || 0;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        {course.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 leading-tight">
                        {course.name}
                    </h3>
                </div>
                {type === 'available' && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isFull
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        }`}>
                        {isFull ? 'Full' : 'Open'}
                    </span>
                )}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {course.assignedFaculty?.user?.name || course.assignedFaculty?.name || 'TBA'}
            </p>

            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.credits} Credits</span>
                </div>
                <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.enrolled || 0}/{course.seats}</span>
                </div>
            </div>

            {type === 'enrolled' && (
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        
                    </div>
                   
                </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-gray-100 dark:border-slate-700 pt-3">
                {course.schedule || 'Schedule TBA'} • {course.room || 'Room TBA'}
            </p>

            {type === 'available' && (
                <button
                    onClick={() => onEnroll(course._id)}
                    disabled={isFull}
                    className={`w-full mt-4 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${isFull
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700'
                        : 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-200 dark:shadow-none'
                        }`}
                >
                    {isFull ? 'Full' : 'Enroll Now'}
                </button>
            )}

            {type === 'enrolled' && (
                <button
                    onClick={() => onEnroll(course)}
                    className="w-full mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-teal-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <ExternalLink className="h-4 w-4" /> View Materials
                </button>
            )}
        </div >
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
