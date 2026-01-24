import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    FileText,
    Upload,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    Eye,
    Sparkles,
    Search,
    Filter,
    X,
    MessageSquare,
    Trophy
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
            "bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500",
            className
        )}
    >
        {children}
    </motion.div>
);

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionModal, setSubmissionModal] = useState(false);
    const [viewAssignmentModal, setViewAssignmentModal] = useState(false);
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/assignments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Fetch detailed status for each assignment (to see if submitted)
            const assignmentsWithStatus = await Promise.all(res.data.data.map(async (a) => {
                const detailRes = await axios.get(`http://localhost:5000/api/assignments/${a._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return { ...a, submission: detailRes.data.submission };
            }));
            setAssignments(assignmentsWithStatus);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching assignments:", error);
            toast.error("Failed to load assignments");
            setLoading(false);
        }
    };

    const handleSubmitAssignment = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a file to upload");
            return;
        }

        setSubmitting(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/assignments/${selectedAssignment._id}/submit`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Assignment submitted successfully!");
            setSubmissionModal(false);
            setFile(null);
            fetchAssignments();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit assignment");
        } finally {
            setSubmitting(false);
        }
    };

    const pendingAssignments = assignments.filter(a => !a.submission);
    const completedAssignments = assignments.filter(a => a.submission);

    if (loading) {
        return (
            <Layout role="student">
                <div className="flex justify-center items-center h-screen">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-teal-600/20 rounded-full animate-ping" />
                        <div className="absolute inset-0 w-20 h-20 border-t-4 border-teal-600 rounded-full animate-spin" />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="student">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-2 bg-teal-500/10 dark:bg-teal-400/10 px-4 py-1.5 rounded-full border border-teal-200/50 dark:border-teal-800/50 w-fit"
                        >
                            <Sparkles size={14} className="text-teal-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Student Portal</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                            Your <br />
                            <span className="text-teal-600 dark:text-teal-400">Assignments</span>
                        </h1>
                    </div>

                    <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={cn(
                                "px-8 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'pending' ? "bg-white dark:bg-slate-800 text-teal-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Pending ({pendingAssignments.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={cn(
                                "px-8 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'completed' ? "bg-white dark:bg-slate-800 text-teal-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Completed ({completedAssignments.length})
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(activeTab === 'pending' ? pendingAssignments : completedAssignments).length > 0 ? (
                        (activeTab === 'pending' ? pendingAssignments : completedAssignments).map((assignment, idx) => (
                            <GlassCard key={assignment._id} className="p-8 flex flex-col justify-between" delay={idx * 0.1}>
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-2">
                                            <div className={cn(
                                                "p-4 rounded-2xl bg-opacity-10",
                                                activeTab === 'pending' ? "bg-teal-500 text-teal-600" : "bg-emerald-500 text-emerald-600"
                                            )}>
                                                <FileText size={24} />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedAssignment(assignment);
                                                    setViewAssignmentModal(true);
                                                }}
                                                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-teal-600 transition-all"
                                                title="View Instructions"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <div className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                {assignment.course.code}
                                            </div>
                                            {assignment.submission?.status === 'graded' && (
                                                <div className="mt-2 flex items-center justify-end gap-1 text-emerald-500">
                                                    <Trophy size={14} />
                                                    <span className="text-[10px] font-black uppercase">{assignment.submission.grade}/{assignment.points}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{assignment.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">{assignment.description}</p>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Calendar size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                {activeTab === 'pending' ? `Due: ${new Date(assignment.dueDate).toLocaleDateString()}` : `Submitted: ${new Date(assignment.submission.submittedAt).toLocaleDateString()}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Clock size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Points: {assignment.points}</span>
                                        </div>
                                    </div>
                                </div>

                                {activeTab === 'pending' ? (
                                    <button
                                        onClick={() => {
                                            setSelectedAssignment(assignment);
                                            setSubmissionModal(true);
                                        }}
                                        className="w-full py-4 bg-teal-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Upload size={16} /> Submit Work
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <a
                                            href={`http://localhost:5000${assignment.submission.fileUrl}`}
                                            target="_blank"
                                            className="w-full py-4 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            <Eye size={16} /> View Submission
                                        </a>
                                        {assignment.submission.feedback && (
                                            <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                    <MessageSquare size={10} /> Faculty Feedback
                                                </p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{assignment.submission.feedback}"</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </GlassCard>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-black uppercase tracking-[0.2em]">No {activeTab} assignments</p>
                        </div>
                    )}
                </div>

                {/* Submission Modal */}
                <AnimatePresence>
                    {submissionModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSubmissionModal(false)}
                                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-10">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">Submit Assignment</h2>
                                    <p className="text-xs text-slate-400 font-bold mb-8 uppercase tracking-widest">{selectedAssignment?.title}</p>

                                    <form onSubmit={handleSubmitAssignment} className="space-y-8">
                                        <div
                                            className={cn(
                                                "relative border-2 border-dashed rounded-[2rem] p-10 text-center transition-all",
                                                file ? "border-teal-500 bg-teal-500/5" : "border-slate-200 dark:border-slate-800 hover:border-teal-500/50"
                                            )}
                                        >
                                            <input
                                                type="file"
                                                onChange={(e) => setFile(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex flex-col items-center gap-3">
                                                <div className={cn(
                                                    "p-5 rounded-2xl bg-opacity-10 mb-2",
                                                    file ? "bg-teal-500 text-teal-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                                )}>
                                                    {file ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                                                </div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                                    {file ? file.name : "Choose file to upload"}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOC, ZIP up to 10MB"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setSubmissionModal(false)}
                                                className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-3xl"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting || !file}
                                                className="flex-[2] py-5 bg-teal-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.25em] shadow-xl shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                            >
                                                {submitting ? "Uploading..." : "Confirm & Submit"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* View Assignment Details Modal */}
                <AnimatePresence>
                    {viewAssignmentModal && (
                        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
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
                                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-10">
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Assignment Instructions</h2>
                                        <button onClick={() => setViewAssignmentModal(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-rose-500 transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</p>
                                            <p className="text-xl font-black text-slate-900 dark:text-white">{selectedAssignment?.title}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{selectedAssignment?.description}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(selectedAssignment?.dueDate).toLocaleString()}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Points</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedAssignment?.points}</p>
                                            </div>
                                        </div>
                                        {selectedAssignment?.fileUrl && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attached Reference</p>
                                                <a
                                                    href={`http://localhost:5000${selectedAssignment.fileUrl}`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600/10 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all"
                                                >
                                                    <Download size={14} /> Download Instructions
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-10">
                                        <button
                                            onClick={() => {
                                                setViewAssignmentModal(false);
                                                if (!selectedAssignment.submission) setSubmissionModal(true);
                                            }}
                                            className="w-full py-5 bg-teal-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.25em] shadow-xl shadow-teal-500/20 active:scale-[0.98] transition-all"
                                        >
                                            {selectedAssignment?.submission ? "Work Already Submitted" : "Open Submission Portal"}
                                        </button>
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

export default StudentAssignments;
