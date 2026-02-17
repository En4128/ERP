import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { SidebarProvider, useSidebar } from './Sidebar';
import ChatbotWidget from './ChatbotWidget';
import NotificationBell from './NotificationBell';
import { Menu, Moon, Sun, Settings, LogOut, User, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

const LayoutContent = ({ children, role }) => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const { setOpen } = useSidebar();
    const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [profileImage, setProfileImage] = useState('');

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const endpoint = role === 'student' ? '/api/student/profile' : role === 'faculty' ? '/api/faculty/profile' : null;
                if (!endpoint) return;

                const res = await axios.get(`http://localhost:5000${endpoint}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = res.data.user || res.data;
                const name = data.name;
                const image = data.profileImage;
                const id = data._id;

                if (name) {
                    setUserName(name);
                    localStorage.setItem('userName', name);
                }
                if (image) {
                    setProfileImage(image);
                }
                if (id) {
                    setUserId(id);
                }
            } catch (err) {
                console.error("Error fetching profile in layout:", err);
            }
        };

        fetchProfile();
    }, [role]);

    // Notification Logic (Socket & Push)
    useEffect(() => {
        if (!userId) return;

        // 1. Socket.io Connection
        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
            console.log('Connected to socket server');
            socket.emit('join', userId);
        });

        socket.on('notification', (data) => {
            toast(data.title, {
                description: data.message,
                action: {
                    label: 'View',
                    onClick: () => navigate(`/${role}/notifications`)
                }
            });

            // Play notification sound if available
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed', e)); // Silent fail
        });

        // 2. Web Push Subscription
        const subscribeToPush = async () => {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    const register = await navigator.serviceWorker.register('/sw.js');

                    // Get VAPID Key
                    const token = localStorage.getItem('token');
                    const keyRes = await axios.get('http://localhost:5000/api/notifications/vapid-key', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const publicVapidKey = keyRes.data.publicKey;

                    if (!publicVapidKey) return;

                    const subscription = await register.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                    });

                    await axios.post('http://localhost:5000/api/notifications/subscribe', subscription, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log('Push Notification Subscribed');

                } catch (error) {
                    console.error('Push Subscription Error:', error);
                }
            }
        };

        subscribeToPush();

        return () => {
            socket.disconnect();
        };

    }, [userId, role, navigate]);

    // Helper for VAPID key conversion
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    const user = { name: userName, role: role || 'Student' };

    return (
        <div className="flex flex-col md:flex-row bg-[#F5F7FA] dark:bg-slate-950 min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100 transition-colors duration-300">
            <div className="md:sticky md:top-0 md:h-screen z-50">
                <Sidebar role={role} />
            </div>
            <div className="flex-1 flex flex-col">
                {/* Header Container */}
                <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800 transition-all duration-300">
                    {/* Row 1: Brand (Mobile Only) */}
                    <div className="md:hidden h-14 bg-slate-900 border-b border-white/5 flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-slate-800 rounded-lg shadow-lg border border-white/10">
                                <img src="/logo-light.jpg" alt="Logo" className="w-5 h-5 object-contain" />
                            </div>
                            <h1 className="font-black text-white tracking-widest uppercase text-xs">LearNex</h1>
                        </div>
                        <button
                            onClick={() => setOpen(true)}
                            className="p-2 text-white/50 hover:text-white transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                    </div>

                    {/* Row 2: Greeting & Actions */}
                    <div className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 p-3 md:p-4 flex justify-between items-center px-4 md:px-8">
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <div className="w-1 md:w-1.5 h-8 bg-blue-600 dark:bg-blue-500 rounded-full md:block hidden"></div>
                            <div>
                                <h2 className="text-sm md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-300">
                                    Welcome, <span className="text-[#0066CC] dark:text-blue-400">{user.name.split(' ')[0]}</span>
                                </h2>
                                <p className="text-[10px] md:text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider leading-none mt-0.5">Academic Portal</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 md:space-x-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-500 dark:text-cyan-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300 dark:shadow-[0_0_15px_-3px_rgba(34,211,238,0.2)] bg-slate-50 dark:bg-slate-800/50"
                            >
                                {isDarkMode ? <Sun size={18} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" /> : <Moon size={18} />}
                            </button>

                            <NotificationBell role={role} />

                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center cursor-pointer hover:scale-105 transition-all outline-none"
                                >
                                    <div className="relative">
                                        <img
                                            src={profileImage ? `http://localhost:5000${profileImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0066CC&color=fff&rounded=true`}
                                            alt="Profile"
                                            className="w-9 h-9 md:w-10 md:h-10 rounded-full shadow-[0_0_15px_rgba(0,102,204,0.3)] border-2 border-white dark:border-slate-800 object-cover"
                                        />
                                    </div>
                                    <div className="hidden md:block text-right ml-3">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 leading-tight">{user.name}</p>
                                        <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">{user.role}</p>
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsDropdownOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 z-50 overflow-hidden"
                                            >
                                                <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{user.role}</p>
                                                </div>
                                                <div className="p-2">
                                                    <button
                                                        onClick={() => {
                                                            setIsDropdownOpen(false);
                                                            navigate(user.role === 'faculty' ? '/faculty/profile' : '/student/profile');
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                                    >
                                                        <Settings size={16} /> Settings
                                                    </button>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                                                    >
                                                        <LogOut size={16} /> Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 relative z-0">
                    {/* Content Background Decor */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-50/50 dark:from-teal-900/20 to-transparent pointer-events-none -z-10"></div>

                    <div className="mx-auto max-w-7xl animate-fade-in-up">
                        {children}
                    </div>
                </main>

                <ChatbotWidget />
            </div>
        </div>
    );
};

const Layout = (props) => {
    return (
        <SidebarProvider>
            <LayoutContent {...props} />
        </SidebarProvider>
    );
};

export default Layout;
