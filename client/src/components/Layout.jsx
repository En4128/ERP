import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatbotWidget from './ChatbotWidget';
import NotificationBell from './NotificationBell';
import { Search, Menu, Moon, Sun } from 'lucide-react';
import axios from 'axios';

const Layout = ({ children, role }) => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');

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

    useEffect(() => {
        const fetchProfile = async () => {
            const storedName = localStorage.getItem('userName');
            if (storedName) {
                setUserName(storedName);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const endpoint = role === 'student' ? '/api/student/profile' : role === 'faculty' ? '/api/faculty/profile' : null;
                if (!endpoint) return;

                const res = await axios.get(`http://localhost:5000${endpoint}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const name = res.data.user?.name || res.data.name;
                if (name) {
                    setUserName(name);
                    localStorage.setItem('userName', name);
                }
            } catch (err) {
                console.error("Error fetching name in layout:", err);
            }
        };

        fetchProfile();
    }, [role]);

    const user = { name: userName, role: role || 'Student' };

    return (
        <div className="flex flex-col md:flex-row bg-gray-50 dark:bg-slate-950 min-h-screen font-sans selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100 transition-colors duration-300 overflow-hidden">
            <Sidebar role={role} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-slate-800 p-4 sticky top-0 z-30 flex justify-between items-center px-8 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-300">
                                Welcome Back, <span className="text-indigo-600 dark:text-indigo-400 drop-shadow-sm">{user.name}</span>
                            </h2>
                            <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Have a productive day!</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-slate-500 group-focus-within:text-teal-500 dark:group-focus-within:text-cyan-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search courses, docs..."
                                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-sm w-64 focus:ring-2 focus:ring-teal-500 dark:focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-300 placeholder-gray-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-200"
                            />
                        </div>

                        <div className="w-px h-8 bg-gray-200 dark:bg-slate-800 mx-2"></div>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 dark:text-cyan-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <NotificationBell />

                        <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-1.5 rounded-full transition-colors pr-3" onClick={handleLogout}>
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} alt="Profile" className="w-9 h-9 rounded-full shadow-sm border-2 border-white dark:border-slate-700 ring-2 ring-gray-100 dark:ring-slate-800" />
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 leading-tight">{user.name}</p>
                                <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">{user.role}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-8 overflow-y-auto relative z-0 scroll-smooth">
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

export default Layout;
