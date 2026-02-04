import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    BookOpen,
    User,
    Users,
    MapPin,
    Mail,
    Phone,
    Calendar,
    GraduationCap,
    Github,
    Linkedin,
    Globe
} from 'lucide-react';
import { cn } from '../lib/utils';

const StudentProfileModal = ({ isOpen, onClose, student, loading }) => {
    const [activeTab, setActiveTab] = useState('general');

    if (!isOpen) return null;

    const tabs = [
        { id: 'general', label: 'General', icon: BookOpen },
        { id: 'personal', label: 'Personal', icon: User },
        { id: 'guardian', label: 'Guardian', icon: Users },
        { id: 'address', label: 'Address', icon: MapPin },
        { id: 'social', label: 'Social', icon: Users },
    ];

    const getProfileImage = () => {
        if (student?.user?.profileImage) {
            return `http://localhost:5000${student.user.profileImage}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.user?.name || 'Student')}&background=random`;
    };

    const socialLinks = student?.user?.socialLinks || {};

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto relative">

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-20"
                            >
                                <X size={24} />
                            </button>

                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : student ? (
                                <div className="flex-1 overflow-y-auto no-scrollbar">
                                    {/* Header Section */}
                                    <div className="relative">
                                        <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-600">
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                                        </div>
                                        <div className="px-8 md:px-12 pb-8 -mt-20 flex flex-col md:flex-row items-end gap-8">
                                            <div className="relative">
                                                <div className="w-40 h-40 rounded-[2rem] border-4 border-white dark:border-slate-900 bg-slate-100 shadow-xl overflow-hidden">
                                                    <img
                                                        src={getProfileImage()}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 mb-2">
                                                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{student.user.name}</h2>
                                                <div className="flex flex-wrap gap-3 mt-4">
                                                    <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                                                        {student.department}
                                                    </span>
                                                    <span className="px-4 py-1.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-teal-100 dark:border-teal-500/20">
                                                        Semester {student.sem}
                                                    </span>
                                                    <span className="px-4 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-amber-100 dark:border-amber-500/20">
                                                        {student.admissionNumber}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="px-8 md:px-12 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
                                        <div className="flex gap-8">
                                            {tabs.map((tab) => {
                                                const Icon = tab.icon;
                                                const isActive = activeTab === tab.id;
                                                return (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id)}
                                                        className={cn(
                                                            "pb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all relative",
                                                            isActive
                                                                ? "text-indigo-600 dark:text-indigo-400"
                                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                        )}
                                                    >
                                                        <Icon size={16} />
                                                        {tab.label}
                                                        {isActive && (
                                                            <motion.div
                                                                layoutId="activeModalTab"
                                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                                                            />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 md:p-12">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeTab}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                            >
                                                {/* General Information */}
                                                {activeTab === 'general' && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <DetailItem label="Admission Number" value={student.admissionNumber} />
                                                        <DetailItem label="Department" value={student.department} />
                                                        <DetailItem label="Batch" value={student.batch || 'N/A'} />
                                                        <DetailItem label="Current Semester" value={`Semester ${student.sem}`} />
                                                        <DetailItem label="Official Email" value={student.user.email} icon={Mail} className="md:col-span-2" />
                                                    </div>
                                                )}

                                                {/* Personal Details */}
                                                {activeTab === 'personal' && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <DetailItem label="Full Name" value={student.user.name} />
                                                        <DetailItem
                                                            label="Date of Birth"
                                                            value={student.user.dob ? new Date(student.user.dob).toLocaleDateString() : 'N/A'}
                                                            icon={Calendar}
                                                        />
                                                        <DetailItem label="Gender" value={student.user.gender || 'N/A'} />
                                                        <DetailItem label="Personal Phone" value={student.user.phone || 'N/A'} icon={Phone} />
                                                        <DetailItem label="Bio" value={student.user.bio || 'No bio provided.'} className="md:col-span-2" isLongText />
                                                    </div>
                                                )}

                                                {/* Guardian Information */}
                                                {activeTab === 'guardian' && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <DetailItem label="Guardian Name" value={student.guardianName || 'N/A'} icon={Users} />
                                                        <DetailItem label="Guardian Phone" value={student.guardianPhone || 'N/A'} icon={Phone} />
                                                    </div>
                                                )}

                                                {/* Address */}
                                                {activeTab === 'address' && (
                                                    <div className="grid grid-cols-1 gap-8">
                                                        <DetailItem label="Permanent Address" value={student.user.address || 'N/A'} icon={MapPin} isLongText />
                                                    </div>
                                                )}

                                                {/* Social Media */}
                                                {activeTab === 'social' && (
                                                    <div className="space-y-6">
                                                        <SocialItem label="LinkedIn" value={socialLinks.linkedin} icon={Linkedin} color="bg-blue-600" />
                                                        <SocialItem label="GitHub" value={socialLinks.github} icon={Github} color="bg-slate-800" />
                                                        <SocialItem label="Website" value={socialLinks.website} icon={Globe} color="bg-emerald-500" />
                                                    </div>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-400">
                                    <p>Student information not available.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const DetailItem = ({ label, value, icon: Icon, className, isLongText }) => (
    <div className={cn("p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800", className)}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            {Icon && <Icon size={14} className="text-indigo-500" />}
            {label}
        </p>
        <p className={cn("font-bold text-slate-700 dark:text-slate-200", isLongText ? "leading-relaxed" : "text-lg")}>
            {value}
        </p>
    </div>
);

const SocialItem = ({ label, value, icon: Icon, color }) => {
    if (!value) return null;
    return (
        <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
        >
            <div className={cn("p-3 rounded-xl text-white", color)}>
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="font-bold text-slate-700 dark:text-white group-hover:text-indigo-500 transition-colors truncate">{value}</p>
            </div>
        </a>
    );
};

export default StudentProfileModal;
