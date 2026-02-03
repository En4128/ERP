
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
                <div className="relative">
                    {/* Cover Background */}
                    <div className="h-48 w-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl opacity-90 overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    </div>

                    {/* Profile Header Card */}
                    <div className="absolute top-24 left-6 right-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row items-center md:items-end gap-6 border border-slate-100 dark:border-slate-700 backdrop-blur-sm">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-md overflow-hidden bg-slate-100 relative group">
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
                                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-all"
                                        title="Upload Photo"
                                    >
                                        <Camera size={18} />
                                    </button>
                                    {profile.user.profileImage && (
                                        <button
                                            onClick={handleRemoveImage}
                                            className="p-2 bg-rose-500/80 hover:bg-rose-600/90 rounded-full text-white backdrop-blur-sm transition-all"
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
                    {/* Left Column: Main Forms */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. General Details */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <BookOpen size={16} /> General Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admission Number</label>
                                    <p className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-500 dark:text-slate-400">{profile.admissionNumber}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</label>
                                    <p className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-500 dark:text-slate-400">{profile.department}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batch</label>
                                    <input
                                        type="text"
                                        value={formData.batch}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Semester</label>
                                    <p className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-500 dark:text-slate-400">{profile.sem}</p>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Email</label>
                                    <p className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <Mail size={14} /> {formData.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Personal Details */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <User size={16} /> Personal Details
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
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                                    <select
                                        value={formData.gender}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personal Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bio / About</label>
                                    <textarea
                                        value={formData.bio}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100 min-h-[100px]"
                                        placeholder="Write something about yourself..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Parent Details */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Users size={16} /> Parent / Guardian Details
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

                        {/* 4. Address for Communication */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <MapPin size={16} /> Address for Communication
                            </h3>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Permanent Address</label>
                                <textarea
                                    value={formData.address}
                                    disabled={!isEditing}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100 min-h-[100px]"
                                    placeholder="Enter complete address..."
                                />
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Meta Info */}
                    <div className="space-y-8">

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
        </Layout >
    );
};

export default Profile;
