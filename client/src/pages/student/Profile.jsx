
import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { User, Mail, Phone, Lock, Camera, CheckCircle, Shield } from 'lucide-react';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: 'Jane Doe',
        studentId: 'STUCSE2023001',
        email: 'jane.doe@campus.edu',
        phone: '+1 (555) 123-4567',
        role: 'Student',
        status: 'Active',
        image: 'https://ui-avatars.com/api/?name=Jane+Doe&background=random'
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Layout role="student">
            <div className="animate-fade-in-up max-w-4xl mx-auto space-y-8">
                <div className="relative">
                    {/* Cover Background */}
                    <div className="h-48 w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl opacity-90">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    </div>

                    {/* Profile Header Card */}
                    <div className="absolute top-24 left-6 right-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center md:items-end gap-6 border border-gray-100 dark:border-slate-700">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-md overflow-hidden bg-gray-100">
                                <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <label className="absolute bottom-1 right-1 bg-amber-500 text-white p-2 rounded-full cursor-pointer hover:bg-amber-600 transition shadow-sm border-2 border-white dark:border-slate-800">
                                <Camera size={18} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>

                        <div className="flex-1 text-center md:text-left mb-2">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{profile.name}</h1>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">Computer Science Engineering • Semester 5</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition shadow-sm"
                            >
                                {isEditing ? 'Save Changes' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-32 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Personal Information */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                                <User className="mr-2 text-blue-700" size={20} /> Personal Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        disabled={!isEditing}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Student ID</label>
                                    <input
                                        type="text"
                                        value={profile.studentId}
                                        disabled={true}
                                        className="w-full p-3 bg-gray-100 dark:bg-slate-700/50 border border-transparent rounded-xl font-bold text-gray-600 dark:text-slate-300 cursor-not-allowed flex items-center"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled={!isEditing}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-75"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mobile Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            disabled={!isEditing}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-75"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                                <Shield className="mr-2 text-emerald-500" size={20} /> Account Status
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                                    <div>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Role</p>
                                        <p className="font-bold text-slate-900 dark:text-white">{profile.role}</p>
                                    </div>
                                    <Shield className="text-emerald-500" size={24} />
                                </div>
                                <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                    <div>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Status</p>
                                        <p className="font-bold text-slate-900 dark:text-white flex items-center">
                                            {profile.status} <CheckCircle size={16} className="ml-1 text-blue-500" />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                                <Lock className="mr-2 text-amber-500" size={20} /> Security
                            </h3>
                            <button className="w-full py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-white dark:hover:bg-slate-700 transition">
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
