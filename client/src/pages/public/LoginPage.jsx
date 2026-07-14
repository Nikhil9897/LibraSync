import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../../components/common/AuthModal';
import toast from 'react-hot-toast';
import { FiBookOpen } from 'react-icons/fi';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = '/api/v1/auth/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#f8fafc] font-sans relative overflow-hidden" >
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#0d5959]/10 rounded-full blur-3xl mix-blend-multiply"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#d4a853]/10 rounded-full blur-3xl mix-blend-multiply"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10 flex flex-col items-center">
                    <Link to="/" className="flex items-center gap-2 text-[#0d5959] mb-6 hover:scale-105 transition-transform">
                        <FiBookOpen size={36} className="text-[#d4a853]" />
                        <span className="font-bold text-3xl tracking-tight  italic">LibraSync</span>
                    </Link>
                    <h1 className="text-3xl  font-bold text-[#1a1f36] dark:text-white">Welcome</h1>
                    <p className="text-slate-500 mt-2 font-medium">Sign in to your library account</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-xl shadow-[#0d5959]/5 border dark:border-slate-700 border-slate-100 p-8 sm:p-10">
                    {/* Google OAuth Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border dark:border-slate-700 border-slate-200 rounded-xl hover:bg-slate-50 dark:bg-slate-900 hover:border-slate-300 transition-all mb-8 font-semibold text-[#1a1f36] dark:text-white shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t dark:border-slate-700 border-slate-200" /></div>
                        <div className="relative flex justify-center text-xs"><span className="bg-slate-50 dark:bg-slate-900 px-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">or sign in with email</span></div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                            <input
                                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d5959] focus:bg-slate-50 dark:bg-slate-900 focus:border-transparent outline-none transition-all text-[#1a1f36] dark:text-white"
                                placeholder="you@email.com" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <input
                                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0d5959] focus:bg-slate-50 dark:bg-slate-900 focus:border-transparent outline-none transition-all text-[#1a1f36] dark:text-white tracking-widest font-mono text-lg"
                                placeholder="••••••••" required
                            />
                        </div>
                        <div className="flex justify-end pt-1">
                            <button type="button" onClick={() => setModal('forgot')} className="text-sm font-semibold text-[#0d5959] hover:text-[#d4a853] transition-colors">Forgot password?</button>
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full py-3.5 bg-[#0d5959] text-white rounded-xl hover:bg-[#0a4747] disabled:opacity-50 font-bold transition-all shadow-md shadow-[#0d5959]/20"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 font-medium mt-8">
                        Don't have an account? <button type="button" onClick={() => setModal('register')} className="text-[#0d5959] font-bold hover:text-[#d4a853] transition-colors">Sign up</button>
                    </p>
                </div>
            </div>

            <AuthModal isOpen={!!modal} view={modal} onClose={() => setModal(null)} />
        </div>
    );
};

export default LoginPage;
