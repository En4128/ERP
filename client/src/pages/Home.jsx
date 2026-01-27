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
    MessageSquare,
    ChevronDown
} from 'lucide-react';
import { useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ParticleTextEffect } from '../components/ParticleTextEffect';

const Home = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        students: 0,
        faculty: 0,
        courses: 0,
        satisfaction: 0
    });

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    // Animated counter effect
    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        const targets = {
            students: 15000,
            faculty: 450,
            courses: 200,
            satisfaction: 99
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
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const FloatingElement = ({ delay = 0, className = "" }) => (
        <motion.div
            animate={{
                y: [0, -20, 0],
                rotate: [0, 10, 0],
                scale: [1, 1.1, 1],
            }}
            transition={{
                duration: 5,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
            className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
        />
    );

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-purple-500/30">
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 z-50 origin-[0%]"
                style={{ scaleX }}
            />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <FloatingElement delay={0} className="w-96 h-96 -top-20 -left-20 bg-purple-500" />
                    <FloatingElement delay={1} className="w-[500px] h-[500px] top-1/2 -right-20 bg-blue-500" />
                    <FloatingElement delay={2} className="w-80 h-80 bottom-0 left-1/4 bg-cyan-500" />

                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTI0LCA1OCwgMjM3LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] mask-image-[radial-gradient(ellipse_at_center,black,transparent)] opacity-50" />
                </div>

                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10"
                >
                    <div className="text-center">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-purple-200/50 dark:border-purple-800/50 mb-8 shadow-xl"
                        >
                            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                            <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                                DISCOVER THE FUTURE OF LEARNING
                            </span>
                        </motion.div>

                        {/* Particle Text Animation */}
                        <div className="mb-8 cursor-default">
                            <ParticleTextEffect
                                words={[
                                    'LearNex',
                                    'Smart ERP',
                                    'Innovation',
                                    'Analytics',
                                    'Efficiency',
                                    'Future Ready'
                                ]}
                                className="mx-auto"
                            />
                        </div>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl sm:text-3xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
                        >
                            Empowering academic excellence through
                            <span className="relative inline-block mx-2">
                                <span className="relative z-10 font-bold text-purple-600 dark:text-purple-400 italic">Advanced Intelligence</span>
                                <motion.span
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ delay: 1, duration: 0.8 }}
                                    className="absolute bottom-1 left-0 h-3 bg-purple-500/10 dark:bg-purple-500/20 -rotate-1"
                                />
                            </span>
                            for the next generation.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(124, 58, 237, 0.5)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-3"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative flex items-center gap-3">
                                    Sign In
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </motion.button>

                        </motion.div>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 flex flex-col items-center gap-2"
                >
                    <span className="text-xs font-semibold uppercase tracking-widest">Scroll to explore</span>
                    <ChevronDown className="w-6 h-6" />
                </motion.div>
            </section>

            {/* Statistics Section */}
            <section className="py-32 relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { label: 'Active Students', value: stats.students, color: 'from-blue-600 to-cyan-600', icon: Users },
                            { label: 'Expert Faculty', value: stats.faculty, color: 'from-purple-600 to-pink-600', icon: GraduationCap },
                            { label: 'Smart Courses', value: stats.courses, color: 'from-amber-600 to-orange-600', icon: BookOpen },
                            { label: 'Satisfaction Rate', value: stats.satisfaction, color: 'from-green-600 to-emerald-600', icon: Award, suffix: '%' }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-700/50"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
                                <div className={`w-12 h-12 mb-6 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg transform group-hover:rotate-12 transition-transform duration-500`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className={`text-4xl sm:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 tabular-nums`}>
                                    {stat.value.toLocaleString()}{stat.suffix || '+'}
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-sm">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-5xl sm:text-6xl font-black text-slate-800 dark:text-white mb-6 tracking-tight">
                            Engineered for <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Excellence</span>
                        </h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                            A complete suite of modules designed to handle every aspect of modern campus administration with precision.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
                    >
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{
                                        y: -15,
                                        scale: 1.02,
                                        rotateX: 2,
                                        rotateY: 2,
                                        transition: { duration: 0.2 }
                                    }}
                                    className="group relative bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-[2rem] p-10 shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700/50 overflow-hidden"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />

                                    {/* Feature Icon */}
                                    <div className={`relative w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${feature.color} flex items-center justify-center mb-8 shadow-2xl transform group-hover:scale-110 transition-transform duration-500`}>
                                        <Icon className="w-10 h-10 text-white" />
                                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-[1.5rem]" />
                                    </div>

                                    {/* Feature Content */}
                                    <h3 className="relative text-2xl font-black text-slate-800 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="relative text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-lg">
                                        {feature.description}
                                    </p>

                                    {/* Highlights */}
                                    <div className="relative grid grid-cols-1 gap-4">
                                        {feature.highlights.map((highlight, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm">
                                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color} shadow-lg`} />
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{highlight}</span>
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
            <section className="py-32 px-4 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto relative rounded-[3rem] overflow-hidden bg-slate-900 dark:bg-purple-900/20 border border-white/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTSAzMCAwIEwgMzAgNjAgTSAwIDMwIEwgNjAgMzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] " />

                    <div className="relative py-24 px-8 text-center">
                        <h2 className="text-5xl sm:text-6xl font-black text-white mb-8 tracking-tighter">
                            Ready to Elevate Your <br />
                            <span className="text-purple-400">Educational Experience?</span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-light">
                            Join the technological revolution in education. Get started with LearNex today and see the difference.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="px-12 py-5 bg-white text-slate-900 font-black rounded-2xl shadow-2xl flex items-center gap-3 hover:bg-purple-50 transition-colors mx-auto sm:mx-0"
                            >
                                Get Started Now
                                <Zap className="w-6 h-6 text-purple-600" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-white font-black text-3xl tracking-tighter">LearNex</span>
                            </div>
                            <p className="text-lg max-w-sm mb-8 leading-relaxed">
                                The ultimate ecosystem for modern educational institutions.
                                Seamless, secure, and smart management for the future of learning.
                            </p>
                            <div className="flex gap-4">
                                {[Globe, MessageSquare, Users].map((Icon, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -5, color: '#a855f7' }}
                                        className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center cursor-pointer transition-colors"
                                    >
                                        <Icon className="w-6 h-6" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Product</h4>
                            <ul className="space-y-4 font-medium">
                                <li className="hover:text-purple-400 cursor-pointer transition-colors">Features</li>
                                <li className="hover:text-purple-400 cursor-pointer transition-colors">Solutions</li>
                                <li className="hover:text-purple-400 cursor-pointer transition-colors">Integrations</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Company</h4>
                            <ul className="space-y-4 font-medium">
                                <li className="hover:text-purple-400 cursor-pointer transition-colors">About Us</li>
                                <li className="hover:text-purple-400 cursor-pointer transition-colors">Privacy Policy</li>
                                <li className="hover:text-purple-400 cursor-pointer transition-colors">Contact</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-sm font-medium">
                            © 2026 LearNex. Precision engineered for education. All rights reserved.
                        </div>
                        <div className="flex gap-8 text-sm font-bold uppercase tracking-widest">
                            <span className="hover:text-purple-400 cursor-pointer">Support</span>
                            <span className="hover:text-purple-400 cursor-pointer">Terms</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
