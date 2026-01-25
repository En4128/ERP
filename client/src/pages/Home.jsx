import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    GraduationCap,
    Users,
    BookOpen,
    Calendar,
    Award,
    TrendingUp,
    Shield,
    Zap,
    Clock,
    BarChart3,
    CheckCircle,
    ArrowRight,
    Sparkles,
    Globe,
    MessageSquare
} from 'lucide-react';
import { ParticleTextEffect } from '../components/ParticleTextEffect';

const Home = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        students: 0,
        faculty: 0,
        courses: 0,
        satisfaction: 0
    });

    // Animated counter effect
    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        const targets = {
            students: 5000,
            faculty: 250,
            courses: 150,
            satisfaction: 98
        };

        let step = 0;
        const timer = setInterval(() => {
            step++;
            setStats({
                students: Math.floor((targets.students / steps) * step),
                faculty: Math.floor((targets.faculty / steps) * step),
                courses: Math.floor((targets.courses / steps) * step),
                satisfaction: Math.floor((targets.satisfaction / steps) * step)
            });

            if (step >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, []);

    const features = [
        {
            icon: GraduationCap,
            title: 'Student Portal',
            description: 'Track attendance, view grades, access courses, and manage your academic journey seamlessly.',
            color: 'from-blue-500 to-cyan-500',
            highlights: ['Real-time Attendance', 'Grade Analytics', 'Course Management']
        },
        {
            icon: Users,
            title: 'Faculty Portal',
            description: 'Manage classes, mark attendance, grade assignments, and communicate with students effortlessly.',
            color: 'from-purple-500 to-pink-500',
            highlights: ['Attendance Marking', 'Grade Management', 'Student Analytics']
        },
        {
            icon: Shield,
            title: 'Admin Control',
            description: 'Complete system oversight with user management, course creation, and comprehensive analytics.',
            color: 'from-amber-500 to-orange-500',
            highlights: ['User Management', 'System Control', 'Analytics Dashboard']
        },
        {
            icon: Calendar,
            title: 'Smart Timetable',
            description: 'Dynamic scheduling with conflict detection and automated notifications for all users.',
            color: 'from-green-500 to-emerald-500',
            highlights: ['Auto Scheduling', 'Conflict Detection', 'Notifications']
        },
        {
            icon: BarChart3,
            title: 'Advanced Analytics',
            description: 'Comprehensive insights with interactive charts, heatmaps, and performance tracking.',
            color: 'from-red-500 to-rose-500',
            highlights: ['Performance Metrics', 'Visual Reports', 'Trend Analysis']
        },
        {
            icon: MessageSquare,
            title: 'Real-time Chat',
            description: 'Instant messaging between faculty and students for seamless communication.',
            color: 'from-indigo-500 to-blue-500',
            highlights: ['Instant Messaging', 'File Sharing', 'Group Chats']
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-purple-200 dark:border-purple-800 mb-8 shadow-lg"
                        >
                            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                                Next-Generation Campus Management
                            </span>
                        </motion.div>


                        {/* Particle Text Animation */}
                        <div className="mb-8">
                            <ParticleTextEffect
                                words={[
                                    'EduNex',
                                    'Smart ERP',
                                    'Student Portal',
                                    'Faculty Portal',
                                    'Admin Control',
                                    'Real-Time Chat',
                                    'Attendance Tracking',
                                    'Grade Management',
                                    'Course Registration',
                                    'Smart Timetable',
                                    'Analytics Dashboard',
                                    'Leave Management'
                                ]}
                                className="mx-auto"
                            />
                        </div>

                        {/* Subtitle */}
                        <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Revolutionize your educational institution with our comprehensive,
                            <span className="font-semibold text-purple-600 dark:text-purple-400"> AI-powered </span>
                            management platform designed for students, faculty, and administrators.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-2xl shadow-purple-500/50 dark:shadow-purple-500/30 transition-all duration-300 flex items-center gap-2"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl shadow-xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300"
                            >
                                Sign In
                            </motion.button>
                        </div>

                        {/* Trust Indicators */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-slate-600 dark:text-slate-400"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Secure & Encrypted</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Real-time Updates</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>24/7 Support</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
                                {stats.students.toLocaleString()}+
                            </div>
                            <div className="text-slate-600 dark:text-slate-400 font-medium">Active Students</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-center"
                        >
                            <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                                {stats.faculty}+
                            </div>
                            <div className="text-slate-600 dark:text-slate-400 font-medium">Faculty Members</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-2">
                                {stats.courses}+
                            </div>
                            <div className="text-slate-600 dark:text-slate-400 font-medium">Courses Offered</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="text-center"
                        >
                            <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
                                {stats.satisfaction}%
                            </div>
                            <div className="text-slate-600 dark:text-slate-400 font-medium">Satisfaction Rate</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">
                            Powerful Features for Everyone
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Comprehensive tools designed to streamline academic management and enhance the educational experience
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden"
                                >
                                    {/* Gradient Background on Hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                                    {/* Icon */}
                                    <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="relative text-2xl font-bold text-slate-800 dark:text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="relative text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                                        {feature.description}
                                    </p>

                                    {/* Highlights */}
                                    <div className="relative space-y-2">
                                        {feature.highlights.map((highlight, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.color}`}></div>
                                                <span>{highlight}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-900 dark:to-blue-900"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
                            Ready to Transform Your Campus?
                        </h2>
                        <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
                            Join thousands of institutions already using EduNex to streamline their operations and enhance student success.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/login')}
                            className="px-10 py-5 bg-white text-purple-600 font-bold rounded-xl shadow-2xl hover:shadow-white/20 transition-all duration-300 text-lg flex items-center gap-3 mx-auto"
                        >
                            Get Started Today
                            <Zap className="w-6 h-6" />
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-purple-500" />
                            <span className="text-white font-bold text-lg">EduNex</span>
                        </div>

                        <div className="text-sm text-center md:text-left">
                            © 2026 EduNex. All rights reserved. Built with ❤️ for education.
                        </div>

                        <div className="flex gap-6">
                            <Globe className="w-5 h-5 hover:text-purple-400 cursor-pointer transition-colors" />
                            <MessageSquare className="w-5 h-5 hover:text-purple-400 cursor-pointer transition-colors" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
