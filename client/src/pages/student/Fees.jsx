
import React from 'react';
import Layout from '../../components/Layout';
import { CreditCard, DollarSign, Clock, CheckCircle } from 'lucide-react';

const Fees = () => {
    return (
        <Layout role="student">
            <div className="animate-fade-in-up space-y-6">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Fee Payment</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <p className="opacity-80 font-medium">Total Outstanding</p>
                        <h3 className="text-4xl font-bold mt-2">$2,500</h3>
                        <button className="mt-6 w-full bg-white text-blue-700 py-2 rounded-xl font-bold hover:bg-opacity-90 transition">Pay Now</button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full mr-4">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Last Payment</p>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">$1,200</h4>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">Paid on 15 Oct, 2023 via Credit Card</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-rose-100 text-rose-600 rounded-full mr-4">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Due Date</p>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">30 Nov, 2023</h4>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">Recurring Semester Fee</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white dark:bg-slate-700/50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-slate-300">Invoice ID</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-slate-300">Date</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-slate-300">Amount</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-slate-300">Method</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-slate-300">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                <tr>
                                    <td className="p-4 text-sm text-slate-900 dark:text-white font-medium">#INV-2023-001</td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">15 Oct, 2023</td>
                                    <td className="p-4 text-sm text-slate-900 dark:text-white font-bold">$1,200</td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">Credit Card</td>
                                    <td className="p-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Paid</span></td>
                                </tr>
                                <tr>
                                    <td className="p-4 text-sm text-slate-900 dark:text-white font-medium">#INV-2023-002</td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">10 Aug, 2023</td>
                                    <td className="p-4 text-sm text-slate-900 dark:text-white font-bold">$800</td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">Bank Transfer</td>
                                    <td className="p-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Paid</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Fees;
