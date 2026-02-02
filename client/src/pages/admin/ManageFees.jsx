import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Edit2,
    Trash2,
    CreditCard,
    Calendar,
    Users,
    BookOpen,
    Search,
    Filter,
    X,
    CheckCircle,
    AlertCircle,
    DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';

const ManageFees = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        dueDate: '',
        semester: 0,
        department: 'All',
        status: 'active'
    });

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/fees', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFees(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching fees:", error);
            toast.error("Failed to load fees");
            setLoading(false);
        }
    };

    const handleOpenModal = (fee = null) => {
        if (fee) {
            setEditingFee(fee);
            setFormData({
                title: fee.title,
                description: fee.description || '',
                amount: fee.amount,
                dueDate: new Date(fee.dueDate).toISOString().split('T')[0],
                semester: fee.semester,
                department: fee.department,
                status: fee.status
            });
        } else {
            setEditingFee(null);
            setFormData({
                title: '',
                description: '',
                amount: '',
                dueDate: '',
                semester: 0,
                department: 'All',
                status: 'active'
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingFee) {
                await axios.put(`http://localhost:5000/api/admin/fees/${editingFee._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Fee updated successfully");
            } else {
                await axios.post('http://localhost:5000/api/admin/fees', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Fee created successfully");
            }
            setShowModal(false);
            fetchFees();
        } catch (error) {
            console.error("Error saving fee:", error);
            toast.error(error.response?.data?.message || "Failed to save fee");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this fee item?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/fees/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Fee deleted successfully");
            fetchFees();
        } catch (error) {
            toast.error("Failed to delete fee");
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Fee Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Create and manage university fee structures.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
                >
                    <Plus size={20} />
                    <span>Create New Fee</span>
                </button>
            </div>

            {/* Fee Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-white dark:bg-slate-800 rounded-3xl animate-pulse border border-slate-100 dark:border-slate-700" />
                    ))
                ) : fees.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <CreditCard size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-bold">No fees defined yet.</p>
                    </div>
                ) : (
                    fees.map((fee) => (
                        <motion.div
                            layout
                            key={fee._id}
                            className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={() => handleOpenModal(fee)}
                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(fee._id)}
                                    className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-4 rounded-2xl ${fee.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                    <DollarSign size={24} />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${fee.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-600'}`}>
                                    {fee.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{fee.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 h-8">{fee.description || 'No description provided.'}</p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <CreditCard size={18} className="text-indigo-500" />
                                    <span>${fee.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                    <Calendar size={18} />
                                    <span>Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                    <Users size={18} />
                                    <span>Dept: {fee.department}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                    <BookOpen size={18} />
                                    <span>Semester: {fee.semester === 0 ? 'All' : fee.semester}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{editingFee ? 'Edit Fee Detail' : 'Create New Fee'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X size={24} className="text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fee Title</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="e.g. Tuition Fee"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount ($)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="2500"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Department</label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        >
                                            <option value="All">All Departments</option>
                                            <option value="Computer Science">Computer Science</option>
                                            <option value="Information Technology">Information Technology</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Mechanical">Mechanical</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Semester</label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            value={formData.semester}
                                            onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                                        >
                                            <option value={0}>All Semesters</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                                        <textarea
                                            rows={2}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                            placeholder="Enter fee details..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95">
                                    {editingFee ? 'Update Fee Entry' : 'Publish Fee Structure'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageFees;
