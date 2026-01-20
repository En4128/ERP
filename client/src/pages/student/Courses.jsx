import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { BookOpen, Users, Clock, ChevronRight, CheckCircle, GraduationCap, Search, X, Filter } from 'lucide-react';
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
                                        <CourseCard key={course._id} course={course} type="enrolled" />
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
                                        <CourseCard key={course._id} course={course} type="available" onEnroll={handleEnroll} />
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
                        <span className="text-slate-600 dark:text-slate-400">Progress</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                            className="h-full bg-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
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
        </div>
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
