import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { cn } from '../../lib/utils';
import { User, Mail, Phone, Lock, Camera, CheckCircle, Shield, Trash2, Loader2, BookOpen, MapPin, Users } from 'lucide-react';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({});
    const fileInputRef = React.useRef(null);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: BookOpen },
        { id: 'personal', label: 'Personal', icon: User },
        { id: 'guardian', label: 'Guardian', icon: Users },
        { id: 'address', label: 'Address', icon: MapPin },
        { id: 'social', label: 'Social', icon: Users },
    ];

    // Fetch Profile Data
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/student/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setFormData({
                name: res.data.user.name,
                email: res.data.user.email,
                phone: res.data.user.phone || '',
                address: res.data.user.address || '',
                gender: res.data.user.gender || '',
                dob: res.data.user.dob ? new Date(res.data.user.dob).toISOString().split('T')[0] : '',
                bio: res.data.user.bio || '',
                guardianName: res.data.guardianName || '',
                guardianPhone: res.data.guardianPhone || '',
                batch: res.data.batch || '',
                socialLinks: res.data.user.socialLinks || { linkedin: '', github: '', website: '' }
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
            const res = await axios.put('http://localhost:5000/api/student/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setIsEditing(false);
            // Optionally add toast success here
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/student/profile/image', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setProfile(prev => ({
                ...prev,
                user: { ...prev.user, profileImage: res.data.profileImage }
            }));
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async () => {
        if (!window.confirm("Are you sure you want to remove your profile photo?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:5000/api/student/profile/image', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProfile(prev => ({
                ...prev,
                user: { ...prev.user, profileImage: "" }
            }));
        } catch (error) {
            console.error("Error removing image:", error);
        }
    };

    if (loading) {
        return (
            <Layout role="student">
                <div className="flex justify-center items-center h-screen">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        );
    }

    if (!profile) return null;

    return (
        <Layout role="student">
            <div className="animate-fade-in-up max-w-5xl mx-auto space-y-8 pb-10">
                <div className="relative mb-32">
                    {/* Cover Background with Glow Effect - Salt and Pepper Theme */}
                    <div className="relative h-48 w-full rounded-3xl overflow-hidden shadow-2xl">
                        {/* Animated Gradient Background - Light: Grayscale, Dark: Vibrant Colors */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 dark:from-cyan-500 dark:via-teal-500 dark:to-blue-500 opacity-90 animate-gradient-x"></div>

                        {/* Glow Effect Layer */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600 dark:from-cyan-400 dark:via-teal-400 dark:to-blue-400 blur-3xl opacity-60 animate-pulse-slow"></div>

                        {/* Pattern Overlay */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

                        {/* Dark Gradient Overlay - Lighter in dark mode */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/30 dark:to-transparent"></div>

                        {/* Outer Glow - Adapts to theme */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 dark:from-cyan-500 dark:via-teal-500 dark:to-blue-500 blur-2xl opacity-30 dark:opacity-50 -z-10"></div>
                    </div>

                    {/* Profile Header Card */}
                    <div className="absolute top-24 left-4 right-4 md:left-8 md:right-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl p-6 flex flex-col md:flex-row items-center md:items-end gap-6 transition-all duration-300">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-slate-100 relative group transition-transform duration-300 hover:scale-105">
                                <img
                                    src={profile.user.profileImage ? `http://localhost:5000${profile.user.profileImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.user.name)}&background=random`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-all transform hover:scale-110"
                                        title="Upload Photo"
                                    >
                                        <Camera size={18} />
                                    </button>
                                    {profile.user.profileImage && (
                                        <button
                                            onClick={handleRemoveImage}
                                            className="p-2 bg-rose-500/80 hover:bg-rose-600/90 rounded-full text-white backdrop-blur-sm transition-all transform hover:scale-110"
                                            title="Remove Photo"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left mb-2">
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{profile.user.name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                                    {profile.department}
                                </span>
                                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                                    Semester {profile.sem}
                                </span>
                                <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-100 dark:border-amber-800/50">
                                    {profile.admissionNumber}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={cn(
                                    "px-6 py-3 font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2",
                                    isEditing
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/30"
                                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-slate-900/20"
                                )}
                            >
                                {isEditing ? <><CheckCircle size={16} /> Save Changes</> : 'Edit Profile'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Floating Glass Tabs */}
                <div className="sticky top-4 z-30 flex justify-center pb-8 animate-fade-in-up">
                    <div className="flex items-center gap-1 p-1.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 rounded-full shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-x-auto max-w-full no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "relative px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 whitespace-nowrap",
                                        isActive
                                            ? "text-white shadow-lg shadow-indigo-500/30"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-indigo-600 rounded-full -z-10 animate-fade-in-up"></div>
                                    )}
                                    <Icon size={14} className={isActive ? "animate-pulse" : ""} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area with Glass Effect */}
                <div className="max-w-4xl mx-auto px-4 md:px-0 min-h-[400px]">

                    {/* 1. General Details */}
                    {activeTab === 'general' && (
                        <div className="animate-fade-in-up bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/40 dark:border-slate-700/50 relative overflow-hidden">
                            {/* Decorative gradients */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -z-10"></div>

                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
                                <BookOpen size={18} className="text-indigo-500" /> General Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Admission Number</label>
                                    <p className="w-full p-4 bg-white/50 dark:bg-slate-900/50 border border-indigo-50 dark:border-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-300 shadow-sm">{profile.admissionNumber}</p>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Department</label>
                                    <p className="w-full p-4 bg-white/50 dark:bg-slate-900/50 border border-indigo-50 dark:border-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-300 shadow-sm">{profile.department}</p>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Batch</label>
                                    <input
                                        type="text"
                                        value={formData.batch}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                        className="w-full p-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50/50 disabled:text-slate-500 disabled:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Current Semester</label>
                                    <div className="w-full p-4 bg-white/50 dark:bg-slate-900/50 border border-indigo-50 dark:border-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-300 shadow-sm flex items-center justify-between">
                                        <span>Semester {profile.sem}</span>
                                        <div className="h-2 w-20 bg-indigo-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-[70%]"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2 group">
                                    <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Official Email</label>
                                    <p className="w-full p-4 bg-indigo-50/50 dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-800 rounded-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600">
                                            <Mail size={16} />
                                        </div>
                                        {formData.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Personal Details */}
                    {activeTab === 'personal' && (
                        <div className="animate-fade-in-up bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/40 dark:border-slate-700/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -z-10"></div>

                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
                                <User size={18} className="text-teal-500" /> Personal Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-bold text-teal-300 uppercase tracking-widest group-hover:text-teal-500 transition-colors">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        disabled
                                        className="w-full p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-transparent rounded-2xl font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-bold text-teal-300 uppercase tracking-widest group-hover:text-teal-500 transition-colors">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full p-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/20 focus:border-teal-500 outline-none transition-all disabled:bg-slate-50/50 disabled:text-slate-500 disabled:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-bold text-teal-300 uppercase tracking-widest group-hover:text-teal-500 transition-colors">Gender</label>
                                    <div className="relative">
                                        <select
                                            value={formData.gender}
                                            disabled={!isEditing}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full p-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/20 focus:border-teal-500 outline-none transition-all appearance-none disabled:bg-slate-50/50 disabled:text-slate-500 disabled:border-transparent"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <User size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-bold text-teal-300 uppercase tracking-widest group-hover:text-teal-500 transition-colors">Personal Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full p-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/20 focus:border-teal-500 outline-none transition-all disabled:bg-slate-50/50 disabled:text-slate-500 disabled:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2 group">
                                    <label className="text-[10px] font-bold text-teal-300 uppercase tracking-widest group-hover:text-teal-500 transition-colors">Bio / About</label>
                                    <textarea
                                        value={formData.bio}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full p-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/20 focus:border-teal-500 outline-none transition-all disabled:bg-slate-50/50 disabled:text-slate-500 disabled:border-transparent min-h-[120px] resize-none"
                                        placeholder="Write something about yourself..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. Parent Details */}
                    {activeTab === 'guardian' && (
                        <div className="animate-fade-in-up bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/40 dark:border-slate-700/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>

                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
                                <Users size={18} className="text-amber-500" /> Guardian Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-bold text-amber-300 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Guardian Name</label>
                                    <input
                                        type="text"
                                        value={formData.guardianName}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                                        className="w-full p-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20 focus:border-amber-500 outline-none transition-all disabled:bg-slate-50/50 disabled:text-slate-500 disabled:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-bold text-amber-300 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Guardian Phone</label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            value={formData.guardianPhone}
                                            disabled={!isEditing}
                                            onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                                            className="w-full p-4 pl-12 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20 focus:border-amber-500 outline-none transition-all disabled:bg-slate-50/50 disabled:text-slate-500 disabled:border-transparent"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Phone size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. Address */}
                    {activeTab === 'address' && (
                        <div className="animate-fade-in-up bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/40 dark:border-slate-700/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -z-10"></div>

                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
                                <MapPin size={18} className="text-rose-500" /> Communication Address
                            </h3>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-bold text-rose-300 uppercase tracking-widest group-hover:text-rose-500 transition-colors">Permanent Address</label>
                                <textarea
                                    value={formData.address}
                                    disabled={!isEditing}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full p-6 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-rose-100 dark:focus:ring-rose-900/20 focus:border-rose-500 outline-none transition-all disabled:bg-slate-50/50 disabled:text-slate-500 disabled:border-transparent min-h-[150px] resize-none leading-relaxed"
                                    placeholder="Enter complete address..."
                                />
                            </div>
                        </div>
                    )}

                    {/* 5. Social */}
                    {activeTab === 'social' && (
                        <div className="animate-fade-in-up bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/40 dark:border-slate-700/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
                                <Users size={18} className="text-blue-500" /> Social Presence
                            </h3>
                            <div className="space-y-6">
                                {['linkedin', 'github', 'website'].map(platform => (
                                    <div key={platform} className="space-y-2 group">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">{platform}</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.socialLinks?.[platform] || ''}
                                                disabled={!isEditing}
                                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, [platform]: e.target.value } })}
                                                className="w-full p-4 pl-12 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium text-slate-700 dark:text-white text-sm focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 outline-none transition-all disabled:bg-slate-50/50 disabled:text-slate-500 disabled:border-transparent"
                                                placeholder={`https://${platform}.com/...`}
                                            />
                                            {/* Generic world icon for web or link icon */}
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <div className="w-2 h-2 rounded-full ring-4 ring-slate-100 dark:ring-slate-700 bg-blue-500"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </Layout >
    );
};

export default Profile;
