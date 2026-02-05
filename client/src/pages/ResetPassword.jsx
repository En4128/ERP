import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronRight, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

// Reusing background components
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

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('idle');
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setIsLoading(true);
        setStatus('idle');

        try {
            await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
            setStatus('success');
            toast.success('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error('Reset password error:', err);
            const message = err.response?.data?.message || err.message || 'Reset failed';
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
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
                            NEW PASSWORD
                        </h2>
                        <p className="text-slate-400 text-sm">
                            Enter your new password below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative pt-6 group">
                                <label className={`absolute left-12 font-medium pointer-events-none transition-all duration-300 ${password ? '-top-2 left-4 scale-75 text-indigo-400' : 'top-10 text-slate-500 opacity-60'}`}>
                                    New Password
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-[#0066CC] transition-all duration-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 text-slate-400 hover:text-indigo-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="relative pt-2 group">
                                <label className={`absolute left-12 font-medium pointer-events-none transition-all duration-300 ${confirmPassword ? '-top-2 left-4 scale-75 text-indigo-400' : 'top-6 text-slate-500 opacity-60'}`}>
                                    Confirm Password
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-[#0066CC] transition-all duration-500"
                                    />
                                </div>
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
                                        <CheckCircle2 className="w-6 h-6" /> Success
                                    </motion.div>
                                ) : status === 'error' ? (
                                    <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                                        <AlertCircle className="w-6 h-6" /> Failed
                                    </motion.div>
                                ) : (
                                    <motion.span key="content" className="flex items-center gap-2">
                                        Update Password <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
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

export default ResetPassword;
