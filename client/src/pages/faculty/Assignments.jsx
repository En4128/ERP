import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    FileText,
    Plus,
    Calendar,
    Users,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    ArrowRight,
    Sparkles,
    Trash2,
    Eye,
    Edit3,
    GraduationCap,
    X,
    Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

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

const FacultyAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [viewSubmissionsModal, setViewSubmissionsModal] = useState(false);
    const [gradingModal, setGradingModal] = useState(false);
    const [viewAssignmentModal, setViewAssignmentModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        dueDate: '',
        points: 100
    });
    const [file, setFile] = useState(null);

    // Grading State
    const [gradeData, setGradeData] = useState({
        grade: '',
        feedback: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [assignRes, courseRes] = await Promise.all([
                axios.get('http://localhost:5000/api/assignments', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/faculty/courses', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setAssignments(assignRes.data.data);
            setCourses(courseRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
            setLoading(false);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (file) data.append('file', file);

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/assignments', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Assignment created successfully!");
            setShowCreateModal(false);
            fetchInitialData();
            setFormData({ title: '', description: '', courseId: '', dueDate: '', points: 100 });
            setFile(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create assignment");
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/assignments/${assignmentId}/submissions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubmissions(res.data.data);
            setViewSubmissionsModal(true);
        } catch (error) {
            toast.error("Failed to fetch submissions");
        }
    };

    const handleGradeSubmission = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/assignments/submissions/${selectedSubmission._id}/grade`, gradeData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Submission graded!");
            setGradingModal(false);
            fetchSubmissions(selectedAssignment._id);
        } catch (error) {
            toast.error("Failed to grade submission");
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

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-400/10 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 w-fit"
                        >
                            <Sparkles size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Assignment Hub</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter leading-tight">
                            Manage <br />
                            <span className="text-indigo-400">Assignments</span>
                        </h1>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-10 py-5 bg-indigo-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <Plus size={16} /> Create New
                    </button>
                </div>

                {/* Assignments List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.length > 0 ? assignments.map((assignment, idx) => (
                        <GlassCard key={assignment._id} className="group p-8 flex flex-col justify-between h-full" delay={idx * 0.1}>
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-2">
                                        <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform duration-500">
                                            <FileText size={24} />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedAssignment(assignment);
                                                setViewAssignmentModal(true);
                                            }}
                                            className="p-4 rounded-2xl bg-[#F1F3F7] dark:bg-[#2D3548] text-[#64748B] dark:text-[#868D9D] hover:text-indigo-600 transition-all"
                                            title="View Details"
                                        >
                                            <Eye size={20} />
                                        </button>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-full bg-[#E5E7EB] dark:bg-[#242B3D] text-[10px] font-black uppercase tracking-widest text-[#64748B] dark:text-[#868D9D]">
                                        {assignment.course.code}
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-[#0F1419] dark:text-[#E8EAED] mb-2 line-clamp-1">{assignment.title}</h3>
                                <p className="text-[#64748B] dark:text-[#868D9D] text-sm font-medium mb-6 line-clamp-2">{assignment.description}</p>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Calendar size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <CheckCircle2 size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Points: {assignment.points}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedAssignment(assignment);
                                    fetchSubmissions(assignment._id);
                                }}
                                className="w-full py-4 bg-[#F1F3F7] dark:bg-[#2D3548] hover:bg-indigo-600 hover:text-white text-[#0F1419] dark:text-[#E8EAED] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                            >
                                <Users size={16} /> View Submissions
                            </button>
                        </GlassCard>
                    )) : (
                        <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase tracking-[0.2em]">
                            No assignments created yet
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowCreateModal(false)}
                                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-2xl bg-[#E5E7EB] dark:bg-[#1A1F2E] rounded-[3rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-10">
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-3xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter uppercase">New Assignment</h2>
                                        <button onClick={() => setShowCreateModal(false)} className="p-3 bg-[#E5E7EB] dark:bg-[#242B3D] rounded-2xl text-[#64748B] dark:text-[#868D9D] hover:text-rose-500 transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleCreateAssignment} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                                <input
                                                    required
                                                    value={formData.title}
                                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                    className="w-full px-6 py-4 bg-[#F1F3F7] dark:bg-[#2D3548] border border-[#E2E5E9] dark:border-[#3D4556] rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                                    placeholder="Assignment Title"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                                <textarea
                                                    required
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full px-6 py-4 bg-[#F1F3F7] dark:bg-[#2D3548] border border-[#E2E5E9] dark:border-[#3D4556] rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white min-h-[120px]"
                                                    placeholder="Provide instructions..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course</label>
                                                <select
                                                    required
                                                    value={formData.courseId}
                                                    onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                                                    className="w-full px-6 py-4 bg-[#F1F3F7] dark:bg-[#2D3548] border border-[#E2E5E9] dark:border-[#3D4556] rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                                >
                                                    <option value="">Select Course</option>
                                                    {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Points</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.points}
                                                    onChange={e => setFormData({ ...formData, points: e.target.value })}
                                                    className="w-full px-6 py-4 bg-[#F1F3F7] dark:bg-[#2D3548] border border-[#E2E5E9] dark:border-[#3D4556] rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.dueDate}
                                                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                                    className="w-full px-6 py-4 bg-[#F1F3F7] dark:bg-[#2D3548] border border-[#E2E5E9] dark:border-[#3D4556] rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference File</label>
                                                <input
                                                    type="file"
                                                    onChange={e => setFile(e.target.files[0])}
                                                    className="w-full px-6 py-3 bg-[#F1F3F7] dark:bg-[#2D3548] border border-[#E2E5E9] dark:border-[#3D4556] rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-indigo-500/10 file:text-indigo-600"
                                                />
                                            </div>
                                        </div>
                                        <button className="w-full py-5 bg-indigo-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.25em] shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all">
                                            Publish Assignment
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Submissions Modal */}
                <AnimatePresence>
                    {viewSubmissionsModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setViewSubmissionsModal(false)}
                                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-5xl bg-[#E5E7EB] dark:bg-[#1A1F2E] rounded-[3rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
                            >
                                <div className="p-10 border-b border-[#E2E5E9] dark:border-[#3D4556] flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-black text-[#0F1419] dark:text-[#E8EAED] uppercase tracking-tight">{selectedAssignment?.title}</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Submissions ({submissions.length})</p>
                                    </div>
                                    <button onClick={() => setViewSubmissionsModal(false)} className="p-3 bg-[#E5E7EB] dark:bg-[#242B3D] rounded-2xl text-[#64748B] dark:text-[#868D9D] hover:text-rose-500 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-10">
                                    {submissions.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {submissions.map((sub, idx) => (
                                                <div key={sub._id} className="p-6 bg-[#F1F3F7] dark:bg-[#2D3548] rounded-3xl border border-[#E2E5E9] dark:border-[#3D4556] flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center font-black text-indigo-600">
                                                            {sub.student?.user?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-[#0F1419] dark:text-[#E8EAED] text-sm">{sub.student?.user?.name || 'Unknown Student'}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub.student?.admissionNumber || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className={cn(
                                                                "text-[10px] font-black uppercase tracking-widest",
                                                                sub.status === 'graded' ? "text-emerald-500" : "text-amber-500"
                                                            )}>
                                                                {sub.status === 'graded' ? `Graded: ${sub.grade}/${selectedAssignment.points}` : 'Pending Grade'}
                                                            </p>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                                Submitted: {new Date(sub.submittedAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <a
                                                            href={`http://localhost:5000${sub.fileUrl}`}
                                                            target="_blank"
                                                            className="p-3 bg-[#E5E7EB] dark:bg-[#1A1F2E] rounded-2xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                            title="View Work"
                                                        >
                                                            <Eye size={18} />
                                                        </a>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSubmission(sub);
                                                                setGradeData({ grade: sub.grade || '', feedback: sub.feedback || '' });
                                                                setGradingModal(true);
                                                            }}
                                                            className="p-3 bg-[#E5E7EB] dark:bg-[#1A1F2E] rounded-2xl text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                                            title="Grade"
                                                        >
                                                            <GraduationCap size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest">No submissions yet</div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Grading Modal */}
                <AnimatePresence>
                    {gradingModal && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setGradingModal(false)}
                                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-md bg-[#E5E7EB] dark:bg-[#1A1F2E] rounded-[3rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-10">
                                    <h2 className="text-2xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter uppercase mb-6">Grade Submission</h2>
                                    <form onSubmit={handleGradeSubmission} className="space-y-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student</p>
                                            <p className="text-sm font-bold dark:text-white px-1">{selectedSubmission?.student?.user?.name}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade (Max: {selectedAssignment.points})</label>
                                            <input
                                                type="number"
                                                required
                                                max={selectedAssignment.points}
                                                value={gradeData.grade}
                                                onChange={e => setGradeData({ ...gradeData, grade: e.target.value })}
                                                className="w-full px-6 py-4 bg-[#F1F3F7] dark:bg-[#2D3548] border border-[#E2E5E9] dark:border-[#3D4556] rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Feedback</label>
                                            <textarea
                                                value={gradeData.feedback}
                                                onChange={e => setGradeData({ ...gradeData, feedback: e.target.value })}
                                                className="w-full px-6 py-4 bg-[#F1F3F7] dark:bg-[#2D3548] border border-[#E2E5E9] dark:border-[#3D4556] rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none dark:text-white min-h-[100px]"
                                                placeholder="Excellent work..."
                                            />
                                        </div>
                                        <button className="w-full py-5 bg-amber-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.25em] shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all">
                                            Submit Grade
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* View Assignment Details Modal */}
                <AnimatePresence>
                    {viewAssignmentModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setViewAssignmentModal(false)}
                                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-2xl bg-[#E5E7EB] dark:bg-[#1A1F2E] rounded-[3rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-10">
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-3xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter uppercase">Assignment Details</h2>
                                        <button onClick={() => setViewAssignmentModal(false)} className="p-3 bg-[#E5E7EB] dark:bg-[#242B3D] rounded-2xl text-[#64748B] dark:text-[#868D9D] hover:text-rose-500 transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</p>
                                            <p className="text-xl font-black text-[#0F1419] dark:text-[#E8EAED]">{selectedAssignment?.title}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</p>
                                            <p className="text-sm text-[#64748B] dark:text-[#868D9D] leading-relaxed whitespace-pre-wrap">{selectedAssignment?.description}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-[#F1F3F7] dark:bg-[#2D3548] rounded-2xl">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                                                <p className="text-sm font-bold text-[#0F1419] dark:text-[#E8EAED]">{new Date(selectedAssignment?.dueDate).toLocaleString()}</p>
                                            </div>
                                            <div className="p-4 bg-[#F1F3F7] dark:bg-[#2D3548] rounded-2xl">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Points</p>
                                                <p className="text-sm font-bold text-[#0F1419] dark:text-[#E8EAED]">{selectedAssignment?.points}</p>
                                            </div>
                                        </div>
                                        {selectedAssignment?.fileUrl && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attached Reference</p>
                                                <a
                                                    href={`http://localhost:5000${selectedAssignment.fileUrl}`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                                                >
                                                    <Download size={14} /> Download File
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </Layout>
    );
};

export default FacultyAssignments;
