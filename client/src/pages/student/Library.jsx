
import React from 'react';
import Layout from '../../components/Layout';
import { Book, Clock, Search } from 'lucide-react';

const Library = () => {
    return (
        <Layout role="student">
            <div className="animate-fade-in-up space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Library</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search books..." className="pl-10 pr-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Currently Borrowed</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-3 bg-white dark:bg-slate-700/50 rounded-xl">
                                <div className="w-16 h-20 bg-blue-100 flex items-center justify-center rounded-lg">
                                    <Book size={24} className="text-blue-700" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">Introduction to Algorithms</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">By Thomas H. Cormen</p>
                                    <div className="flex items-center mt-2 text-xs text-orange-500 font-medium">
                                        <Clock size={12} className="mr-1" /> Due in 3 days
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">New Arrivals</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-3 hover:bg-white dark:hover:bg-slate-700/50 rounded-xl transition cursor-pointer">
                                <div className="w-16 h-20 bg-emerald-100 flex items-center justify-center rounded-lg">
                                    <Book size={24} className="text-emerald-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">Clean Code</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">By Robert C. Martin</p>
                                    <span className="inline-block mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">Available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Library;
