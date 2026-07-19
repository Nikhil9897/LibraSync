import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        
        setLoading(true);
        try {
            await api.put(`/auth/reset-password/${token}`, { password });
            setSuccess(true);
            toast.success('Password reset successful!');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--background)' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Set New Password</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Please enter your new password below</p>
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
                            <h2 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Password Reset!</h2>
                            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Your password has been changed successfully.</p>
                            <Link
                                to="/login"
                                className="py-2.5 px-4 text-white rounded-lg font-medium inline-block w-full text-center transition-all"
                                style={{ backgroundColor: 'var(--primary)' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                            >
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none bg-transparent"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    placeholder="••••••••"
                                    required
                                    minLength="6"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none bg-transparent"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    placeholder="••••••••"
                                    required
                                    minLength="6"
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
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
