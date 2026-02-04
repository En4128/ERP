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
import { ModernBackground } from '../components/ModernBackground';
import { FloatingShapes } from '../components/FloatingShapes';
import { MagneticButton } from '../components/MagneticButton';

const Home = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        students: 0,
        faculty: 0,
        courses: 0,
        satisfaction: 0
    });
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Track mouse position for parallax effects
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

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
            color: 'from-blue-600 to-indigo-600',
            highlights: ['Real-time Attendance', 'Grade Analytics', 'Course Management']
        },
        {
            icon: Users,
            title: 'Faculty Portal',
            description: 'Manage classes, mark attendance, grade assignments, and communicate with students effortlessly.',
            color: 'from-purple-600 to-indigo-600',
            highlights: ['Attendance Marking', 'Grade Management', 'Student Analytics']
        },
        {
            icon: Shield,
            title: 'Admin Control',
            description: 'Complete system oversight with user management, course creation, and comprehensive analytics.',
            color: 'from-indigo-600 to-slate-800',
            highlights: ['User Management', 'System Control', 'Analytics Dashboard']
        },
        {
            icon: Calendar,
            title: 'Smart Timetable',
            description: 'Dynamic scheduling with conflict detection and automated notifications for all users.',
            color: 'from-blue-700 to-indigo-700',
            highlights: ['Auto Scheduling', 'Conflict Detection', 'Notifications']
        },
        {
            icon: BarChart3,
            title: 'Advanced Analytics',
            description: 'Comprehensive insights with interactive charts, heatmaps, and performance tracking.',
            color: 'from-purple-700 to-blue-700',
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

    return (
        <div className="min-h-screen selection:bg-blue-500/20 overflow-x-hidden relative" style={{ background: '#0F1419' }}>
            <ModernBackground />
            <FloatingShapes />

            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#60A5FA] via-[#818CF8] to-[#22D3EE] z-[100] origin-[0%] shadow-[0_0_20px_rgba(96,165,250,0.4)]"
                style={{ scaleX }}
            />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
                {/* Content Container */}

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
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#242B3D] backdrop-blur-md border border-[#3D4556] mb-8 shadow-[0_0_20px_rgba(96,165,250,0.15)]"
                        >
                            <Sparkles className="w-4 h-4 text-[#60A5FA] animate-pulse" />
                            <span className="text-sm font-bold bg-gradient-to-r from-[#60A5FA] to-[#22D3EE] bg-clip-text text-transparent">
                                DISCOVER THE FUTURE OF LEARNING
                            </span>
                        </motion.div>

                        {/* Particle Text Animation */}
                        <div className="mb-12 cursor-default relative group">
                            <div className="absolute inset-0 bg-[#60A5FA]/20 blur-[120px] group-hover:bg-[#60A5FA]/30 transition-all duration-500 rounded-full animate-pulse-slow" />
                            <ParticleTextEffect
                                words={[
                                    'Welcome to',
                                    'LearNex',
                                    'Smart ERP',
                                    'Analytics',
                                    'Efficiency',
                                    'Future Ready'
                                ]}
                                className="mx-auto relative z-10"
                            />
                        </div>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl sm:text-2xl text-slate-400 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
                        >
                            Empowering academic excellence through
                            <span className="relative inline-block mx-2">
                                <span className="relative z-10 font-bold text-white italic drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">Advanced Intelligence</span>
                                <motion.span
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ delay: 1, duration: 0.8 }}
                                    className="absolute bottom-1 left-0 h-2 bg-purple-600/30 -rotate-1"
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
                            <MagneticButton
                                onClick={() => navigate('/login')}
                                className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-[#60A5FA] to-[#818CF8] text-[#0F1419] font-bold rounded-2xl shadow-[0_0_30px_rgba(96,165,250,0.4)] hover:shadow-[0_0_40px_rgba(96,165,250,0.6)] transition-all duration-300 flex items-center gap-3"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#93C5FD]/20 to-[#A78BFA]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative flex items-center gap-3 text-lg font-black">
                                    Get Started
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </MagneticButton>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 flex flex-col items-center gap-2"
                >

                </motion.div>
            </section>

            {/* Statistics Section */}
            <section className="py-32 relative overflow-hidden" style={{ background: '#0F1419' }}>
                <div className="absolute inset-0 bg-[#60A5FA]/10 blur-[150px] rounded-full -translate-y-1/2 animate-pulse-slow" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { label: 'Active Students', value: stats.students, color: 'from-[#60A5FA] to-[#22D3EE]', glow: 'shadow-[#60A5FA]/20', icon: Users },
                            { label: 'Expert Faculty', value: stats.faculty, color: 'from-[#A78BFA] to-[#FB7185]', glow: 'shadow-[#A78BFA]/20', icon: GraduationCap },
                            { label: 'Smart Courses', value: stats.courses, color: 'from-[#FBBF24] to-[#FCD34D]', glow: 'shadow-[#FBBF24]/20', icon: BookOpen },
                            { label: 'Satisfaction Rate', value: stats.satisfaction, color: 'from-[#34D399] to-[#6EE7B7]', glow: 'shadow-[#34D399]/20', icon: Award, suffix: '%' }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: idx * 0.1, duration: 0.8 }}
                                whileHover={{ y: -10, scale: 1.05 }}
                                className="group relative p-8 rounded-3xl bg-gradient-to-br from-[#1A1F2E] to-[#242B3D] backdrop-blur-xl border border-[#3D4556] hover:border-[#60A5FA]/40 transition-all duration-500 shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_0_40px_rgba(96,165,250,0.3)]"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl blur-xl`} />
                                <div className={`w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform duration-500`}>
                                    <stat.icon className="w-7 h-7" />
                                </div>
                                <div className={`text-4xl sm:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 tabular-nums drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]`}>
                                    {stat.value.toLocaleString()}{stat.suffix || '+'}
                                </div>
                                <div className="text-[#868D9D] font-bold uppercase tracking-wider text-xs">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 relative overflow-hidden" style={{ background: '#0F1419' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-5xl sm:text-7xl font-black text-[#E8EAED] mb-6 tracking-tight drop-shadow-[0_0_40px_rgba(96,165,250,0.3)]">
                            Engineered for <span className="bg-gradient-to-r from-[#60A5FA] to-[#22D3EE] bg-clip-text text-transparent animate-gradient-x">Excellence</span>
                        </h2>
                        <p className="text-xl text-[#B8BDC6] max-w-2xl mx-auto font-light leading-relaxed">
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
                                        y: -20,
                                        scale: 1.05,
                                        rotateX: 5,
                                        rotateY: 5,
                                        transition: { duration: 0.3 }
                                    }}
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        perspective: '1000px'
                                    }}
                                    className="group relative bg-gradient-to-br from-[#1A1F2E] to-[#242B3D] backdrop-blur-md rounded-[2.5rem] p-10 shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_0_60px_rgba(96,165,250,0.3)] transition-all duration-300 border border-[#3D4556] hover:border-[#60A5FA]/40 overflow-hidden"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-15 transition-opacity duration-500 blur-3xl`} />
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#60A5FA]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Feature Icon */}
                                    <div className={`relative w-20 h-20 rounded-[1.8rem] bg-gradient-to-br ${feature.color} flex items-center justify-center mb-8 shadow-2xl transform group-hover:rotate-[10deg] transition-all duration-500`}>
                                        <Icon className="w-10 h-10 text-white" />
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.8rem]" />
                                    </div>

                                    {/* Feature Content */}
                                    <h3 className="relative text-2xl font-black text-[#E8EAED] mb-4 group-hover:text-[#60A5FA] transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="relative text-[#B8BDC6] mb-8 leading-relaxed text-lg font-light">
                                        {feature.description}
                                    </p>

                                    {/* Highlights */}
                                    <div className="relative grid grid-cols-1 gap-3">
                                        {feature.highlights.map((highlight, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-[#242B3D] border border-[#3D4556] group-hover:bg-[#2D3548] transition-colors">
                                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color} shadow-[0_0_10px_rgba(96,165,250,0.5)]`} />
                                                <span className="text-sm font-bold text-[#B8BDC6]">{highlight}</span>
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
            <section className="py-32 px-4 relative overflow-hidden" style={{ background: '#0F1419' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#60A5FA]/70 to-transparent shadow-[0_0_20px_rgba(96,165,250,0.5)]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto relative rounded-[4rem] overflow-hidden bg-gradient-to-br from-[#1A1F2E] to-[#242B3D] border border-[#60A5FA]/30 backdrop-blur-3xl shadow-[0_0_80px_rgba(96,165,250,0.2)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#60A5FA]/20 via-transparent to-[#22D3EE]/20 blur-[120px] animate-pulse-slow" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTSAzMCAwIEwgMzAgNjAgTSAwIDMwIEwgNjAgMzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] " />

                    <div className="relative py-24 px-8 text-center">
                        <h2 className="text-5xl sm:text-7xl font-black text-[#E8EAED] mb-8 tracking-tighter drop-shadow-[0_0_30px_rgba(96,165,250,0.3)]">
                            Ready to Elevate Your <br />
                            <span className="bg-gradient-to-r from-[#60A5FA] to-[#22D3EE] bg-clip-text text-transparent">Educational Experience?</span>
                        </h2>
                        <p className="text-xl text-[#B8BDC6] mb-12 max-w-2xl mx-auto font-light">
                            Join the technological revolution in education. Get started with LearNex today and see the difference.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <MagneticButton
                                onClick={() => navigate('/login')}
                                className="px-12 py-5 bg-gradient-to-r from-[#60A5FA] to-[#818CF8] text-[#0F1419] font-black rounded-2xl shadow-[0_0_40px_rgba(96,165,250,0.4)] hover:shadow-[0_0_60px_rgba(96,165,250,0.6)] flex items-center gap-3 hover:from-[#93C5FD] hover:to-[#A78BFA] transition-all mx-auto sm:mx-0 text-lg"
                            >
                                Get Started Now
                                <Zap className="w-6 h-6 text-[#0F1419]" />
                            </MagneticButton>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="text-[#868D9D] py-20 border-t border-[#3D4556] relative overflow-hidden" style={{ background: '#0F1419' }}>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#60A5FA] via-[#818CF8] to-[#22D3EE] opacity-70 shadow-[0_0_20px_rgba(96,165,250,0.4)]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-gradient-to-br from-[#60A5FA] to-[#818CF8] rounded-2xl shadow-[0_0_20px_rgba(96,165,250,0.4)]">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-[#E8EAED] font-black text-4xl tracking-tighter">LearNex</span>
                            </div>
                            <p className="text-lg max-w-sm mb-8 leading-relaxed font-light">
                                The ultimate ecosystem for modern educational institutions.
                                Seamless, secure, and smart management for the future of learning.
                            </p>
                            <div className="flex gap-4">
                                {[Globe, MessageSquare, Users].map((Icon, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -5, color: '#E8EAED', backgroundColor: 'rgba(96, 165, 250, 0.1)' }}
                                        className="w-12 h-12 rounded-2xl bg-[#242B3D] flex items-center justify-center cursor-pointer transition-all border border-[#3D4556] hover:border-[#60A5FA]/40"
                                    >
                                        <Icon className="w-6 h-6" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[#E8EAED] font-bold mb-6 uppercase tracking-widest text-xs">Product</h4>
                            <ul className="space-y-4 font-medium text-sm">
                                <li className="hover:text-[#60A5FA] cursor-pointer transition-colors">Features</li>
                                <li className="hover:text-[#60A5FA] cursor-pointer transition-colors">Solutions</li>
                                <li className="hover:text-[#60A5FA] cursor-pointer transition-colors">Integrations</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-[#E8EAED] font-bold mb-6 uppercase tracking-widest text-xs">Company</h4>
                            <ul className="space-y-4 font-medium text-sm">
                                <li className="hover:text-[#60A5FA] cursor-pointer transition-colors">About Us</li>
                                <li className="hover:text-[#60A5FA] cursor-pointer transition-colors">Privacy Policy</li>
                                <li className="hover:text-[#60A5FA] cursor-pointer transition-colors">Contact</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[#3D4556] flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-xs font-medium tracking-wide text-[#868D9D]">
                            © 2026 LearNex. Precision engineered for education. All rights reserved.
                        </div>
                        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-[#868D9D]">
                            <span className="hover:text-[#60A5FA] cursor-pointer transition-colors">Support</span>
                            <span className="hover:text-[#60A5FA] cursor-pointer transition-colors">Terms</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;