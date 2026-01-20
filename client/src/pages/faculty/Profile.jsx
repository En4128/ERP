import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    GraduationCap,
    Calendar,
    Edit3,
    Camera,
    Shield,
    Key,
    Save,
    ChevronRight,
    Sparkles,
    CheckCircle2,
    ShieldCheck,
    ArrowRight
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
            "bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500",
            className
        )}
    >
        {children}
    </motion.div>
);

const DetailItem = ({ icon: Icon, label, value, className = "", delay = 0, editing, name, onChange, type = "text", options = [] }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className={cn("flex items-start gap-4", className)}
    >
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-indigo-500 border border-slate-100 dark:border-slate-700 shadow-sm">
            <Icon size={18} />
        </div>
        <div className="space-y-1 flex-1">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
            {editing ? (
                type === "select" ? (
                    <select
                        name={name}
                        value={value}
                        onChange={onChange}
                        className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1 text-sm font-black text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1 text-sm font-black text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                )
            ) : (
                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{value || "Not Set"}</p>
            )}
        </div>
    </motion.div>
);

const FacultyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        department: '',
        designation: '',
        employeeId: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/faculty/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setEditFormData({
                department: res.data.department,
                designation: res.data.designation,
                employeeId: res.data.employeeId
            });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching profile:", error);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/faculty/profile', editFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile");
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

    if (!profile) {
        return (
            <Layout role="faculty">
                <div className="flex flex-col justify-center items-center h-screen space-y-6">
                    <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Profile Identity Lost</p>
                    <button onClick={fetchProfile} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">Retry Synchronization</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="faculty">
            <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-400/10 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 w-fit"
                        >
                            <Sparkles size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Identity Passport</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
                            Personal <br />
                            <span className="text-indigo-600 dark:text-indigo-400">Profile</span>
                        </h1>
                    </div>

                    <button
                        onClick={() => editing ? handleSave() : setEditing(true)}
                        className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-3"
                    >
                        {editing ? <><Save size={16} /> Synchronize Data</> : <><Edit3 size={16} /> Modify Identity</>}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Perspective Sidebar */}
                    <div className="space-y-8">
                        <GlassCard className="p-10 text-center relative overflow-hidden">
                            <div className="absolute top-[-20%] right-[-20%] w-[150px] h-[150px] bg-indigo-500/10 rounded-full blur-[60px]" />

                            <div className="relative inline-block mb-8">
                                <div className="w-40 h-40 rounded-[3rem] bg-indigo-600 p-1.5 shadow-2xl shadow-indigo-600/30">
                                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[2.8rem] flex items-center justify-center overflow-hidden">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.user.name)}&size=200&background=6366f1&color=fff&bold=true`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <button className="absolute bottom-2 right-2 p-3.5 bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 rounded-[1.5rem] text-indigo-600 shadow-xl hover:scale-110 active:scale-95 transition-all">
                                    <Camera size={18} />
                                </button>
                            </div>

                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1.5 leading-none">{profile.user.name}</h3>
                            <p className="text-indigo-500 font-black tracking-[0.2em] text-[10px] uppercase mb-8">{profile.designation} <br /> <span className="text-slate-400">{profile.department} Unit</span></p>

                            <div className="flex justify-center">
                                <span className="bg-emerald-500/10 text-emerald-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
                                    <CheckCircle2 size={12} /> Active Faculty
                                </span>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                <ShieldCheck size={16} className="text-indigo-600" /> Security Protocol
                            </h4>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 active:scale-[0.98] transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-400 group-hover:text-indigo-500 shadow-sm border border-slate-50 dark:border-slate-800 transition-colors">
                                            <Key size={16} />
                                        </div>
                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Update Cipher</span>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                </button>
                                <button className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 active:scale-[0.98] transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-400 group-hover:text-indigo-500 shadow-sm border border-slate-50 dark:border-slate-800 transition-colors">
                                            <Shield size={16} />
                                        </div>
                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Biometric MFA</span>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                </button>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Meta Information */}
                    <div className="lg:col-span-2 space-y-8">
                        <GlassCard className="p-10">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 border-b border-slate-50 dark:border-slate-800 pb-6">Professional Vector</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <DetailItem
                                    icon={Briefcase}
                                    label="Deployment ID"
                                    value={editing ? editFormData.employeeId : profile.employeeId}
                                    delay={0.1}
                                    editing={editing}
                                    name="employeeId"
                                    onChange={(e) => setEditFormData({ ...editFormData, employeeId: e.target.value })}
                                />
                                <DetailItem
                                    icon={GraduationCap}
                                    label="Academic Unit"
                                    value={editing ? editFormData.department : profile.department}
                                    delay={0.2}
                                    editing={editing}
                                    name="department"
                                    type="select"
                                    options={["Computer Science", "Electronic Engineering", "Mechanical Engineering", "Civil Engineering", "Biotechnology"]}
                                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                                />
                                <DetailItem
                                    icon={User}
                                    label="Rank / Designation"
                                    value={editing ? editFormData.designation : profile.designation}
                                    delay={0.3}
                                    editing={editing}
                                    name="designation"
                                    onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                                />
                                <DetailItem icon={Calendar} label="Commencement" value="August 24, 2021" delay={0.4} />
                            </div>
                        </GlassCard>

                        <GlassCard className="p-10">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 border-b border-slate-50 dark:border-slate-800 pb-6">Synchronization Channels</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <DetailItem icon={Mail} label="Secure Relay" value={profile.user.email} delay={0.5} />
                                <DetailItem icon={Phone} label="Voice Vector" value="+91 98765 43210" delay={0.6} />
                                <DetailItem icon={MapPin} label="Physical Locus" value="Main Campus, Block B, Room 402" className="md:col-span-2" delay={0.7} />
                            </div>
                        </GlassCard>

                        <GlassCard className="p-10 relative overflow-hidden bg-slate-900 text-white border-none shadow-2xl shadow-indigo-900/20">
                            <div className="absolute top-[-50%] left-[-10%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px]" />
                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 relative z-10">Abstract / Biography</h4>
                            <p className="text-lg font-bold leading-relaxed text-indigo-100/90 italic relative z-10 relative">
                                <span className="text-4xl text-indigo-500 absolute -top-4 -left-6 opacity-30 select-none">"</span>
                                Dedicated educator with over 8 years of experience in higher education. Specialized in Computer Science with a focus on Algorithm design and Web Technologies. Committed to fostering an engaging learning environment for students.
                                <span className="text-4xl text-indigo-500 absolute -bottom-8 -right-4 opacity-30 select-none">"</span>
                            </p>
                        </GlassCard>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default FacultyProfile;
