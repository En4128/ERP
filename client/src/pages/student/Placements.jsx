import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import {
    Briefcase, Search, Building, Calendar, Users,
    DollarSign, TrendingUp, CheckCircle, XCircle, Clock,
    FileText, Eye, MapPin, Loader2
} from 'lucide-react';

const Placements = () => {
    const [activeTab, setActiveTab] = useState('drives');
    const [drives, setDrives] = useState([]);
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedDrive, setSelectedDrive] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [resumeUrl, setResumeUrl] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [drivesRes, applicationsRes, statsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/placement/student/drives', config),
                axios.get('http://localhost:5000/api/placement/student/applications', config),
                axios.get('http://localhost:5000/api/placement/student/statistics', config)
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

    const handleApply = async () => {
        if (!resumeUrl.trim()) {
            alert('Please provide your resume URL');
            return;
        }

        setApplying(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/placement/student/apply',
                {
                    driveId: selectedDrive._id,
                    resumeUrl,
                    coverLetter
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Application submitted successfully!');
            setShowApplyModal(false);
            setResumeUrl('');
            setCoverLetter('');
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error applying:', error);
            alert(error.response?.data?.message || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    const filteredDrives = drives.filter(drive =>
        drive.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drive.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'ongoing': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-green-900/30 dark:text-green-300';
            case 'pending': return 'bg-gray-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300';
            case 'shortlisted': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'selected': return 'bg-emerald-100 text-emerald-700 dark:bg-green-900/30 dark:text-green-300';
            case 'rejected': return 'bg-rose-100 text-rose-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-slate-700';
        }
    };

    if (loading) {
        return (
            <Layout role="student">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="student">
            <div className="space-y-6 animate-fade-in-up">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Placement Portal</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Explore opportunities and track your applications</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-green-900/30">
                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.availableDrives || 0}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Available Drives</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-100 dark:bg-indigo-900/30">
                                <FileText className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalApplications || 0}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Applications</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.shortlisted || 0}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Shortlisted</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                                <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.placementStatus || 'Not Placed'}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
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
                        Available Drives
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'applications'
                                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        My Applications
                    </button>
                </div>

                {/* Available Drives Tab */}
                {activeTab === 'drives' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search companies or roles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredDrives.length > 0 ? filteredDrives.map((drive) => (
                                <div key={drive._id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-indigo-900/30">
                                                <Building className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white">{drive.companyName}</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{drive.role}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(drive.status)}`}>
                                            {drive.status.charAt(0).toUpperCase() + drive.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-green-400" />
                                            <span className="font-semibold text-emerald-600 dark:text-green-400">{drive.package}</span>
                                        </div>
                                        {drive.location && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                                                <MapPin className="h-4 w-4" />
                                                <span>{drive.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(drive.driveDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                                            <FileText className="h-4 w-4" />
                                            <span className="text-xs">Deadline: {new Date(drive.applicationDeadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{drive.totalApplicants} applicants</span>
                                            {drive.hasApplied ? (
                                                <span className="px-3 py-1 bg-emerald-100 dark:bg-green-900/30 text-emerald-700 dark:text-green-300 rounded-lg text-sm font-medium">
                                                    Applied
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedDrive(drive);
                                                        setShowApplyModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Apply Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 text-center py-12 text-slate-600 dark:text-slate-400">
                                    No placement drives available at the moment.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* My Applications Tab */}
                {activeTab === 'applications' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">My Applications</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="py-4 px-4 font-semibold text-gray-600 dark:text-slate-300">Company</th>
                                        <th className="py-4 px-4 font-semibold text-gray-600 dark:text-slate-300">Role</th>
                                        <th className="py-4 px-4 font-semibold text-gray-600 dark:text-slate-300">Package</th>
                                        <th className="py-4 px-4 font-semibold text-gray-600 dark:text-slate-300">Applied Date</th>
                                        <th className="py-4 px-4 font-semibold text-gray-600 dark:text-slate-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {applications.length > 0 ? applications.map((app) => (
                                        <tr key={app.id} className="hover:bg-white dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="py-4 px-4 text-sm font-medium text-slate-900 dark:text-white">{app.company}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600 dark:text-slate-300">{app.role}</td>
                                            <td className="py-4 px-4 text-sm font-semibold text-emerald-600 dark:text-green-400">{app.package}</td>
                                            <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">{app.appliedDate}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(app.status)}`}>
                                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-slate-600 dark:text-slate-400">
                                                You haven't applied to any drives yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Apply Modal */}
                {showApplyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Apply to {selectedDrive?.companyName}</h3>
                                <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Resume URL *</label>
                                    <input
                                        type="url"
                                        placeholder="https://drive.google.com/..."
                                        value={resumeUrl}
                                        onChange={(e) => setResumeUrl(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Cover Letter (Optional)</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Why are you interested in this role?"
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-slate-700">
                                <button
                                    onClick={() => setShowApplyModal(false)}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    {applying && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {applying ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Placements;
