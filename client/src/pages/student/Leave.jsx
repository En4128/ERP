import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Calendar, Send, History, User, CheckCircle, XCircle, Clock } from 'lucide-react';

const Leave = () => {
    const [formData, setFormData] = useState({
        facultyId: '',
        type: 'Sick Leave',
        from: '',
        to: '',
        reason: ''
    });
    const [facultyList, setFacultyList] = useState([]);
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [facultyRes, historyRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/student/faculty', config),
                    axios.get('http://localhost:5000/api/student/leave', config)
                ]);

                // The faculty endpoint returns detailed objects. We need ID and Name.
                // Based on previous controller review, it returns an array of objects.
                // We'll trust the response structure.
                setFacultyList(facultyRes.data);
                setLeaveHistory(historyRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/student/leave', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Add new leave to history immediately
            setLeaveHistory([res.data.leave, ...leaveHistory]);
            setFormData({ facultyId: '', type: 'Sick Leave', from: '', to: '', reason: '' });
            setMessage({ type: 'success', text: 'Leave application submitted successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit application' });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'text-emerald-600 bg-emerald-100 dark:bg-green-900/30';
            case 'Rejected': return 'text-rose-600 bg-rose-100 dark:bg-red-900/30';
            default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle size={16} />;
            case 'Rejected': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <Layout role="student">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Leave Management</h2>
                    <p className="text-slate-600 dark:text-gray-400 mt-1">Apply for leave and track your application status</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Application Form */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-fit">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Send size={20} className="text-blue-700" /> Apply for Leave
                        </h3>

                        {message && (
                            <div className={`p-4 rounded-xl mb-6 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Faculty Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Faculty</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full p-3 pl-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none appearance-none"
                                        value={formData.facultyId}
                                        onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                                    >
                                        <option value="">Select a faculty member...</option>
                                        {facultyList.map(f => (
                                            // Using employeeId as ID based on likely schema, or _id if available from previous response structure
                                            // The previous controller update used User search logic but returned formatted objects.
                                            // Let's assume the notification logic uses specific IDs.
                                            // We'll use the unique ID available.
                                            <option key={f.id || f._id} value={f._id || f.id}>{f.name} ({f.department})</option>
                                        ))}
                                    </select>
                                    <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Leave Type</label>
                                <select
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Sick Leave">Sick Leave</option>
                                    <option value="Casual Leave">Casual Leave</option>
                                    <option value="Duty Leave">Duty Leave</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">From</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={formData.from}
                                        onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">To</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={formData.to}
                                        onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Reason</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                                    placeholder="Please explain the reason..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                disabled={submitting}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition flex items-center justify-center disabled:opacity-70"
                            >
                                {submitting ? 'Submitting...' : <><Send size={18} className="mr-2" /> Submit Application</>}
                            </button>
                        </form>
                    </div>

                    {/* History */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <History size={20} className="text-purple-600" /> Application History
                        </h3>

                        {loading ? (
                            <div className="text-center py-10">Loading...</div>
                        ) : leaveHistory.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl text-center text-slate-600 border border-dashed border-gray-300">
                                No leave applications found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {leaveHistory.map(leave => (
                                    <div key={leave._id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{leave.type}</span>
                                                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">
                                                    To: {leave.faculty?.user?.name || 'Unknown Faculty'}
                                                </div>
                                            </div>
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(leave.status)}`}>
                                                {getStatusIcon(leave.status)} {leave.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white font-semibold mb-3">
                                            <Calendar size={16} className="text-blue-700" />
                                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-900 p-3 rounded-lg mb-2">
                                            "{leave.reason}"
                                        </p>

                                        {leave.facultyComment && (
                                            <div className="text-sm mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                                                <span className="font-semibold text-slate-700 dark:text-gray-300">Faculty Response:</span>
                                                <p className="text-gray-600 dark:text-gray-400 italic mt-1">{leave.facultyComment}</p>
                                            </div>
                                        )}

                                        <div className="text-xs text-gray-400 text-right mt-2">
                                            Applied on {new Date(leave.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Leave;
