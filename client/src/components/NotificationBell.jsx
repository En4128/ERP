import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import axios from 'axios';

const NotificationBell = ({ role }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, [role]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !role) return;

            const endpoint = role === 'student' ? '/api/student/notifications' : '/api/faculty/notifications';
            const res = await axios.get(`http://localhost:5000${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const toggle = () => setIsOpen(!isOpen);

    const markAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !role) return;

            const endpoint = role === 'student' ? '/api/student/notifications' : '/api/faculty/notifications';

            // Mark all as read logically in frontend first for speed
            setNotifications(notifications.map(n => ({ ...n, read: true })));

            // API calls to mark specific unread ones (or we could have a "mark all" endpoint, but usually loop)
            // For now, let's just assume viewing them marks them or we hit them one by one.
            // Actually, the UI has "Mark all read". Let's update all unread ones.
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            await Promise.all(unreadIds.map(id =>
                axios.post(`http://localhost:5000${endpoint}/${id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ));
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    return (
        <div className="relative">
            <motion.button
                onClick={toggle}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <motion.div
                    animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                    transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.5 }}
                >
                    <Bell className="text-gray-600 dark:text-gray-300" size={24} />
                </motion.div>

                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900"
                        >
                            {unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h3>
                                <button
                                    onClick={markAsRead}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-wider"
                                >
                                    Mark all read
                                </button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <p className="text-slate-400 text-sm font-medium">No notifications</p>
                                    </div>
                                ) : (
                                    notifications.map((n, i) => (
                                        <motion.div
                                            key={n.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`p-4 border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                                        >
                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{n.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.content}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{n.author}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(n.date).toLocaleDateString()}</span>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
