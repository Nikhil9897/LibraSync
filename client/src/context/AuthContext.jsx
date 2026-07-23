import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Decode JWT payload without verifying signature (just for reading cached user info)
const decodeToken = (token) => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Eagerly load user from token on startup — avoids a network request on every page load
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            const decoded = decodeToken(token);
            // If token is expired, clear immediately
            if (decoded && decoded.exp * 1000 > Date.now()) {
                try { return JSON.parse(savedUser); } catch { return null; }
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(!localStorage.getItem('user'));

    // Verify token is still valid in the background (doesn't block UI)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }

        const decoded = decodeToken(token);
        if (!decoded || decoded.exp * 1000 < Date.now()) {
            // Token expired locally
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setLoading(false);
            return;
        }

        // Fetch fresh user data in background (cached by api.js for 30s)
        api.get('/auth/me')
            .then((res) => {
                const freshUser = res.data.data.user;
                setUser(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));
            })
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { user, accessToken, refreshToken } = res.data.data;
        localStorage.setItem('token', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const register = async (data) => {
        const res = await api.post('/auth/register', data);
        const { user, accessToken, refreshToken } = res.data.data;
        localStorage.setItem('token', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
