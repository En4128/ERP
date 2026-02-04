
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { CreditCard, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Fees = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/student/fees', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFees(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching student fees:", error);
            toast.error("Failed to load fee details");
            setLoading(false);
        }
    };

    const totalOutstanding = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const nextDue = fees.length > 0 ? fees[0].dueDate : null;

    return (
        <Layout role="student">
            <div className="animate-fade-in-up space-y-6">
                <h2 className="text-3xl font-extrabold text-[#0F1419] dark:text-[#E8EAED]">Fee Payment</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-[#2563EB] dark:from-[#60A5FA] to-[#3385DB] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <DollarSign size={80} />
                        </div>
                        <div className="relative z-10">
                            <p className="opacity-80 font-black uppercase text-[10px] tracking-widest">Total Outstanding</p>
                            <h3 className="text-5xl font-black mt-2 tracking-tighter">₹{totalOutstanding.toLocaleString()}</h3>
                            <button className="mt-8 px-6 py-3 bg-white text-[#2563EB] dark:text-[#60A5FA] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition active:scale-95">Pay Now</button>
                        </div>
                    </div>

                    <div className="bg-[#E5E7EB] dark:bg-[#242B3D] p-8 rounded-[2.5rem] shadow-sm border border-[#E2E5E9] dark:border-[#3D4556]">
                        <div className="flex items-center mb-6">
                            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl mr-4">
                                <CheckCircle size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Due Count</p>
                                <h4 className="text-2xl font-black text-[#0F1419] dark:text-[#E8EAED]">{fees.length} Active Fees</h4>
                            </div>
                        </div>
                        <p className="text-xs text-[#64748B] dark:text-[#868D9D] font-medium italic">All fees are calculated based on your current semester and department.</p>
                    </div>

                    <div className="bg-[#E5E7EB] dark:bg-[#242B3D] p-8 rounded-[2.5rem] shadow-sm border border-[#E2E5E9] dark:border-[#3D4556]">
                        <div className="flex items-center mb-6">
                            <div className="p-4 bg-rose-100 text-rose-600 rounded-2xl mr-4">
                                <Clock size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Due Date</p>
                                <h4 className="text-2xl font-black text-[#0F1419] dark:text-[#E8EAED]">{nextDue ? new Date(nextDue).toLocaleDateString() : 'No Dues'}</h4>
                            </div>
                        </div>
                        <p className="text-xs text-[#64748B] dark:text-[#868D9D] font-medium">Please clear your dues before the deadline to avoid late fees.</p>
                    </div>
                </div>

                <div className="bg-[#E5E7EB] dark:bg-[#242B3D] rounded-[3rem] shadow-sm border border-[#E2E5E9] dark:border-[#3D4556] overflow-hidden">
                    <div className="p-8 border-b border-[#E2E5E9] dark:border-[#3D4556] flex justify-between items-center">
                        <h3 className="text-xl font-black text-[#0F1419] dark:text-[#E8EAED]">Active Fee Breakdown</h3>
                        <div className="p-2 bg-blue-50 text-[#2563EB] dark:text-[#60A5FA] rounded-xl">
                            <CreditCard size={20} />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F9FAFB] dark:bg-slate-800/50 border-b border-[#E2E5E9] dark:border-[#3D4556]">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Fee Item</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-bold">Loading fee data...</td></tr>
                                ) : fees.length === 0 ? (
                                    <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-bold border-dashed border-2 m-4 rounded-3xl">No outstanding fees found.</td></tr>
                                ) : fees.map((fee, index) => (
                                    <tr key={fee._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} dark:bg-transparent hover:bg-blue-50/50 transition-colors`}>
                                        <td className="p-6 text-sm text-[#0F1419] dark:text-[#E8EAED] font-black">{fee.title}</td>
                                        <td className="p-6 text-xs text-[#64748B] dark:text-[#868D9D] max-w-xs truncate">{fee.description || 'University Fee'}</td>
                                        <td className="p-6 text-sm text-[#0F1419] dark:text-[#E8EAED] font-black">₹{fee.amount.toLocaleString()}</td>
                                        <td className="p-6 text-xs font-bold text-[#64748B] dark:text-[#868D9D]">{new Date(fee.dueDate).toLocaleDateString()}</td>
                                        <td className="p-6">
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Fees;
