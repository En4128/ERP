import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trash2, Search, Plus, Edit2, X, AlertCircle, Building, Calendar, DollarSign, TrendingUp, CheckCircle, Users, FileText, Eye, XCircle, Loader2 } from 'lucide-react';

const ManagePlacements = () => {
    const [drives, setDrives] = useState([]);
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDrive, setEditingDrive] = useState(null);
    const [error, setError] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('drives');
    const [viewingApp, setViewingApp] = useState(null);

    const [formData, setFormData] = useState({
        companyName: '',
        role: '',
        package: '',
        location: '',
        jobType: 'Full-time',
        departments: '',
        minCGPA: '',
        maxBacklogs: '',
        description: '',
        driveDate: '',
        applicationDeadline: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [drivesRes, applicationsRes, statsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/placement/admin/drives', config),
                axios.get('http://localhost:5000/api/placement/admin/applications', config),
                axios.get('http://localhost:5000/api/placement/admin/statistics', config)
            ]);

            setDrives(drivesRes.data);
            setApplications(applicationsRes.data);
            setStats(statsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching placement data:', error);
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            companyName: '',
            role: '',
            package: '',
            location: '',
            jobType: 'Full-time',
            departments: '',
            minCGPA: '',
            maxBacklogs: '',
            description: '',
            driveDate: '',
            applicationDeadline: ''
        });
        setEditingDrive(null);
        setError('');
    };

    const handleEdit = (drive) => {
        setEditingDrive(drive);
        setFormData({
            companyName: drive.companyName || '',
            role: drive.role || '',
            package: drive.package || '',
            location: drive.location || '',
            jobType: drive.jobType || 'Full-time',
            departments: drive.eligibilityCriteria?.departments?.join(', ') || '',
            minCGPA: drive.eligibilityCriteria?.minCGPA || '',
            maxBacklogs: drive.eligibilityCriteria?.maxBacklogs || '',
            description: drive.description || '',
            driveDate: drive.driveDate ? new Date(drive.driveDate).toISOString().split('T')[0] : '',
            applicationDeadline: drive.applicationDeadline ? new Date(drive.applicationDeadline).toISOString().split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const url = editingDrive
                ? `http://localhost:5000/api/placement/admin/drives/${editingDrive._id}`
                : 'http://localhost:5000/api/placement/admin/drives';
            const method = editingDrive ? 'put' : 'post';

            const payload = {
                companyName: formData.companyName,
                role: formData.role,
                package: formData.package,
                location: formData.location,
                jobType: formData.jobType,
                eligibilityCriteria: {
                    departments: formData.departments.split(',').map(d => d.trim()).filter(d => d),
                    minCGPA: parseFloat(formData.minCGPA) || 0,
                    maxBacklogs: parseInt(formData.maxBacklogs) || 0
                },
                description: formData.description,
                driveDate: formData.driveDate,
                applicationDeadline: formData.applicationDeadline
            };

            await axios[method](url, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchData();
            setShowModal(false);
            resetForm();
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this placement drive?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/placement/admin/drives/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDrives(drives.filter(d => d._id !== id));
        } catch (error) {
            console.error('Error deleting drive:', error);
            alert('Failed to delete drive');
        }
    };

    const updateApplicationStatus = async (appId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/placement/admin/applications/${appId}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchData();
            alert(`Application ${status}!`);
        } catch (error) {
            console.error('Error updating application:', error);
            alert('Failed to update application');
        }
    };

    const filteredDrives = drives.filter(drive =>
        drive.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drive.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'ongoing': return 'bg-yellow-100 text-yellow-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'pending': return 'bg-gray-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
            case 'shortlisted': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'selected': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'rejected': return 'bg-rose-100 text-rose-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Placement Management</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage placement drives and track student applications</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-all shadow-md active:scale-95"
                >
                    <Plus size={18} />
                    Add Drive
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.placedStudents || 0}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Students Placed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <Building className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.totalDrives || 0}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Drives</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-indigo-900/30">
                            <DollarSign className="h-5 w-5 text-blue-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.avgPackage || '₹0 LPA'}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Average Package</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-yellow-100 dark:bg-amber-900/30">
                            <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.highestPackage || '₹0 LPA'}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Highest Package</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('drives')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'drives'
                        ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    Placement Drives
                </button>
                <button
                    onClick={() => setActiveTab('applications')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'applications'
                        ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    Applications
                </button>
            </div>

            {/* Drives Tab */}
            {activeTab === 'drives' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search drives..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredDrives.map((drive) => (
                            <div key={drive._id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg dark:hover:shadow-slate-800/50 transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <Building className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-slate-50">{drive.companyName}</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{drive.role}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(drive.status)}`}>
                                        {drive.status.charAt(0).toUpperCase() + drive.status.slice(1)}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{drive.package}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(drive.driveDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-500">{drive.totalApplicants} applicants</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(drive)}
                                            className="text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
                                            title="Edit Drive"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(drive._id)}
                                            className="text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded-lg transition-colors"
                                            title="Delete Drive"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
                    <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-50">Student Applications</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Student</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Company</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Role</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Applied Date</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Documents</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-50">{app.studentName}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-500 font-mono">{app.studentId}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{app.company}</td>
                                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{app.role}</td>
                                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{app.appliedDate}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {app.resumeUrl ? (
                                                    <a
                                                        href={`http://localhost:5000/${app.resumeUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-all text-[10px] font-black uppercase tracking-wider whitespace-nowrap flex-shrink-0 min-w-fit"
                                                    >
                                                        <FileText size={12} /> Resume
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider italic">No Resume</span>
                                                )}
                                                {app.coverLetter ? (
                                                    <button
                                                        onClick={() => setViewingApp(app)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-500/20 transition-all text-[10px] font-black uppercase tracking-wider whitespace-nowrap flex-shrink-0 min-w-fit"
                                                    >
                                                        <Eye size={12} /> Response
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider italic">No Response</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(app.status)}`}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {app.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateApplicationStatus(app.id, 'shortlisted')}
                                                            className="text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
                                                            title="Shortlist"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => updateApplicationStatus(app.id, 'rejected')}
                                                            className="text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                {app.status === 'shortlisted' && (
                                                    <button
                                                        onClick={() => updateApplicationStatus(app.id, 'selected')}
                                                        className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                                                    >
                                                        Select
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                                {editingDrive ? 'Edit Placement Drive' : 'Create Placement Drive'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 bg-rose-50 text-rose-600 p-3 rounded-lg text-sm border border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/50">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">COMPANY NAME *</label>
                                    <input
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="TechCorp"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">ROLE *</label>
                                    <input
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Software Engineer"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">PACKAGE *</label>
                                    <input
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="₹12 LPA"
                                        value={formData.package}
                                        onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">LOCATION</label>
                                    <input
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Bangalore"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">JOB TYPE</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.jobType}
                                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">DEPARTMENTS (comma-separated)</label>
                                    <input
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Computer Science, IT"
                                        value={formData.departments}
                                        onChange={(e) => setFormData({ ...formData, departments: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">MIN CGPA</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="7.0"
                                        value={formData.minCGPA}
                                        onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">MAX BACKLOGS</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="0"
                                        value={formData.maxBacklogs}
                                        onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">DRIVE DATE *</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.driveDate}
                                        onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">APPLICATION DEADLINE *</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.applicationDeadline}
                                        onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">DESCRIPTION *</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Job description..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                            >
                                {formLoading ? 'Saving...' : editingDrive ? 'Update Drive' : 'Create Drive'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Cover Letter Modal */}
            {viewingApp && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Response</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">From {viewingApp.studentName}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingApp(null)}
                                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <div className="prose dark:prose-invert prose-slate max-w-none">
                                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">
                                    {viewingApp.coverLetter}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={() => setViewingApp(null)}
                                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition"
                            >
                                Close Document
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ManagePlacements;
