import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    BookOpen, Plus, Search, Edit, Trash2, Users, Clock,
    GraduationCap, Building, MoreHorizontal, Filter, X
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'CDC'];

// Helper component for Modal
const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
                <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                    {footer}
                </div>
            </div>
        </div>
    );
};

const CourseForm = ({ data, setData, facultyList, isEdit = false }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Course Code *</label>
                <input
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="CS301"
                    value={data.code}
                    onChange={(e) => setData({ ...data, code: e.target.value })}
                    disabled={isEdit}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Course Name *</label>
                <input
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Data Structures"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Department *</label>
                <select
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={data.department}
                    onChange={(e) => setData({ ...data, department: e.target.value })}
                >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Assign Faculty *</label>
                <select
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={data.facultyId || (data.assignedFaculty?._id || data.assignedFaculty)}
                    onChange={(e) => setData({ ...data, facultyId: e.target.value })}
                >
                    <option value="">Select faculty</option>
                    {facultyList
                        .filter(f => !data.department || f.department.toLowerCase() === data.department.toLowerCase())
                        .map(f => (
                            <option key={f._id} value={f._id}>{f.user.name}</option>
                        ))}
                </select>
            </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Credits</label>
                <select
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={data.credits}
                    onChange={(e) => setData({ ...data, credits: parseInt(e.target.value) })}
                >
                    {[1, 2, 3, 4, 5, 6].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Semester</label>
                <select
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={data.semester}
                    onChange={(e) => setData({ ...data, semester: parseInt(e.target.value) })}
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Seats</label>
                <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={data.seats}
                    onChange={(e) => setData({ ...data, seats: parseInt(e.target.value) })}
                />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Schedule</label>
                <input
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. Mon, Wed 9:00 AM"
                    value={data.schedule}
                    onChange={(e) => setData({ ...data, schedule: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Room</label>
                <input
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. 301"
                    value={data.room}
                    onChange={(e) => setData({ ...data, room: e.target.value })}
                />
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
            <select
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={data.status}
                onChange={(e) => setData({ ...data, status: e.target.value })}
            >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
        </div>
    </div>
);

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedSemester, setSelectedSemester] = useState('all');

    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    const [newCourse, setNewCourse] = useState({
        code: '',
        name: '',
        department: '',
        facultyId: '',
        credits: 3,
        semester: 1,
        seats: 60,
        schedule: '',
        room: '',
        status: 'active',
        description: '',
    });



    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [coursesRes, facultyRes] = await Promise.all([
                axios.get('http://localhost:5000/api/courses', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/admin/faculty', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
            setFacultyList(Array.isArray(facultyRes.data) ? facultyRes.data : []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setCourses([]);
            setFacultyList([]);
            toast.error("Failed to load courses");
            setLoading(false);
        }
    };

    const handleAddCourse = async () => {
        try {
            const token = localStorage.getItem('token');
            // Find faculty object if needed, but we save ID
            const payload = {
                ...newCourse,
                assignedFaculty: newCourse.facultyId,
                seatLimit: newCourse.seats
            };

            const res = await axios.post('http://localhost:5000/api/courses', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCourses([...courses, res.data]);
            setIsAddDialogOpen(false);
            setNewCourse({
                code: '', name: '', department: '', facultyId: '', credits: 3,
                semester: 1, seats: 60, schedule: '', room: '', status: 'active', description: '',
            });
            toast.success('Course created successfully!');
            // Refresh to get populated faculty
            fetchInitialData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create course');
        }
    };

    const handleEditCourse = async () => {
        if (!editingCourse) return;
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...editingCourse,
                assignedFaculty: editingCourse.facultyId || editingCourse.assignedFaculty?._id || editingCourse.assignedFaculty
            };

            const res = await axios.put(`http://localhost:5000/api/courses/${editingCourse._id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCourses(courses.map(c => c._id === editingCourse._id ? res.data : c));
            setIsEditDialogOpen(false);
            setEditingCourse(null);
            toast.success('Course updated successfully!');
            fetchInitialData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update course');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(courses.filter(c => c._id !== courseId));
            toast.success('Course deleted successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete course');
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = selectedDepartment === 'all' || course.department === selectedDepartment;
        const matchesSemester = selectedSemester === 'all' || course.semester.toString() === selectedSemester;
        return matchesSearch && matchesDepartment && matchesSemester;
    });

    const totalEnrolled = courses.reduce((sum, c) => sum + (c.enrolled || 0), 0);
    const totalCapacity = courses.reduce((sum, c) => sum + (c.seats || 60), 0);

    // Helper components moved to top

    return (
        <div className="space-y-6 animate-fade-in-up">
            <Toaster position="top-right" />
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Course Management</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Create and manage courses with faculty assignments</p>
                </div>
                <button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 font-medium"
                >
                    <Plus className="h-5 w-5" /> Create Course
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                    { label: 'Total Enrolled', value: totalEnrolled, icon: Users, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
                    { label: 'Capacity Used', value: `${totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0}%`, icon: GraduationCap, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Departments', value: new Set(courses.map(c => c.department)).size, icon: Building, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-slate-500" />
                        <input
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full p-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
                        />
                    </div>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                    >
                        <option value="all">All Departments</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                    >
                        <option value="all">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider border-b dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Faculty</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Schedule</th>
                                <th className="px-6 py-4">Enrolled</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-8 dark:text-slate-400">Loading...</td></tr>
                            ) : filteredCourses.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-500 dark:text-slate-500">No courses found</td></tr>
                            ) : (
                                filteredCourses.map((course) => (
                                    <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-slate-800 font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-300">{course.code}</span>
                                                    <span className="font-semibold text-slate-900 dark:text-white">{course.name}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                                                    {course.credits} Credits • Sem {course.semester}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                <GraduationCap className="h-4 w-4 text-indigo-700 dark:text-indigo-400" />
                                                {course.assignedFaculty?.user?.name || course.assignedFaculty?.name || 'Unassigned'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-100 dark:border-teal-900/30">
                                                <Building className="h-3 w-3" />
                                                {course.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                    <Clock className="h-3.5 w-3.5" /> {course.schedule || 'N/A'}
                                                </div>
                                                {course.room && (
                                                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-500 text-xs mt-1">
                                                        <Building className="h-3 w-3" /> {course.room}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-24">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="dark:text-slate-300">{course.enrolled || 0}</span>
                                                    <span className="text-gray-400">/ {course.seats}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-teal-500 rounded-full"
                                                        style={{ width: `${Math.min(((course.enrolled || 0) / course.seats) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${course.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30'
                                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30'
                                                }`}>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => { setEditingCourse(course); setIsEditDialogOpen(true); }}
                                                    className="p-2 text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCourse(course._id)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                title="Create New Course"
                footer={
                    <>
                        <button onClick={() => setIsAddDialogOpen(false)} className="px-4 py-2 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                        <button onClick={handleAddCourse} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-md transition-all hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30">Create Course</button>
                    </>
                }
            >
                <CourseForm data={newCourse} setData={setNewCourse} facultyList={facultyList} />
            </Modal>

            <Modal
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                title="Edit Course"
                footer={
                    <>
                        <button onClick={() => setIsEditDialogOpen(false)} className="px-4 py-2 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                        <button onClick={handleEditCourse} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-md transition-all hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30">Save Changes</button>
                    </>
                }
            >
                {editingCourse && <CourseForm data={editingCourse} setData={setEditingCourse} isEdit={true} facultyList={facultyList} />}
            </Modal>
        </div>
    );
};

export default AdminCourses;
