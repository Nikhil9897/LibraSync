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

const inputClass = "w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all text-slate-800 dark:text-white placeholder-slate-400 text-sm";

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
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Create Account</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Join LibraSync to start borrowing books</p>
            </div>

            <button
                onClick={() => window.location.href = '/api/v1/auth/google'}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-xl transition-colors mb-5 font-medium text-sm"
                style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--surface)',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--surface)'}
            >
                <GoogleIcon /> Sign up with Google
            </button>

            <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--border)' }} /></div>
                <div className="relative flex justify-center text-xs">
                    <span className="px-3 font-medium" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-muted)' }}>
                        or sign up with email
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe"
                            className={inputClass + " pl-10"} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Email</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                            className={inputClass + " pl-10"} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Password</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••"
                            className={inputClass + " pl-10 tracking-widest font-mono text-base"} />
                    </div>
                </div>

                <button type="submit" disabled={loading}
                    className="w-full py-3 text-white font-bold rounded-xl transition-all disabled:opacity-50 mt-2"
                    style={{
                        backgroundColor: 'var(--primary)',
                    }}
                    onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
                >
                    {loading ? 'Creating account…' : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <button onClick={() => onSwitch('login')} className="font-bold transition-colors hover:underline" style={{ color: 'var(--primary)' }}>Sign in</button>
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
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--success-muted)' }}>
                    <CheckCircle size={32} style={{ color: 'var(--success)' }} />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Check your inbox</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>We've sent a reset link to <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{email}</span></p>
                <button onClick={() => onSwitch('login')} className="font-bold transition-colors text-sm hover:underline" style={{ color: 'var(--primary)' }}>
                    Back to login
                </button>
            </div>
        );
    }

    return (
        <div>
            <button onClick={() => onSwitch('login')} className="flex items-center gap-2 mb-5 text-sm font-medium transition-colors hover:underline" style={{ color: 'var(--text-secondary)' }}>
                <ArrowLeft size={16} /> Back to login
            </button>
            <div className="mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reset Password</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Enter your email and we'll send you a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                            className={inputClass + " pl-10"} />
                    </div>
                </div>
                <button type="submit" disabled={loading}
                    className="w-full py-3 text-white font-bold rounded-xl transition-all disabled:opacity-50 mt-2"
                    style={{
                        backgroundColor: 'var(--primary)',
                    }}
                    onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
                >
                    {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
            </form>
        </div>
    );
};

// ─── Main Modal ────────────────────────────────────────────────────────────────
const AuthModal = ({ isOpen, view: initialView, onClose }) => {
    const [view, setView] = useState(initialView || 'register');

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
                        <div
                            className="relative w-full max-w-md rounded-3xl shadow-2xl p-8 border"
                            style={{
                                backgroundColor: 'var(--surface)',
                                borderColor: 'var(--border)',
                            }}
                        >
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
                                style={{
                                    backgroundColor: 'var(--surface-hover)',
                                    color: 'var(--text-secondary)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--border)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
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
