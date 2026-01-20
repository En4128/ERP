import React, { useState, createContext, useContext } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LayoutDashboard, Calendar, FileText, CheckSquare, MessageSquare, Award, Briefcase, File, LogOut, Users, Bell, UserCircle, Clock, CreditCard } from "lucide-react";
import { cn } from "../lib/utils";

// Context for Sidebar state
const SidebarContext = createContext(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true,
}) => {
    const [openState, setOpenState] = useState(false);
    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate }}>
            {children}
        </SidebarContext.Provider>
    );
};

const Sidebar = ({ children, open, setOpen, animate }) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    );
};

const SidebarBody = (props) => {
    return (
        <>
            <DesktopSidebar {...props} />
            <MobileSidebar {...props} />
        </>
    );
};

const DesktopSidebar = ({ className, children, ...props }) => {
    const { open, setOpen, animate } = useSidebar();
    return (
        <motion.div
            className={cn(
                "h-full px-4 py-2 hidden md:flex md:flex-col bg-slate-100 dark:bg-slate-900 w-[300px] flex-shrink-0 border-r border-slate-200 dark:border-slate-800",
                className
            )}
            animate={{
                width: animate ? (open ? "300px" : "80px") : "300px",
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

const MobileSidebar = ({ className, children, ...props }) => {
    const { open, setOpen } = useSidebar();
    return (
        <div
            className={cn(
                "h-16 px-6 py-4 flex flex-row md:hidden items-center justify-between bg-slate-100 dark:bg-slate-900 w-full border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50"
            )}
            {...props}
        >
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                    <LayoutDashboard className="text-white w-5 h-5" />
                </div>
                <h1 className="font-black text-slate-800 dark:text-white tracking-tight uppercase text-xs">Campus Connect</h1>
            </div>
            <div className="flex justify-end z-[60]">
                <Menu
                    className="text-slate-800 dark:text-slate-200 cursor-pointer"
                    onClick={() => setOpen(!open)}
                />
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-100%", opacity: 0 }}
                        transition={{
                            duration: 0.3,
                            ease: "easeInOut",
                        }}
                        className={cn(
                            "fixed h-screen w-full inset-0 bg-white dark:bg-slate-950 p-10 z-[100] flex flex-col justify-between",
                            className
                        )}
                    >
                        <div
                            className="absolute right-10 top-10 z-50 text-slate-800 dark:text-slate-200 cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors"
                            onClick={() => setOpen(!open)}
                        >
                            <X size={24} />
                        </div>
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SidebarLink = ({ link, className, ...props }) => {
    const { open, animate } = useSidebar();
    const location = useLocation();
    const isActive = location.pathname === link.path;

    return (
        <Link
            to={link.path}
            className={cn(
                "flex items-center justify-start gap-3 group/sidebar px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                    ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-bold border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50",
                className
            )}
            {...props}
        >
            <span className={cn(
                "flex-shrink-0 transition-colors duration-200",
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-600"
            )}>
                {link.icon}
            </span>
            <motion.span
                animate={{
                    display: animate ? (open ? "inline-block" : "none") : "inline-block",
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className="text-sm transition duration-150 whitespace-pre inline-block !p-0 !m-0 overflow-hidden"
            >
                {link.name}
            </motion.span>
        </Link>
    );
};

// Main Exported Component that uses the structure above
const SidebarComponent = ({ role }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const links = {
        student: [
            { name: 'Dashboard', path: '/student', icon: <LayoutDashboard size={20} /> },
            { name: 'Attendance', path: '/student/attendance', icon: <CheckSquare size={20} /> },
            { name: 'Courses', path: '/student/courses', icon: <FileText size={20} /> },
            { name: 'Timetable', path: '/student/timetable', icon: <Calendar size={20} /> },
            { name: 'Exam Schedule', path: '/student/exams', icon: <Clock size={20} /> },
            { name: 'Marks & Results', path: '/student/results', icon: <Award size={20} /> },
            { name: 'Fees & Payments', path: '/student/fees', icon: <CreditCard size={20} /> },
            { name: 'Faculty Info', path: '/student/faculty', icon: <Users size={20} /> },
            { name: 'Placements', path: '/student/placements', icon: <Briefcase size={20} /> },
            { name: 'Notifications', path: '/student/notifications', icon: <Bell size={20} /> },
            { name: 'Leave Management', path: '/student/leave', icon: <Briefcase size={20} /> },
            { name: 'My Profile', path: '/student/profile', icon: <UserCircle size={20} /> },
        ],
        faculty: [
            { name: 'Dashboard', path: '/faculty', icon: <LayoutDashboard size={20} /> },
            { name: 'Attendance', path: '/faculty/attendance', icon: <CheckSquare size={20} /> },
            { name: 'My Courses', path: '/faculty/courses', icon: <FileText size={20} /> },
            { name: 'Manage Students', path: '/faculty/students', icon: <Users size={20} /> },
            { name: 'Timetable', path: '/faculty/timetable', icon: <Calendar size={20} /> },
            { name: 'Exam Schedule', path: '/faculty/exams', icon: <Clock size={20} /> },
            { name: 'Marks Management', path: '/faculty/marks', icon: <Award size={20} /> },
            { name: 'Documents', path: '/faculty/documents', icon: <File size={20} /> },
            { name: 'Leave Requests', path: '/faculty/leave-requests', icon: <Briefcase size={20} /> },
            { name: 'Notifications', path: '/faculty/notifications', icon: <Bell size={20} /> },
            { name: 'My Profile', path: '/faculty/profile', icon: <UserCircle size={20} /> },
        ],
        admin: [
            { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
            { name: 'Manage Students', path: '/admin/students', icon: <Users size={20} /> },
            { name: 'Manage Faculty', path: '/admin/faculty', icon: <CheckSquare size={20} /> },
            { name: 'Manage Exams', path: '/admin/exams', icon: <Clock size={20} /> },
            { name: 'Announcements', path: '/admin/notifications', icon: <Bell size={20} /> },
            { name: 'Manage Courses', path: '/admin/courses', icon: <FileText size={20} /> },
            { name: 'Timetables', path: '/admin/timetables', icon: <Calendar size={20} /> },
            { name: 'Placements', path: '/admin/placements', icon: <Briefcase size={20} /> },
        ],
    };

    const currentLinks = links[role] || [];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    return (
        <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10">
                <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar pt-2">
                    {/* Brand */}
                    <div className="flex items-center gap-3 px-3 py-4 mb-2">
                        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 flex-shrink-0">
                            <LayoutDashboard className="text-white w-6 h-6" />
                        </div>
                        <AnimatePresence mode="wait">
                            {open && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex flex-col overflow-hidden whitespace-nowrap"
                                >
                                    <h2 className="font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight text-sm">Campus Connect</h2>
                                    <p className="text-[10px] text-indigo-500 font-black tracking-widest uppercase">{role} PORTAL</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="mt-8 flex flex-col gap-2">
                        {currentLinks.map((link, idx) => (
                            <SidebarLink key={idx} link={link} />
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col gap-2 pb-2">
                    <SidebarLink
                        link={{
                            name: 'Help & Support',
                            path: '/student/support',
                            icon: <MessageSquare size={20} />
                        }}
                    />
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-start gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all duration-200 group/logout overflow-hidden w-full"
                    >
                        <LogOut size={20} className="flex-shrink-0 group-hover/logout:rotate-12 transition-transform" />
                        <AnimatePresence mode="wait">
                            {open && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="text-sm font-bold whitespace-nowrap"
                                >
                                    Sign Out
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>

                    {/* Profile Minified */}
                    <div className="mt-2 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 px-2 overflow-hidden">
                        <img
                            src={`https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`}
                            className="h-8 w-8 flex-shrink-0 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"
                            alt="Avatar"
                        />
                        <AnimatePresence mode="wait">
                            {open && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex flex-col overflow-hidden"
                                >
                                    <span className="text-sm font-black text-slate-800 dark:text-white truncate">Connected</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{role}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </SidebarBody>
        </Sidebar>
    );
};

export default SidebarComponent;
