import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    // Guard prevents double-execution in React StrictMode
    const executed = useRef(false);

    useEffect(() => {
        if (executed.current) return;
        executed.current = true;

        const token = searchParams.get('token');
        const refresh = searchParams.get('refresh');

        if (!token) {
            toast.error('Authentication failed — no token received');
            navigate('/', { replace: true });
            return;
        }

        localStorage.setItem('token', token);
        if (refresh) {
            localStorage.setItem('refreshToken', refresh);
        }

        api.get('/auth/me')
            .then((res) => {
                const user = res.data.data.user;
                // Persist user so AuthContext can read it instantly on next load
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                toast.success('Signed in with Google! 🎉');
                if (user.role === 'admin') navigate('/admin', { replace: true });
                else if (user.role === 'librarian') navigate('/librarian/dashboard', { replace: true });
                else navigate('/dashboard', { replace: true });
            })
            .catch((err) => {
                console.error('Google auth callback error:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                toast.error('Authentication failed — please try again');
                navigate('/', { replace: true });
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps — run only once

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 gap-4">
            <div className="w-14 h-14 border-4 border-[#0d5959]/20 border-t-[#0d5959] dark:border-teal-400/20 dark:border-t-teal-400 rounded-full animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 font-semibold">Signing you in…</p>
        </div>
    );
};

export default AuthCallback;
