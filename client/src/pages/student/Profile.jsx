
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { cn } from '../../lib/utils';
import { User, Mail, Phone, Lock, Camera, CheckCircle, Shield } from 'lucide-react';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({});

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
            // Optionally add toast error here
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
                <div className="relative">
                    {/* Cover Background */}
                    <div className="h-48 w-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl opacity-90 overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    </div>

                    {/* Profile Header Card */}
                    <div className="absolute top-24 left-6 right-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row items-center md:items-end gap-6 border border-slate-100 dark:border-slate-700 backdrop-blur-sm">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-md overflow-hidden bg-slate-100">
                                <img
                                    src={profile.user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.user.name)}&background=random`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left mb-2">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{profile.user.name}</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mt-1">
                                {profile.department} • Semester {profile.sem} • {profile.admissionNumber}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={cn(
                                    "px-6 py-3 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg active:scale-95",
                                    isEditing
                                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-slate-900/20"
                                )}
                            >
                                {isEditing ? 'Save Changes' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-32 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Personal Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Bio Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <User size={16} /> About Me
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500 outline-none min-h-[120px]"
                                    placeholder="Write a short bio..."
                                />
                            ) : (
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                    {formData.bio || "No bio added yet."}
                                </p>
                            )}
                        </div>

                        {/* Personal Details Form */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Shield size={16} /> Personal Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        disabled
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                                    <input
                                        type="text"
                                        value={formData.email}
                                        disabled
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Guardian Info */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <User size={16} /> Guardian Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guardian Name</label>
                                    <input
                                        type="text"
                                        value={formData.guardianName}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guardian Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.guardianPhone}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Meta Info */}
                    <div className="space-y-8">
                        {/* Batches and Dept */}
                        <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl shadow-slate-900/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-10 -mt-10" />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 relative z-10">Academic Info</h3>
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Batch</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.batch}
                                            onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                            className="w-full bg-slate-800 border-none rounded-lg px-3 py-2 text-white font-bold focus:ring-1 focus:ring-teal-500"
                                            placeholder="e.g. 2023-2027"
                                        />
                                    ) : (
                                        <p className="text-2xl font-black text-white">{formData.batch || "Not Set"}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Department</p>
                                    <p className="text-xl font-bold text-white">{profile.department}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Semester</p>
                                    <p className="text-xl font-bold text-white">{profile.sem}</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Social Presence</h3>
                            <div className="space-y-4">
                                {['linkedin', 'github', 'website'].map(platform => (
                                    <div key={platform} className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{platform}</p>
                                        <input
                                            type="text"
                                            value={formData.socialLinks?.[platform] || ''}
                                            disabled={!isEditing}
                                            onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, [platform]: e.target.value } })}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                                            placeholder={`Running ${platform} URL...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
