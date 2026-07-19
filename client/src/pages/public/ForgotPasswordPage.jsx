import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
            toast.success('Reset link sent to your email!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--background)' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reset Password</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Enter your email to get a reset link</p>
                </div>

                <div
                    className="rounded-xl border p-8 shadow-sm"
                    style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                    }}
                >
                    {success ? (
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--success-muted)', color: 'var(--success)' }}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Check your email</h2>
                            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>We've sent a password reset link to {email}</p>
                            <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none bg-transparent"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    placeholder="you@email.com"
                                    required
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 text-white rounded-lg disabled:opacity-50 font-medium mt-4 transition-all"
                                style={{ backgroundColor: 'var(--primary)' }}
                                onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            
                            <div className="text-center mt-6">
                                <Link to="/login" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
