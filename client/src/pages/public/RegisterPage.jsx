import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiBookOpen } from 'react-icons/fi';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await register({ name, email, password });
            toast.success('Registration successful!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        window.location.href = '/api/v1/auth/google';
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full blur-3xl mix-blend-multiply opacity-[0.05]" style={{ backgroundColor: 'var(--secondary)' }}></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full blur-3xl mix-blend-multiply opacity-[0.05]" style={{ backgroundColor: 'var(--primary)' }}></div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-10 flex flex-col items-center">
                    <Link to="/" className="flex items-center gap-2 mb-6 hover:scale-105 transition-transform" style={{ color: 'var(--primary)' }}>
                        <FiBookOpen size={36} style={{ color: 'var(--primary)' }} />
                        <span className="font-bold text-3xl tracking-tight italic">LibraSync</span>
                    </Link>
                    <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Create an Account</h2>
                    <p className="mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Join Librasync to start borrowing books.</p>
                </div>

                <div
                    className="rounded-3xl shadow-xl border p-8 sm:p-10"
                    style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                    }}
                >
                    {/* Google OAuth Button */}
                    <button
                        onClick={handleGoogleSignup}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-xl transition-all mb-8 font-semibold shadow-sm bg-transparent"
                        style={{
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign up with Google
                    </button>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--border)' }} /></div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 font-bold uppercase tracking-widest" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-muted)' }}>
                                or sign up with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all bg-transparent"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all bg-transparent"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all tracking-widest font-mono text-lg bg-transparent"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 text-white font-bold rounded-xl disabled:opacity-50 mt-2 transition-all"
                            style={{ backgroundColor: 'var(--primary)' }}
                            onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold transition-colors hover:underline" style={{ color: 'var(--primary)' }}>
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
