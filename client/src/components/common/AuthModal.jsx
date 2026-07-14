import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const inputClass = "w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#0d5959] focus:border-transparent outline-none transition-all text-slate-800 dark:text-white placeholder-slate-400 text-sm";

// ─── Register View ─────────────────────────────────────────────────────────────
const RegisterView = ({ onSwitch, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register({ name, email, password });
            toast.success('Account created! Welcome to LibraSync 🎉');
            onClose();
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Create Account</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Join LibraSync to start borrowing books</p>
            </div>

            <button
                onClick={() => window.location.href = '/api/v1/auth/google'}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-5 font-medium text-slate-700 dark:text-slate-200 text-sm"
            >
                <GoogleIcon /> Sign up with Google
            </button>

            <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-600" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-slate-800 px-3 text-slate-400 font-medium">or sign up with email</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Full Name</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe"
                            className={inputClass + " pl-10"} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Email</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                            className={inputClass + " pl-10"} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Password</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••"
                            className={inputClass + " pl-10 tracking-widest font-mono text-base"} />
                    </div>
                </div>

                <button type="submit" disabled={loading}
                    className="w-full py-3 bg-[#0d5959] hover:bg-[#0a4747] text-white font-bold rounded-xl transition-all shadow-md shadow-[#0d5959]/20 disabled:opacity-50 mt-2">
                    {loading ? 'Creating account…' : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
                Already have an account?{' '}
                <button onClick={() => onSwitch('login')} className="text-[#0d5959] font-bold hover:text-[#d4a853] transition-colors">Sign in</button>
            </p>
        </div>
    );
};

// ─── Forgot Password View ──────────────────────────────────────────────────────
const ForgotPasswordView = ({ onSwitch }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
            toast.success('Reset link sent!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Check your inbox</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">We've sent a reset link to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span></p>
                <button onClick={() => onSwitch('login')} className="text-[#0d5959] font-bold hover:text-[#d4a853] transition-colors text-sm">
                    Back to login
                </button>
            </div>
        );
    }

    return (
        <div>
            <button onClick={() => onSwitch('login')} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white mb-5 text-sm font-medium transition-colors">
                <ArrowLeft size={16} /> Back to login
            </button>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Reset Password</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enter your email and we'll send you a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                            className={inputClass + " pl-10"} />
                    </div>
                </div>
                <button type="submit" disabled={loading}
                    className="w-full py-3 bg-[#0d5959] hover:bg-[#0a4747] text-white font-bold rounded-xl transition-all shadow-md shadow-[#0d5959]/20 disabled:opacity-50 mt-2">
                    {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
            </form>
        </div>
    );
};

// ─── Main Modal ────────────────────────────────────────────────────────────────
/**
 * @param {{ isOpen: boolean, view: 'register'|'forgot', onClose: () => void }} props
 */
const AuthModal = ({ isOpen, view: initialView, onClose }) => {
    const [view, setView] = useState(initialView || 'register');

    // Sync with parent-controlled view
    const handleSwitch = (v) => setView(v);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                <X size={18} />
                            </button>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={view}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {view === 'register' && <RegisterView onSwitch={handleSwitch} onClose={onClose} />}
                                    {view === 'forgot' && <ForgotPasswordView onSwitch={handleSwitch} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
