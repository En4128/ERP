import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    TrendingUp,
    AlertCircle,
    Search,
    Edit,
    Save,
    ArrowLeft,
    CheckCircle,
    User,
    BookOpen,
    Filter,
    Activity,
    ChevronRight,
    Award,
    Sparkles,
    Zap,
    ArrowRight,
    Trophy,
    GraduationCap,
    CheckCircle2,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

// --- Premium UI Components ---

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

const FacultyMarks = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marksMode, setMarksMode] = useState(false);
    const [examType, setExamType] = useState('CIA-1');
    const [marksData, setMarksData] = useState({});
    const [maxMarks, setMaxMarks] = useState(50);
    const [saving, setSaving] = useState(false);

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

    const fetchExistingMarks = async (courseId, type) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/faculty/marks?courseId=${courseId}&examType=${type}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const existingData = {};
            // Initialize with empty first
            students.forEach(s => {
                existingData[s._id] = '';
            });
            // Overwrite with fetched data
            res.data.forEach(m => {
                existingData[m.student] = m.marksObtained.toString();
            });
            setMarksData(existingData);
        } catch (error) {
            console.error("Error fetching existing marks:", error);
        }
    };

    const handleSelectCourse = async (course) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/faculty/courses/${course._id}/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedCourse(course);
            const studentList = res.data;
            setStudents(studentList);

            // Fetch existing marks for the current exam type
            const marksRes = await axios.get(`http://localhost:5000/api/faculty/marks?courseId=${course._id}&examType=${examType}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const initialData = {};
            studentList.forEach(s => {
                initialData[s._id] = '';
            });
            marksRes.data.forEach(m => {
                initialData[m.student] = m.marksObtained.toString();
            });
            setMarksData(initialData);

            setMarksMode(true);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching students:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCourse && marksMode) {
            fetchExistingMarks(selectedCourse._id, examType);
        }
    }, [examType]);

    const handleMarkChange = (studentId, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleClearMarks = async () => {
        if (!window.confirm('Are you sure you want to clear all marks for this assessment? This action cannot be undone.')) return;

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/faculty/marks?courseId=${selectedCourse._id}&examType=${examType}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const resetData = {};
            students.forEach(s => {
                resetData[s._id] = '';
            });
            setMarksData(resetData);
            toast.success('Academic records cleared successfully.');
        } catch (error) {
            console.error("Error clearing marks:", error);
            toast.error('Failed to clear academic records.');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitMarks = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const promises = Object.entries(marksData).map(([studentId, marks]) => {
                if (marks === '') return Promise.resolve();
                return axios.post('http://localhost:5000/api/faculty/marks', {
                    courseId: selectedCourse._id,
                    studentId,
                    examType,
                    marksObtained: Number(marks),
                    maxMarks: Number(maxMarks)
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            });

            await Promise.all(promises);
            toast.success('Academic performance synchronized successfully!');
            setMarksMode(false);
        } catch (error) {
            console.error("Error saving marks:", error);
            toast.error('Failed to save academic records.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout role="faculty">
                <div className="flex justify-center items-center h-screen">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-[#2563EB]/20 dark:border-[#60A5FA]/20 rounded-full animate-ping" />
                        <div className="absolute inset-0 w-20 h-20 border-t-4 border-[#2563EB] dark:border-[#60A5FA] rounded-full animate-spin" />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="faculty">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up">

                {courses.length === 0 ? (
                    <GlassCard className="p-20 flex flex-col items-center justify-center text-center min-h-[600px] border-dashed">
                        <div className="w-24 h-24 rounded-[3rem] bg-blue-500/10 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                            <Sparkles size={40} />
                        </div>
                        <h2 className="text-4xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter mb-4">Foundation Required</h2>
                        <p className="text-[#64748B] dark:text-[#868D9D] max-w-md mx-auto mb-10 font-bold leading-relaxed">
                            To manage student grades and academic performance, you first need to join the course units you are instructing.
                        </p>
                        <button
                            onClick={() => navigate('/faculty/courses')}
                            className="px-10 py-5 bg-[#2563EB] dark:bg-[#60A5FA] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <Trophy size={16} /> Discover Courses
                        </button>
                    </GlassCard>
                ) : !marksMode ? (
                    <>
                        {/* Course Selection Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="flex items-center gap-2 bg-blue-500/10 dark:bg-blue-400/10 px-4 py-1.5 rounded-full border border-blue-200/50 dark:border-blue-800/50 w-fit"
                                >
                                    <Sparkles size={14} className="text-[#2563EB] dark:text-[#60A5FA]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB] dark:text-[#60A5FA] dark:text-blue-400">Academic Records</span>
                                </motion.div>
                                <h1 className="text-4xl md:text-6xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter leading-[0.9]">
                                    Performance <br />
                                    <span className="text-[#2563EB] dark:text-[#60A5FA] dark:text-blue-400">Management</span>
                                </h1>
                            </div>
                        </div>

                        {/* Course Selection Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map((course, idx) => (
                                <GlassCard
                                    key={course._id}
                                    className="p-1 group cursor-pointer"
                                    delay={idx * 0.1}
                                >
                                    <div
                                        onClick={() => handleSelectCourse(course)}
                                        className="p-8 rounded-[2rem] bg-[#E5E7EB] dark:bg-[#1A1F2E] border border-transparent hover:border-[#2563EB]/20 dark:border-[#60A5FA]/20 transition-all h-full flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="p-4 rounded-2xl bg-blue-500/10 text-[#2563EB] dark:text-[#60A5FA] border border-blue-500/20 group-hover:bg-[#2563EB] dark:bg-[#60A5FA] group-hover:text-white transition-all shadow-sm">
                                                    <Trophy size={28} />
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-[#F1F3F7] dark:bg-[#2D3548] flex items-center justify-center text-slate-300 group-hover:text-[#2563EB] dark:text-[#60A5FA] transition-colors">
                                                    <ArrowRight size={18} />
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-black text-[#2563EB] dark:text-[#60A5FA] uppercase tracking-widest mb-1">{course.code}</p>
                                            <h3 className="text-2xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tight leading-tight mb-4">{course.name}</h3>
                                        </div>
                                        <div className="pt-6 border-t border-[#E2E5E9] dark:border-[#3D4556] flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Users size={14} className="text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Roster</span>
                                            </div>
                                            <span className="text-[10px] font-black text-[#0F1419] dark:text-[#E8EAED] uppercase tracking-widest bg-[#E5E7EB] dark:bg-[#242B3D] px-3 py-1 rounded-full">Enter Records</span>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </>
                ) : selectedCourse ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* Entry Mode Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex items-start gap-6">
                                <button
                                    onClick={() => setMarksMode(false)}
                                    className="p-4 rounded-2xl bg-[#E5E7EB] dark:bg-[#1A1F2E] border border-[#E2E5E9] dark:border-[#3D4556] text-slate-400 hover:text-[#2563EB] dark:text-[#60A5FA] hover:border-[#2563EB] dark:border-[#60A5FA] transition-all shadow-sm"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap size={16} className="text-[#2563EB] dark:text-[#60A5FA]" />
                                        <span className="text-[10px] font-black text-[#2563EB] dark:text-[#60A5FA] uppercase tracking-widest">{selectedCourse?.code} UNIT</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter leading-none">{selectedCourse?.name}</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Biometric Grade Assessment</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 bg-[#E5E7EB] dark:bg-[#1A1F2E] p-4 rounded-[2.5rem] border border-[#E2E5E9]/50 dark:border-[#3D4556]/50 shadow-sm">
                                <div className="relative group min-w-[180px]">
                                    <p className="absolute -top-10 left-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Assessment Type</p>
                                    <select
                                        value={examType}
                                        onChange={(e) => setExamType(e.target.value)}
                                        className="w-full pl-6 pr-10 py-3 bg-[#F1F3F7] dark:bg-[#2D3548] border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#0F1419] dark:text-[#E8EAED] appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="CIA-1">CIA-I Midterm</option>
                                        <option value="CIA-2">CIA-II Progress</option>
                                        <option value="Assignment">Task Execution</option>
                                        <option value="Attendance-Marks">Engagement Metric</option>
                                        <option value="Semester-Final">Terminal Assessment</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronRight size={14} className="rotate-90" />
                                    </div>
                                </div>

                                <div className="relative group w-32">
                                    <p className="absolute -top-10 left-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Scale (Max)</p>
                                    <input
                                        type="number"
                                        value={maxMarks}
                                        onChange={(e) => setMaxMarks(e.target.value)}
                                        className="w-full px-6 py-3 bg-[#F1F3F7] dark:bg-[#2D3548] border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#0F1419] dark:text-[#E8EAED] text-center focus:ring-2 focus:ring-blue-500 shadow-inner"
                                    />
                                </div>

                                <button
                                    onClick={handleClearMarks}
                                    disabled={saving}
                                    className="px-6 py-4 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 border border-rose-500/20"
                                >
                                    <AlertCircle size={14} /> Clear Records
                                </button>

                                <button
                                    onClick={handleSubmitMarks}
                                    disabled={saving}
                                    className="px-8 py-4 bg-[#2563EB] dark:bg-[#60A5FA] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {saving ? 'Syncing...' : <><Save size={14} /> Commit Records</>}
                                </button>
                            </div>
                        </div>

                        {/* Spreadsheet Grid */}
                        <GlassCard className="p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-[#F9FAFB] dark:bg-slate-900/50 text-[10px] font-black text-slate-400 dark:text-[#64748B] dark:text-[#868D9D] uppercase tracking-[0.3em] border-b border-[#E2E5E9] dark:border-[#3D4556]">
                                            <th className="px-10 py-6">Identity Parameter</th>
                                            <th className="px-10 py-6 text-center">Efficiency Score</th>
                                            <th className="px-10 py-6 text-center">Projected Grade</th>
                                            <th className="px-10 py-6 text-right">Verification Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-transparent divide-y divide-slate-100 dark:divide-slate-800/50">
                                        {students.map((student, idx) => {
                                            const score = Number(marksData[student._id]);
                                            const percent = (score / maxMarks) * 100;
                                            let grade = 'F';
                                            let color = 'rose';
                                            if (percent >= 90) { grade = 'O'; color = 'indigo'; }
                                            else if (percent >= 80) { grade = 'A'; color = 'indigo'; }
                                            else if (percent >= 70) { grade = 'B'; color = 'emerald'; }
                                            else if (percent >= 60) { grade = 'C'; color = 'amber'; }
                                            else if (percent >= 50) { grade = 'D'; color = 'amber'; }

                                            return (
                                                <motion.tr
                                                    key={student._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: idx * 0.02 }}
                                                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} dark:bg-transparent hover:bg-blue-50/50 hover:bg-[#F1F3F7] dark:bg-[#2D3548] transition-colors group`}
                                                >
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-[#F1F3F7] dark:bg-[#2D3548] flex items-center justify-center text-[10px] font-black text-[#2563EB] dark:text-[#60A5FA] border border-[#E2E5E9] dark:border-[#3D4556]">
                                                                {student.user.name.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-[#0F1419] dark:text-[#E8EAED] text-sm tracking-tight">{student.user.name}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.admissionNumber}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="flex justify-center items-center gap-3">
                                                            <input
                                                                type="number"
                                                                value={marksData[student._id]}
                                                                onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                                                className="w-24 text-center py-3 bg-[#E5E7EB] dark:bg-[#242B3D] border-none rounded-xl text-xs font-black text-[#0F1419] dark:text-[#E8EAED] focus:ring-2 focus:ring-blue-500 shadow-inner"
                                                                placeholder="00"
                                                            />
                                                            <span className="text-[10px] font-black text-slate-300">/ {maxMarks}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-center">
                                                        <span className={cn(
                                                            "px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                                                            {
                                                                "bg-blue-500/10 text-[#2563EB] dark:text-[#60A5FA] border-[#2563EB]/20 dark:border-[#60A5FA]/20": color === 'indigo',
                                                                "bg-emerald-500/10 text-emerald-600 border-emerald-500/20": color === 'emerald',
                                                                "bg-amber-500/10 text-amber-600 border-amber-500/20": color === 'amber',
                                                                "bg-rose-500/10 text-rose-600 border-rose-500/20": color === 'rose',
                                                                "text-slate-300 border-slate-100": marksData[student._id] === ''
                                                            }
                                                        )}>
                                                            {marksData[student._id] !== '' ? `Grade ${grade}` : 'Unranked'}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <div className="flex justify-end">
                                                            {marksData[student._id] !== '' ? (
                                                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                                                    <CheckCircle2 size={16} />
                                                                </div>
                                                            ) : (
                                                                <div className="p-2 rounded-xl bg-[#E5E7EB] dark:bg-[#242B3D] text-slate-300">
                                                                    <AlertCircle size={16} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </motion.div>
                ) : null}
            </div>
        </Layout>
    );
};

export default FacultyMarks;
