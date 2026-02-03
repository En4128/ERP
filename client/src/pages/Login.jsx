import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Mail, Lock, ChevronRight, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// --- Background Components ---

const Stars = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white rounded-full"
                    style={{
                        width: Math.random() * 2 + 1 + 'px',
                        height: Math.random() * 2 + 1 + 'px',
                        top: Math.random() * 100 + '%',
                        left: Math.random() * 100 + '%',
                    }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

const BokehNebula = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full blur-[100px] opacity-20"
                    style={{
                        width: '40vw',
                        height: '40vw',
                        backgroundColor: i % 2 === 0 ? '#312e81' : '#1e3a8a',
                        top: (Math.random() * 100 - 20) + '%',
                        left: (Math.random() * 100 - 20) + '%',
                    }}
                    animate={{
                        x: [0, 100, -100, 0],
                        y: [0, -100, 100, 0],
                        scale: [1, 1.2, 0.8, 1],
                    }}
                    transition={{
                        duration: 20 + i * 5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

const UpwardParticles = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-indigo-400/20 rounded-full"
                    initial={{ y: '110vh', x: Math.random() * 100 + 'vw', opacity: 0 }}
                    animate={{ y: '-10vh', opacity: [0, 0.5, 0] }}
                    transition={{
                        duration: 10 + Math.random() * 15,
                        repeat: Infinity,
                        delay: Math.random() * 10,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

// --- Form Sub-components ---

const AdvancedInput = ({ label, icon: Icon, type, value, onChange, placeholder, required }) => {
    const [isFocused, setIsFocused] = useState(false);
    const id = label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="relative pt-6 group">
            <motion.label
                htmlFor={id}
                className="absolute left-12 font-medium pointer-events-none transition-all duration-300"
                initial={false}
                animate={{
                    y: (isFocused || value) ? -28 : 12,
                    x: (isFocused || value) ? -44 : 0,
                    scale: (isFocused || value) ? 0.85 : 1,
                    color: (isFocused || value) ? '#818cf8' : 'rgba(255,255,255,0.3)',
                    opacity: (isFocused || value) ? 1 : 0.6
                }}
            >
                {label}
            </motion.label>

            <div className="relative flex items-center">
                <div className={`absolute left-4 transition-colors duration-300 ${isFocused ? 'text-indigo-400' : 'text-white/20'}`}>
                    <Icon size={18} />
                </div>

                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    required={required}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white/[0.05] transition-all duration-500"
                />

                {/* Underline Animation */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent origin-center"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isFocused ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                />
            </div>
        </div>
    );
};

const RippleButton = ({ children, isLoading, isSuccess, isError }) => {
    const [ripples, setRipples] = useState([]);

    const addRipple = (e) => {
        if (isLoading) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples([...ripples, { x, y, id }]);
        setTimeout(() => setRipples(old => old.filter(r => r.id !== id)), 1000);
    };

    return (
        <motion.button
            onMouseDown={addRipple}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`relative w-full overflow-hidden py-4 rounded-2xl font-bold text-lg text-white shadow-2xl transition-all duration-500 flex items-center justify-center gap-2 group
                ${isSuccess ? 'bg-green-600 shadow-green-600/20' :
                    isError ? 'bg-red-600 shadow-red-600/20' :
                        'bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 bg-[length:200%_auto] hover:bg-right'}`}
        >
            {/* Ripple Effects */}
            {ripples.map(ripple => (
                <motion.span
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute bg-white/20 rounded-full pointer-events-none"
                    style={{ left: ripple.x, top: ripple.y, width: 20, height: 20, marginLeft: -10, marginTop: -10 }}
                />
            ))}

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Loader2 className="animate-spin w-6 h-6" />
                    </motion.div>
                ) : isSuccess ? (
                    <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6" /> Success
                    </motion.div>
                ) : isError ? (
                    <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                        <AlertCircle className="w-6 h-6" /> Failed
                    </motion.div>
                ) : (
                    <motion.span key="content" className="flex items-center gap-2">
                        {children} <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

// --- Main Login Component ---

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, success, error
    const navigate = useNavigate();
    const controls = useAnimation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');

        try {
            const res = await axios.post(`http://localhost:5000/api/auth/login`, { email, password });
            const { _id, name: fetchedName, email: fetchedEmail, role: fetchedRole, token } = res.data;
            const userData = { _id, name: fetchedName, email: fetchedEmail, role: fetchedRole };

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', fetchedRole);
            localStorage.setItem('userName', fetchedName);

            setStatus('success');
            toast.success(`Welcome back, ${fetchedName}! Entering orbit...`);

            setTimeout(() => {
                if (fetchedRole === 'admin') navigate('/admin');
                else if (fetchedRole === 'student') navigate('/student');
                else if (fetchedRole === 'faculty') navigate('/faculty');
            }, 1000);

        } catch (err) {
            console.error('Login error:', err);
            const message = err.response?.data?.message || err.message || 'Login failed';
            setStatus('error');
            toast.error(message);

            // Shake animation on error
            controls.start({
                x: [-10, 10, -10, 10, 0],
                transition: { duration: 0.4 }
            });

            setTimeout(() => setStatus('idle'), 2000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020617] font-sans selection:bg-indigo-500/30">
            {/* Multi-layered Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]" />
            <BokehNebula />
            <Stars />
            <UpwardParticles />

            {/* Animated Glow Border (Levitating under the card) */}
            <motion.div
                animate={{ y: [20, 5, 20], opacity: [0.1, 0.3, 0.1], scale: [0.9, 1, 0.9] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[500px] h-[600px] rounded-full bg-indigo-500/10 blur-[100px] z-0"
            />

            {/* Login Container */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[460px] px-6"
            >
                {/* Levitating Premium Card */}
                <motion.div
                    animate={controls}
                    style={{ y: 0 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-full bg-white/[0.02] backdrop-blur-[30px] border border-white/10 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] p-12 overflow-hidden group"
                >
                    {/* Floating Decorative Elements inside card */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -translate-y-16 translate-x-16 rounded-full group-hover:bg-indigo-500/10 transition-all duration-700" />

                    {/* Staggered Entry Animation */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
                        }}
                    >
                        {/* Header */}
                        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="text-center mb-12">
                            <motion.div
                                whileHover={{ rotate: 15, scale: 1.1 }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-400/20 mb-8 shadow-inner"
                            >
                                <Sparkles className="w-10 h-10 text-indigo-300 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                            </motion.div>
                            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4 tracking-tighter">
                                SIGN IN
                            </h2>
                            <p className="text-white/20 text-sm font-medium tracking-[0.2em] uppercase">
                                ERP Portal Access
                            </p>
                        </motion.div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                                <AdvancedInput
                                    label="Email Address"
                                    icon={Mail}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </motion.div>

                            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                                <AdvancedInput
                                    label="Password"
                                    icon={Lock}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </motion.div>

                            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="pt-4">
                                <RippleButton
                                    isLoading={isLoading}
                                    isSuccess={status === 'success'}
                                    isError={status === 'error'}
                                >
                                    Log In
                                </RippleButton>
                            </motion.div>
                        </form>

                        {/* Footer Links */}
                        <motion.div
                            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                            className="mt-12 text-center"
                        >
                            <a href="#" className="relative inline-block text-white/20 hover:text-white/50 text-[10px] font-bold tracking-[0.3em] uppercase transition-colors group">
                                Forgot Password?
                                <span className="absolute bottom-[-6px] left-0 w-full h-[1px] bg-indigo-400/40 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                            </a>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Perspective Guide Lines (Subtle) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none opacity-[0.05]">
                    <div className="absolute top-0 left-0 w-full h-full border border-indigo-500/20 rounded-full scale-[0.3]" />
                    <div className="absolute top-0 left-0 w-full h-full border border-indigo-500/20 rounded-full scale-[0.6]" />
                    <div className="absolute top-0 left-0 w-full h-full border border-indigo-500/20 rounded-full scale-[0.9]" />
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
