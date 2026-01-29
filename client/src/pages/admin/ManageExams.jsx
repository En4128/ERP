import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    Calendar, Plus, Clock, MapPin, Trash2,
    FileText, CheckCircle, AlertCircle, Users, Download, Loader2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ManageExams = () => {
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        courseId: '',
        title: '',
        date: '',
        time: '',
        duration: '3 hrs',
        venue: '',
        type: 'midterm',
        department: 'Computer Science',
        semester: 3
    });

    // Filters
    const [selectedDept, setSelectedDept] = useState('all');
    const [selectedSem, setSelectedSem] = useState('all');
    const [adminStats, setAdminStats] = useState({ totalStudents: 0, resultsPublished: 0 });
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchExams();
        fetchCourses();
        fetchStats();
    }, [selectedDept, selectedSem]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/dashboard-stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdminStats(res.data.stats);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchExams = async () => {
        try {
            const token = localStorage.getItem('token');
            let url = 'http://localhost:5000/api/exams?';
            if (selectedDept !== 'all') url += `department=${selectedDept}&`;
            if (selectedSem !== 'all') url += `semester=${selectedSem}`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExams(res.data);
        } catch (error) {
            console.error("Error fetching exams:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/exams', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExams([...exams, res.data]);
            setShowModal(false);
            setFormData({
                courseId: '', title: '', date: '', time: '', duration: '3 hrs',
                venue: '', type: 'midterm', department: 'Computer Science', semester: 3
            });
            alert('Exam scheduled successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error scheduling exam');
        }
    };

    const handleGenerateHallTickets = async () => {
        if (selectedDept === 'all' || selectedSem === 'all') {
            alert('Please select a specific Department and Semester to generate hall tickets.');
            return;
        }

        setGenerating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/exams/hall-tickets?department=${selectedDept}&semester=${selectedSem}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { students, exams } = res.data;

            if (students.length === 0) {
                alert('No students found for the selected department and semester.');
                return;
            }

            if (exams.length === 0) {
                alert('No exams scheduled for the selected filters.');
                return;
            }

            const doc = new jsPDF();

            students.forEach((student, index) => {
                if (index > 0) doc.addPage();

                // Professional Header
                doc.setFontSize(22);
                doc.setTextColor(40);
                doc.text('LEARNEX ERP - ACADEMIC PORTAL', 105, 20, { align: 'center' });

                doc.setFontSize(16);
                doc.text('EXAMINATION HALL TICKET', 105, 30, { align: 'center' });

                doc.setDrawColor(200);
                doc.line(20, 35, 190, 35);

                // Student Info Box
                const studentName = student.user?.name || 'N/A';
                doc.setFontSize(12);
                doc.setTextColor(60);
                doc.text(`Student Name: ${studentName}`, 20, 50);
                doc.text(`Admission No: ${student.admissionNumber || 'N/A'}`, 20, 60);
                doc.text(`Department: ${student.department || 'N/A'}`, 120, 50);
                doc.text(`Semester: ${student.sem || 'N/A'}`, 120, 60);

                // Table of Exams
                const tableData = exams.map(exam => [
                    exam.course.code,
                    exam.course.name,
                    new Date(exam.date).toLocaleDateString(),
                    exam.time,
                    exam.venue
                ]);

                autoTable(doc, {
                    startY: 75,
                    head: [['Code', 'Course Name', 'Date', 'Time', 'Venue']],
                    body: tableData,
                    theme: 'striped',
                    headStyles: { fillColor: [124, 58, 237] }, // Purple-600
                    margin: { top: 75 }
                });

                // Footer / Instructions
                const finalY = doc.lastAutoTable.finalY + 20;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'italic');
                doc.text('Important Instructions:', 20, finalY);
                doc.setFont('helvetica', 'normal');
                doc.text('1. Please carry your physical ID card along with this hall ticket.', 20, finalY + 7);
                doc.text('2. Report to the examination hall 30 minutes before the scheduled time.', 20, finalY + 14);

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Controller of Examinations', 150, finalY + 40, { align: 'center' });
            });

            doc.save(`HallTickets_${selectedDept}_Sem${selectedSem}.pdf`);
        } catch (error) {
            console.error("Error generating hall tickets:", error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
            alert(`Error generating hall tickets: ${errorMessage}`);
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this exam?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/exams/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExams(exams.filter(e => e._id !== id));
        } catch (error) {
            console.error("Error deleting exam:", error);
        }
    };

    const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];

    return (
        <Layout role="admin">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header & Stats */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Exam Management</h1>
                        <p className="text-slate-600 dark:text-gray-400">Schedule exams, generate hall tickets, and manage results</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            disabled={generating}
                            onClick={handleGenerateHallTickets}
                            className="flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-gray-200 hover:bg-white dark:hover:bg-slate-700 transition disabled:opacity-50"
                        >
                            {generating ? (
                                <Loader2 size={18} className="mr-2 animate-spin" />
                            ) : (
                                <FileText size={18} className="mr-2" />
                            )}
                            {generating ? 'Generating...' : 'Generate Hall Tickets'}
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition shadow-lg shadow-amber-500/30"
                        >
                            <Plus size={18} className="mr-2" /> Schedule Exam
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{exams.length}</p>
                            <p className="text-sm text-slate-600">Scheduled Exams</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {exams.filter(e => new Date(e.date) > new Date()).length}
                            </p>
                            <p className="text-sm text-slate-600">Upcoming</p>
                        </div>
                    </div>
                    {/* Placeholders for user requested stats */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {adminStats.resultsPublished}
                            </p>
                            <p className="text-sm text-slate-600">Results Published</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {adminStats.totalStudents}
                            </p>
                            <p className="text-sm text-slate-600">Total Students</p>
                        </div>
                    </div>
                </div>

                {/* Filters & Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Exam Schedule</h3>
                        <div className="flex gap-3">
                            <select
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white text-sm outline-none"
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                            >
                                <option value="all">All Departments</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white text-sm outline-none"
                                value={selectedSem}
                                onChange={(e) => setSelectedSem(e.target.value)}
                            >
                                <option value="all">All Semesters</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white dark:bg-slate-900/50 text-slate-600 dark:text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Course</th>
                                    <th className="p-4 font-semibold">Date & Time</th>
                                    <th className="p-4 font-semibold">Duration</th>
                                    <th className="p-4 font-semibold">Venue</th>
                                    <th className="p-4 font-semibold">Type</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-600">Loading exams...</td></tr>
                                ) : exams.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-600">No exams scheduled yet.</td></tr>
                                ) : (
                                    exams.map(exam => (
                                        <tr key={exam._id} className="hover:bg-white dark:hover:bg-slate-700/50 transition">
                                            <td className="p-4">
                                                <div className="font-medium text-slate-900 dark:text-white">{exam.course?.code || '---'}</div>
                                                <div className="text-sm text-slate-600">{exam.title || exam.course?.name}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-gray-300 text-sm">
                                                    <Calendar size={14} className="text-blue-700" />
                                                    {new Date(exam.date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600 text-xs mt-1">
                                                    <Clock size={12} />
                                                    {exam.time}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{exam.duration}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <MapPin size={14} />
                                                    {exam.venue}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border
                                                    ${exam.type === 'midterm' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        exam.type === 'final' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                            'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                    {exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(exam._id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Schedule Exam Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Schedule New Exam</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <form id="examForm" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        >
                                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                                            value={formData.semester}
                                            onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course</label>
                                    <select
                                        required
                                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                                        value={formData.courseId}
                                        onChange={(e) => {
                                            const course = courses.find(c => c._id === e.target.value);
                                            setFormData({
                                                ...formData,
                                                courseId: e.target.value,
                                                title: course ? course.name : ''
                                            });
                                        }}
                                    >
                                        <option value="">Select Course</option>
                                        {courses
                                            .filter(c => c.department === formData.department)
                                            .map(c => <option key={c._id} value={c._id}>{c.code} - {c.name}</option>)
                                        }
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Exam Title/Description</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                                        <input
                                            type="time"
                                            required
                                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Venue</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                                            value={formData.venue}
                                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                        >
                                            <option value="">Select Venue</option>
                                            {['Hall A', 'Hall B', 'Hall C', 'Lab 101', 'Lab 201'].map(v => (
                                                <option key={v} value={v}>{v}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Exam Type</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="midterm">Midterm</option>
                                            <option value="final">Final</option>
                                            <option value="practical">Practical</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-white dark:bg-slate-900/50">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                form="examForm"
                                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/30 transition"
                            >
                                Schedule Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ManageExams;
