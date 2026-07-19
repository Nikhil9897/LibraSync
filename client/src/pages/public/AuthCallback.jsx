import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useAuth();
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
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ backgroundColor: 'var(--background)' }}>
            <div className="w-14 h-14 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary-muted)', borderTopColor: 'var(--primary)' }} />
            <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Signing you in…</p>
        </div>
    );
};

export default AuthCallback;
