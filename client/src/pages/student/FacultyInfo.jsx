import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    Github, Twitter, Youtube, Linkedin, ChevronLeft, ChevronRight,
    Search, Filter, Mail, Users, BookOpen, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const FacultyCarousel = ({ facultyList, onContact }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Reset index when list changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [facultyList]);

    if (!facultyList || facultyList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-[#E5E7EB] dark:bg-[#242B3D] p-6 rounded-full mb-4">
                    <Users size={48} className="text-[#64748B] dark:text-[#868D9D]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F1419] dark:text-[#E8EAED] mb-2">No Faculty Found</h3>
                <p className="text-[#64748B] dark:text-[#868D9D] max-w-md">
                    Try adjusting your search or filters.
                </p>
            </div>
        );
    }

    const handleNext = () =>
        setCurrentIndex((index) => (index + 1) % facultyList.length);
    const handlePrevious = () =>
        setCurrentIndex(
            (index) => (index - 1 + facultyList.length) % facultyList.length
        );

    const currentFaculty = facultyList[currentIndex];

    const socialIcons = [
        { icon: Github, url: currentFaculty.socialLinks?.github, label: "GitHub" },
        { icon: Linkedin, url: currentFaculty.socialLinks?.linkedin, label: "LinkedIn" },
        // Add others if your backend supports them
    ].filter(link => link.url);

    const imageUrl = currentFaculty.image && currentFaculty.image.startsWith('/uploads')
        ? `http://localhost:5000${currentFaculty.image}`
        : currentFaculty.image;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            {/* Desktop layout */}
            <div className='hidden md:flex relative items-center justify-center'>
                {/* Avatar */}
                <div className='w-[400px] h-[500px] lg:w-[470px] lg:h-[550px] rounded-[2.5rem] overflow-hidden bg-[#E5E7EB] dark:bg-[#242B3D] shadow-[0_0_80px_-20px_rgba(99,102,241,0.6)] dark:shadow-[0_0_100px_-20px_rgba(99,102,241,0.4)] flex-shrink-0 relative z-0'>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentFaculty._id}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className='w-full h-full'
                        >
                            <img
                                src={imageUrl}
                                alt={currentFaculty.name}
                                className='w-full h-full object-cover'
                                draggable={false}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Card */}
                <div className='bg-[#F3F4F6]/30 dark:bg-[#1A1F2E]/30 backdrop-blur-3xl border border-white/40 dark:border-[#E2E5E9]/20 dark:border-[#3D4556]/20 rounded-[2rem] shadow-[0_0_60px_-15px_rgba(99,102,241,0.5)] dark:shadow-[0_0_80px_-20px_rgba(99,102,241,0.3)] p-8 lg:p-10 -ml-24 z-10 max-w-xl flex-1 relative overflow-hidden'>
                    {/* Liquid Shine Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-20 pointer-events-none" />
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentFaculty._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <div className='mb-6'>
                                <p className='text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-2'>
                                    {currentFaculty.department}
                                </p>
                                <h2 className='text-3xl lg:text-4xl font-black text-[#0F1419] dark:text-[#E8EAED] mb-2 leading-tight'>
                                    {currentFaculty.name}
                                </h2>
                                <p className='text-md font-bold text-[#64748B] dark:text-[#868D9D]'>
                                    {currentFaculty.designation}
                                </p>
                            </div>

                            <p className='text-[#475569] dark:text-[#B8BDC6] text-base leading-relaxed mb-6 min-h-[80px]'>
                                {currentFaculty.bio || "No biography available."}
                            </p>

                            <div className="grid grid-cols-1 gap-3 mb-8">
                                <div className="flex items-center gap-3 text-sm text-[#64748B] dark:text-[#868D9D]">
                                    <Mail size={16} className="text-indigo-500" />
                                    <span>{currentFaculty.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[#64748B] dark:text-[#868D9D]">
                                    <BookOpen size={16} className="text-indigo-500" />
                                    <span>{currentFaculty.researchArea}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[#64748B] dark:text-[#868D9D]">
                                    <Award size={16} className="text-indigo-500" />
                                    <span>{currentFaculty.experience} Years Experience</span>
                                </div>
                            </div>

                            <div className='flex items-center gap-4'>
                                <button
                                    onClick={() => onContact(currentFaculty)}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                                >
                                    <Mail size={18} />
                                    Message Faculty
                                </button>

                                {socialIcons.map(({ icon: IconComponent, url, label }) => (
                                    <a
                                        key={label}
                                        href={url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='w-12 h-12 bg-[#E5E7EB] dark:bg-[#242B3D] rounded-xl flex items-center justify-center transition-all hover:bg-slate-200 hover:bg-[#F1F3F7] dark:bg-[#2D3548] text-[#475569] dark:text-[#B8BDC6]'
                                        aria-label={label}
                                    >
                                        <IconComponent size={20} />
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile layout */}
            <div className='md:hidden max-w-sm mx-auto bg-transparent relative'>
                <div className='w-full aspect-[4/5] bg-[#E5E7EB] dark:bg-[#242B3D] rounded-3xl overflow-hidden mb-[-40px] relative z-0 shadow-[0_0_60px_-15px_rgba(99,102,241,0.6)]'>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentFaculty._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className='w-full h-full'
                        >
                            <img
                                src={imageUrl}
                                alt={currentFaculty.name}
                                className='w-full h-full object-cover'
                                draggable={false}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className='bg-[#F3F4F6]/30 dark:bg-[#1A1F2E]/30 backdrop-blur-3xl border border-white/40 dark:border-[#E2E5E9]/20 dark:border-[#3D4556]/20 rounded-[2rem] p-6 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] relative z-10 mx-2 overflow-hidden'>
                    {/* Liquid Shine Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-20 pointer-events-none" />
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentFaculty._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className='text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-1'>
                                {currentFaculty.department}
                            </p>
                            <h2 className='text-2xl font-black text-[#0F1419] dark:text-[#E8EAED] mb-1'>
                                {currentFaculty.name}
                            </h2>
                            <p className='text-sm font-bold text-[#64748B] dark:text-[#868D9D] mb-4'>
                                {currentFaculty.designation}
                            </p>
                            <p className='text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-6 line-clamp-4'>
                                {currentFaculty.bio || "No biography available."}
                            </p>

                            <div className='flex gap-2'>
                                <button
                                    onClick={() => onContact(currentFaculty)}
                                    className="flex-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-bold py-2.5 rounded-xl transition-colors text-sm"
                                >
                                    Message
                                </button>
                                {socialIcons.map(({ icon: IconComponent, url, label }) => (
                                    <a
                                        key={label}
                                        href={url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='w-10 h-10 bg-[#E5E7EB] dark:bg-[#242B3D] rounded-xl flex items-center justify-center transition-colors text-[#64748B] dark:text-[#868D9D]'
                                    >
                                        <IconComponent size={16} />
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation */}
            <div className='flex justify-center items-center gap-6 mt-8'>
                <button
                    onClick={handlePrevious}
                    className='w-12 h-12 rounded-full bg-[#E5E7EB] dark:bg-[#242B3D] border border-[#E2E5E9] dark:border-[#3D4556] shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 text-[#475569] dark:text-[#B8BDC6]'
                >
                    <ChevronLeft size={24} />
                </button>

                <div className='flex gap-2 overflow-x-auto max-w-[200px] px-2'>
                    {facultyList.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all duration-300 flex-shrink-0",
                                index === currentIndex
                                    ? "bg-indigo-600 w-8"
                                    : "bg-[#F1F3F7] dark:bg-[#2D3548] hover:bg-indigo-400"
                            )}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className='w-12 h-12 rounded-full bg-[#E5E7EB] dark:bg-[#242B3D] border border-[#E2E5E9] dark:border-[#3D4556] shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 text-[#475569] dark:text-[#B8BDC6]'
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}

const FacultyInfo = () => {
    const navigate = useNavigate();
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('All');

    const handleContact = (faculty) => {
        navigate('/student/chat', {
            state: {
                contactUser: {
                    _id: faculty._id || faculty.id || faculty.userId,
                    name: faculty.name,
                    role: 'faculty',
                    email: faculty.email
                }
            }
        });
    };

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
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="student">
            <div className="space-y-4 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-2">
                    <div>
                        <h2 className="text-2xl font-black text-[#0F1419] dark:text-[#E8EAED] tracking-tight">Meet Our Faculty</h2>
                        <p className="text-[#64748B] dark:text-[#868D9D] text-sm">Discover mentors who inspire excellence.</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#868D9D] group-focus-within:text-indigo-600" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 bg-[#E5E7EB] dark:bg-[#242B3D] border border-[#E2E5E9] dark:border-[#3D4556] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm outline-none w-40 sm:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#868D9D]" size={16} />
                            <select
                                className="pl-9 pr-8 py-2 bg-[#E5E7EB] dark:bg-[#242B3D] border border-[#E2E5E9] dark:border-[#3D4556] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm outline-none appearance-none cursor-pointer"
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

                <FacultyCarousel facultyList={filteredFaculty} onContact={handleContact} />
            </div>
        </Layout>
    );
};

export default FacultyInfo;
