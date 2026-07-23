import React, { useEffect, useRef, useState } from 'react';
import { RevealLayer } from '../../components/public/RevealLayer';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BG_IMAGE_1 = "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1280&q=80&auto=format&fit=crop";
const BG_IMAGE_2 = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1280&q=80&auto=format&fit=crop";

const GoogleButton = ({ label }) => (
    <button
        type="button"
        onClick={() => { const apiBase = import.meta.env.VITE_API_URL || '/api/v1'; window.location.href = `${apiBase}/auth/google`; }}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200/60 dark:border-slate-700 shadow-sm rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-slate-700 dark:text-slate-200 text-sm"
    >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {label}
    </button>
);

const Divider = ({ label = 'or' }) => (
    <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t dark:border-slate-700 border-slate-200/60" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-slate-50 dark:bg-slate-900 px-3 text-gray-400 font-medium">{label}</span></div>
    </div>
);

const inputCls = "w-full px-4 py-3 border border-slate-200/60 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none dark:bg-slate-800 dark:text-white transition-shadow text-sm bg-white";

// ─── Panel Views ───────────────────────────────────────────────────────────────

const LoginView = ({ onSwitch }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const u = await login(email, password);
            toast.success('Welcome back!');
            if (u.role === 'admin') navigate('/admin');
            else if (u.role === 'librarian') navigate('/librarian/dashboard');
            else navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#1a1f36] dark:text-white">Welcome to LibraSync</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Please log in or create an account.</p>
            </div>

            <GoogleButton label="Continue with Google" />
            <Divider />

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" required className={inputCls} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className={inputCls + " tracking-widest text-lg"} />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-4 h-4">
                            <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer z-20" />
                            <div className="absolute inset-0 rounded border-2 border-gray-300 dark:border-slate-600 transition-all" style={{ borderColor: 'var(--border)' }}></div>
                            <svg className="absolute w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform duration-200 z-10 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-200 font-medium select-none">Remember me</span>
                    </label>
                    <button type="button" onClick={() => onSwitch('forgot')} className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors">
                        Forgot password?
                    </button>
                </div>

                <div className="flex gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 text-white rounded-lg disabled:opacity-50 font-semibold transition-colors shadow-md"
                        style={{ backgroundColor: 'var(--primary)' }}
                        onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
                    >
                        {loading ? 'Signing in…' : 'Login'}
                    </button>
                    <button type="button" onClick={() => onSwitch('register')} className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-colors shadow-sm">
                        Create account
                    </button>
                </div>
            </form>

            <p className="text-center text-xs text-gray-400 mt-8">
                By logging in, you agree to our conditions and privacy policy.<br /><br />
                <Link to="/catalog" className="text-[#0d5959] hover:underline font-medium">Skip to Catalog</Link>
            </p>
        </>
    );
};

const RegisterView = ({ onSwitch }) => {
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
            toast.success('Account created! Welcome 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button type="button" onClick={() => onSwitch('login')} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-[#0d5959] dark:hover:text-teal-400 mb-5 text-sm font-medium transition-colors">
                <ArrowLeft size={15} /> Back to login
            </button>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#1a1f36] dark:text-white">Create Account</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Join LibraSync and start borrowing books.</p>
            </div>

            <GoogleButton label="Sign up with Google" />
            <Divider label="or sign up with email" />

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required className={inputCls} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className={inputCls} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={inputCls + " tracking-widest text-lg"} />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-white rounded-lg disabled:opacity-50 font-semibold transition-colors shadow-md mt-2"
                    style={{ backgroundColor: 'var(--primary)' }}
                    onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
                >
                    {loading ? 'Creating account…' : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <button type="button" onClick={() => onSwitch('login')} className="font-bold transition-colors hover:underline" style={{ color: 'var(--primary)' }}>
                    Sign in
                </button>
            </p>
        </>
    );
};

const ForgotView = ({ onSwitch }) => {
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
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Check your inbox</h2>
                <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                    We've sent a password reset link to <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{email}</span>
                </p>
                <button type="button" onClick={() => onSwitch('login')} className="font-bold transition-colors text-sm hover:underline" style={{ color: 'var(--primary)' }}>
                    Back to login
                </button>
            </div>
        );
    }

    return (
        <>
            <button type="button" onClick={() => onSwitch('login')} className="flex items-center gap-2 mb-5 text-sm font-medium transition-colors hover:underline" style={{ color: 'var(--text-secondary)' }}>
                <ArrowLeft size={15} /> Back to login
            </button>
            <div className="mb-8">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Reset Password</h1>
                <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Enter your email and we'll send you a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className={inputCls} />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-white rounded-lg disabled:opacity-50 font-semibold transition-colors shadow-md"
                    style={{ backgroundColor: 'var(--primary)' }}
                    onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
                >
                    {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
            </form>
        </>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const LandingPage = () => {
    const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') navigate('/admin', { replace: true });
            else if (user.role === 'librarian') navigate('/librarian/dashboard', { replace: true });
            else navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    // Hero animation
    const containerRef = useRef(null);
    const requestRef = useRef();
    const mouse = useRef({ x: -999, y: -999 });
    const smooth = useRef({ x: -999, y: -999 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            }
        };
        const animate = () => {
            if (mouse.current.x !== -999) {
                if (smooth.current.x === -999) smooth.current = { ...mouse.current };
                const dx = mouse.current.x - smooth.current.x;
                const dy = mouse.current.y - smooth.current.y;
                if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                    smooth.current.x += dx * 0.1;
                    smooth.current.y += dy * 0.1;
                    if (containerRef.current) {
                        containerRef.current.style.setProperty('--cursor-x', `${smooth.current.x}px`);
                        containerRef.current.style.setProperty('--cursor-y', `${smooth.current.y}px`);
                    }
                }
            }
            requestRef.current = requestAnimationFrame(animate);
        };
        window.addEventListener('mousemove', handleMouseMove);
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-900">

            {/* LEFT SIDE: Auth Panel */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-12 relative z-10 overflow-hidden">
                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer absolute top-8 left-8 sm:left-12 lg:left-16" onClick={() => setView('login')}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d5959" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    <span className="text-[#0d5959] text-2xl italic font-bold tracking-tight">LibraSync</span>
                </div>

                {/* Animated view switcher */}
                <div className="w-full max-w-md mx-auto lg:mx-0 mt-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, x: view === 'login' ? -24 : 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: view === 'login' ? 24 : -24 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                        >
                            {view === 'login'    && <LoginView    onSwitch={setView} />}
                            {view === 'register' && <RegisterView onSwitch={setView} />}
                            {view === 'forgot'   && <ForgotView   onSwitch={setView} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* RIGHT SIDE: Spotlight Hero */}
            <div ref={containerRef} className="w-full lg:w-1/2 relative overflow-hidden h-[60vh] lg:h-screen bg-black">
                {/* Gradient edge */}
                <div className="hidden lg:block absolute inset-y-0 left-0 w-32 xl:w-48 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900 dark:to-transparent z-[55] pointer-events-none" />

                {/* Layer 1: Base image */}
                <div className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom" style={{ backgroundImage: `url(${BG_IMAGE_1})` }} />

                {/* Layer 2: Reveal layer */}
                <RevealLayer image={BG_IMAGE_2} />

                {/* Layer 3: Heading */}
                <div className="absolute top-[20%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
                    <h1 className="text-white leading-[0.95]">
                        <span className="block italic font-normal text-5xl sm:text-7xl lg:text-6xl xl:text-7xl hero-anim hero-reveal" style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}>Every book</span>
                        <span className="block font-normal text-5xl sm:text-7xl lg:text-6xl xl:text-7xl -mt-1 hero-anim hero-reveal" style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}>opens a world</span>
                    </h1>
                </div>

                {/* Layer 4: Glassmorphism Info Banner */}
                <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 z-50 hero-anim hero-fade" style={{ animationDelay: '0.7s' }}>
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 shadow-2xl">
                        <div className="flex-1 max-w-xl pointer-events-none">
                            <h3 className="text-white font-semibold text-lg mb-2">Your library, reimagined.</h3>
                            <p className="text-white/80 text-sm leading-relaxed">
                                From ancient manuscripts to digital shelves, every book holds knowledge waiting to be discovered. Search thousands of titles, track your reading journey, and never miss a due date again.
                            </p>
                        </div>
                        <button onClick={() => navigate('/catalog')} className="shrink-0 bg-[#d4a853] hover:bg-[#c49a3f] text-white text-sm font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-[1.03] active:scale-95 hover:shadow-xl hover:shadow-[#d4a853]/30 pointer-events-auto">
                            Explore Catalog
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
