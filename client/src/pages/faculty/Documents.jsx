import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    FileText,
    Upload,
    Folder,
    MoreVertical,
    Search,
    Plus,
    BookOpen,
    ChevronRight,
    Download,
    Trash2,
    Share2,
    Filter,
    Sparkles,
    Zap,
    CloudUpload,
    FolderPlus,
    ArrowRight,
    SearchCode,
    X,
    FolderUp,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

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

const FacultyDocuments = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    const mockDocs = [
        { id: 1, name: 'Syllabus_2024.pdf', type: 'PDF', size: '2.4 MB', date: '2023-11-20' },
        { id: 2, name: 'Lecture_Notes_Unit1.docx', type: 'DOCX', size: '1.1 MB', date: '2023-11-22' },
        { id: 3, name: 'Reference_Book_Link.url', type: 'Link', size: '--', date: '2023-11-25' },
    ];

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
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-400/10 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 w-fit"
                        >
                            <Sparkles size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Library Artifacts</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter leading-[0.9]">
                            Curriculum <br />
                            <span className="text-indigo-400">Resources</span>
                        </h1>
                    </div>

                    <button
                        className="px-8 py-4 bg-[#2563EB] dark:bg-[#60A5FA] text-white dark:text-[#0F1419] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <FolderPlus size={16} /> Create Sub-Vault
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Navigation Rail */}
                    <div className="lg:col-span-1 space-y-6">
                        <GlassCard className="p-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 px-2 border-b border-[#E2E5E9] dark:border-[#3D4556] pb-4 flex items-center gap-2">
                                <Folder size={14} className="text-indigo-500" /> Subject Vaults
                            </h3>
                            <div className="space-y-2">
                                {courses.map((course) => (
                                    <button
                                        key={course._id}
                                        onClick={() => setSelectedCourse(course)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all group",
                                            selectedCourse?._id === course._id
                                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                                                : "text-[#64748B] dark:text-[#868D9D] hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-4 h-4 rounded-full border-2 transition-all",
                                                selectedCourse?._id === course._id ? "bg-white border-white scale-110" : "border-[#E2E5E9] dark:border-[#3D4556]"
                                            )} />
                                            <span className="text-xs font-black uppercase tracking-widest truncate max-w-[120px]">{course.code}</span>
                                        </div>
                                        <ChevronRight size={14} className={cn("transition-transform", selectedCourse?._id === course._id ? "rotate-90" : "opacity-0 group-hover:opacity-100")} />
                                    </button>
                                ))}
                            </div>
                        </GlassCard>

                        <div className="relative group overflow-hidden bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-900/20">
                            <div className="absolute top-[-20%] left-[-20%] w-[150px] h-[150px] bg-white/10 rounded-full blur-[60px]" />
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="p-5 rounded-[2rem] bg-white/20 backdrop-blur-md mb-6 border border-white/20">
                                    <CloudUpload size={40} className="text-amber-300" />
                                </div>
                                <h4 className="text-2xl font-black tracking-tight mb-2">Deploy Files</h4>
                                <p className="text-[10px] font-bold opacity-80 leading-relaxed uppercase tracking-widest mb-8 px-4">Instant synchronization with cohort learning paths.</p>
                                <button className="w-full py-4 bg-white text-indigo-600 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">
                                    Open Uplink
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Matrix */}
                    <div className="lg:col-span-3 space-y-6">
                        <GlassCard className="p-10 min-h-[600px]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-[#E2E5E9] dark:border-[#3D4556] pb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tighter leading-none mb-1.5 flex items-center gap-3">
                                        <BookOpen className="text-indigo-600" size={32} />
                                        {selectedCourse ? selectedCourse.name : "Universal Vault"}
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedCourse ? `Resource matrix for ${selectedCourse.code}` : "Cross-curricular administrative archives"}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative group w-full md:w-64">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            placeholder="Audit archives..."
                                            className="w-full pl-14 pr-6 py-4 bg-[#F1F3F7] dark:bg-[#2D3548] border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white shadow-inner"
                                        />
                                    </div>
                                    <button className="p-4 bg-[#F1F3F7] dark:bg-[#2D3548] rounded-2xl text-slate-400 hover:text-indigo-500 transition-colors border border-[#E2E5E9] dark:border-[#3D4556] shadow-sm">
                                        <Filter size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {mockDocs.map((doc, idx) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group p-8 rounded-[2rem] bg-[#E5E7EB] dark:bg-[#1A1F2E] border border-[#E2E5E9] dark:border-[#3D4556] hover:border-indigo-500/50 hover:shadow-2xl transition-all relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between relative z-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 text-indigo-600 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white shadow-sm">
                                                    <FileText size={28} />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-[#0F1419] dark:text-[#E8EAED] leading-none tracking-tight truncate max-w-[150px] mb-2">{doc.name}</h4>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.type} • {doc.size}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                                <button className="p-3 bg-[#F1F3F7] dark:bg-[#2D3548] rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all" title="Synchronize">
                                                    <Download size={18} />
                                                </button>
                                                <button className="p-3 bg-[#F1F3F7] dark:bg-[#2D3548] rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-all" title="Purge">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-[#E2E5E9] dark:border-[#3D4556] flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Calendar size={12} className="text-indigo-500" /> Managed: {doc.date}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all">
                                                Access <ArrowRight size={14} />
                                            </div>
                                        </div>

                                        {/* Subtle background element */}
                                        <div className="absolute bottom-[-20px] right-[-20px] opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                            <FileText size={120} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {!selectedCourse && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-32 h-32 rounded-[3.5rem] bg-[#F1F3F7] dark:bg-[#2D3548] flex items-center justify-center text-slate-200 dark:text-slate-700 mb-10 border border-[#E2E5E9] dark:border-[#3D4556] border-dashed">
                                        <FolderUp size={60} />
                                    </div>
                                    <h4 className="text-3xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-tight">Access Restricted</h4>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-600 mt-3 leading-relaxed max-w-[300px]">Select a curriculum vault from the navigation rail to visualize localized resource matrices.</p>
                                </div>
                            )}
                        </GlassCard>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default FacultyDocuments;
