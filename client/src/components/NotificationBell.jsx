import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import axios from 'axios';

const NotificationBell = ({ role }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [showClearMessage, setShowClearMessage] = useState(false);
    const navigate = useNavigate();

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

            setNotifications(notifications.map(n => ({ ...n, read: true })));

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

    const clearAll = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !role) return;

            const endpoint = role === 'student' ? '/api/student/notifications' : '/api/faculty/notifications';

            await axios.delete(`http://localhost:5000${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Set to empty array immediately
            setNotifications([]);

            // Show success message
            setShowClearMessage(true);
            setTimeout(() => {
                setShowClearMessage(false);
            }, 3000);
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    };

    const handleNotificationClick = async (notif) => {
        setIsOpen(false);

        // Mark as read if not already
        if (!notif.read) {
            try {
                const token = localStorage.getItem('token');
                const endpoint = role === 'student' ? '/api/student/notifications' : '/api/faculty/notifications';
                await axios.post(`http://localhost:5000${endpoint}/${notif.id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        }

        // Navigation logic based on type or content keywords
        const type = notif.type?.toLowerCase();
        const title = notif.title?.toLowerCase() || '';
        const content = notif.content?.toLowerCase() || '';

        if (title.includes('fee') || content.includes('fee')) {
            navigate(`/${role}/fees`);
        } else if (type === 'exam' || title.includes('exam') || content.includes('exam')) {
            navigate(`/${role}/exams`);
        } else if (type === 'assignment' || title.includes('assignment') || content.includes('assignment')) {
            navigate(`/${role}/assignments`);
        } else if (type === 'attendance' || title.includes('attendance') || content.includes('attendance')) {
            navigate(`/${role}/attendance`);
        } else if (title.includes('marks') || content.includes('marks') || title.includes('result') || content.includes('result')) {
            navigate(role === 'student' ? '/student/results' : '/faculty/marks');
        } else if (type === 'leave' || title.includes('leave') || content.includes('leave')) {
            navigate(role === 'student' ? '/student/leave' : '/faculty/leave-requests');
        } else if (type === 'alert' || title.includes('alert') || title.includes('message')) {
            navigate(`/${role}/notifications`);
        } else {
            navigate(`/${role}/notifications`);
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
                                <div className="flex gap-2">
                                    <button
                                        onClick={markAsRead}
                                        className="text-xs font-bold text-[#0066CC] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 uppercase tracking-wider"
                                    >
                                        Mark all read
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button
                                        onClick={clearAll}
                                        className="text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider"
                                    >
                                        Clear
                                    </button>
                                </div>
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
                                            onClick={() => handleNotificationClick(n)}
                                            className={`p-4 border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
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

            {/* Success Message Toast */}
            <AnimatePresence>
                {showClearMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-semibold text-sm">Notifications cleared successfully!</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
