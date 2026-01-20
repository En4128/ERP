import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Mail, Phone, BookOpen, Search, Filter, Users, Award, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const FacultyInfoCard = ({ faculty }) => {
    // Generate a consistent HSL color based on department
    const getThemeColor = (dept) => {
        const hash = dept.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = hash % 360;
        return `${hue} 60% 35%`; // Vibrant but dark enough for white text
    };

    const themeColor = getThemeColor(faculty.department);

    return (
        <div
            style={{ "--theme-color": themeColor }}
            className="group w-full h-[480px] perspective-1000"
        >
            <div
                className="relative block w-full h-full rounded-3xl overflow-hidden shadow-xl 
                           transition-all duration-500 ease-out 
                           group-hover:scale-[1.02] group-hover:shadow-[0_0_60px_-15px_hsl(var(--theme-color)/0.6)]
                           border border-slate-200 dark:border-slate-800"
                style={{
                    boxShadow: `0 20px 40px -20px hsl(var(--theme-color) / 0.4)`
                }}
            >
                {/* Background Image with Parallax Zoom */}
                <div
                    className="absolute inset-0 bg-cover bg-center 
                               transition-transform duration-700 ease-out group-hover:scale-110"
                    style={{ backgroundImage: `url(${faculty.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887'})` }}
                />

                {/* Themed Gradient Overlay */}
                <div
                    className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-90"
                    style={{
                        background: `linear-gradient(to top, 
                            hsl(var(--theme-color) / 0.95) 0%, 
                            hsl(var(--theme-color) / 0.8) 35%, 
                            hsl(var(--theme-color) / 0.1) 100%)`,
                    }}
                />

                {/* Availability Badge */}
                <div className="absolute top-4 right-4 z-20">
                    <div className={cn(
                        "px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-2 shadow-lg",
                        faculty.availability === 'Available' ? "bg-emerald-500/20 text-emerald-100" : "bg-rose-500/20 text-rose-100"
                    )}>
                        <span className={cn(
                            "w-2 h-2 rounded-full",
                            faculty.availability === 'Available' ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{faculty.availability}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="relative flex flex-col justify-end h-full p-8 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-2">
                            {faculty.department}
                        </p>
                        <h3 className="text-3xl font-black tracking-tight leading-tight">
                            {faculty.name}
                        </h3>
                        <p className="text-sm font-bold text-white/90 italic flex items-center gap-2">
                            {faculty.designation}
                        </p>
                    </motion.div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {faculty.subjects.slice(0, 3).map((sub, i) => (
                            <span key={i} className="text-[10px] bg-white/10 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-md font-bold text-white/90">
                                {sub}
                            </span>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center justify-between bg-white text-slate-900 rounded-2xl px-5 py-4 transition-all duration-300 transform group-hover:-translate-y-1 shadow-lg cursor-pointer">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Contact Faculty</span>
                            <span className="text-sm font-black truncate max-w-[150px]">{faculty.email}</span>
                        </div>
                        <div className="p-2 bg-indigo-600 rounded-xl text-white group-hover:rotate-12 transition-transform shadow-indigo-500/30 shadow-lg">
                            <Mail className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FacultyInfo = () => {
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('All');

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/student/faculty', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFacultyList(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching faculty:", error);
            setLoading(false);
        }
    };

    const filteredFaculty = facultyList.filter(faculty => {
        const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faculty.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDept = filterDept === 'All' || faculty.department === filterDept;
        return matchesSearch && matchesDept;
    });

    const departments = ['All', ...new Set(facultyList.map(f => f.department))];

    if (loading) {
        return (
            <Layout role="student">
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="student">
            <div className="animate-fade-in-up space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div>
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">Faculty Directory</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Connect with your professors and mentors.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-700 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search faculty or subject..."
                                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-indigo-500 transition-all w-full sm:w-64 text-sm dark:text-white placeholder-gray-400 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative group">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-700 transition-colors" size={18} />
                            <select
                                className="pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer text-sm dark:text-white outline-none font-medium text-slate-700"
                                value={filterDept}
                                onChange={(e) => setFilterDept(e.target.value)}
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Faculty Grid */}
                {filteredFaculty.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-8">
                        {filteredFaculty.map(faculty => (
                            <FacultyInfoCard key={faculty.id} faculty={faculty} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                            <Users size={48} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Faculty Found</h3>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md">
                            We couldn't find any faculty members matching "{searchTerm}". Try adjusting your search or filters.
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default FacultyInfo;
