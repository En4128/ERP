import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ChevronRight, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// Reusing some background components from Login.jsx for consistency
const Stars = () => (
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

const BokehNebula = () => (
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

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, success, error
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');

        try {
            const res = await axios.post(`http://localhost:5000/api/auth/forgot-password`, { email });
            setStatus('success');
            toast.success(res.data.message || 'Reset link sent to your email!');
        } catch (err) {
            console.error('Forgot password error:', err);
            const message = err.response?.data?.message || err.message || 'Something went wrong';
            setStatus('error');
            toast.error(message);
            setTimeout(() => setStatus('idle'), 2000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 font-sans selection:bg-indigo-500/30">
            <Stars />
            <BokehNebula />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[460px] px-6"
            >
                <div className="relative w-full bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] p-12 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -translate-y-16 translate-x-16 rounded-full group-hover:bg-indigo-500/10 transition-all duration-700" />

                    <Link to="/login" className="absolute top-8 left-8 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>

                    <div className="text-center mt-8 mb-10">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
                            FORGOT PASSWORD
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="relative pt-6 group">
                            <label className={`absolute left-12 font-medium pointer-events-none transition-all duration-300 ${email ? '-top-2 left-4 scale-75 text-indigo-400' : 'top-10 text-slate-500 opacity-60'}`}>
                                Email Address
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-[#0066CC] transition-all duration-500"
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative w-full overflow-hidden py-4 rounded-2xl font-bold text-lg text-white shadow-2xl transition-all duration-500 flex items-center justify-center gap-2 group
                                ${status === 'success' ? 'bg-emerald-600 shadow-emerald-500/20' :
                                    status === 'error' ? 'bg-rose-600 shadow-rose-500/20' :
                                        'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right'}`}
                        >
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <Loader2 className="animate-spin w-6 h-6" />
                                    </motion.div>
                                ) : status === 'success' ? (
                                    <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                                        <CheckCircle2 className="w-6 h-6" /> Reset Link Sent
                                    </motion.div>
                                ) : status === 'error' ? (
                                    <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                                        <AlertCircle className="w-6 h-6" /> Failed
                                    </motion.div>
                                ) : (
                                    <motion.span key="content" className="flex items-center gap-2">
                                        Send Reset Link <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
