import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api, { invalidateCache } from '../../services/api';
import { routeComponentMap } from '../../App';
import { 
    LayoutDashboard, BookOpen, Calendar, DollarSign, Star, 
    Bell, User, Settings, Book, Upload, Download, 
    Users, TrendingUp, LogOut, Menu, Clock, AlertTriangle, Bookmark, Info,
    Sun, Moon, Monitor, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [collapsed, setCollapsed] = useState(isMobile);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    // Theme Toggle State
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const themeMenuRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            invalidateCache('/notifications/my');
            const res = await api.get('/notifications/my');
            setNotifications(res.data.data.notifications);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (showNotifications) fetchNotifications();
    }, [showNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
                setShowThemeMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id, isRead) => {
        if (isRead) return;
        try {
            await api.put(`/notifications/${id}/read`);
            invalidateCache('/notifications/my');
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            invalidateCache('/notifications/my');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    // Notification icons use semantic colors (not --primary for everything)
    const getNotificationIcon = (type) => {
        switch(type) {
            case 'due_reminder': return <Clock size={16} style={{ color: 'var(--warning)' }} />;
            case 'overdue':      return <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />;
            case 'reservation':  return <Bookmark size={16} style={{ color: 'var(--secondary)' }} />;
            case 'fine':         return <DollarSign size={16} style={{ color: 'var(--danger)' }} />;
            case 'announcement': return <Info size={16} style={{ color: 'var(--secondary)' }} />;
            case 'borrow':       return <BookOpen size={16} style={{ color: 'var(--primary)' }} />;
            case 'system':       return <Bell size={16} style={{ color: 'var(--text-secondary)' }} />;
            default:             return <Bell size={16} style={{ color: 'var(--primary)' }} />;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    let menuItems = [];
    const isAdminMode = location.pathname.startsWith('/admin');
    const isLibrarianMode = location.pathname.startsWith('/librarian');

    if (isAdminMode && user?.role === 'admin') {
        menuItems = [
            { path: '/admin', label: 'Admin Dashboard', icon: <Settings size={20} /> },
            { path: '/admin/users', label: 'Manage Users', icon: <Users size={20} /> },
            { path: '/admin/books', label: 'Manage Books', icon: <Book size={20} /> },
            { path: '/admin/issue', label: 'Issue Book', icon: <Upload size={20} /> },
            { path: '/admin/return', label: 'Return Book', icon: <Download size={20} /> },
            { path: '/admin/reports', label: 'Reports', icon: <TrendingUp size={20} /> },
        ];
    } else if (isLibrarianMode && user?.role === 'librarian') {
        menuItems = [
            { path: '/librarian/dashboard', label: 'Librarian Dashboard', icon: <Settings size={20} /> },
            { path: '/librarian/books', label: 'Manage Books', icon: <Book size={20} /> },
            { path: '/librarian/issue', label: 'Issue Book', icon: <Upload size={20} /> },
            { path: '/librarian/return', label: 'Return Book', icon: <Download size={20} /> },
        ];
    } else {
        menuItems = [
            { path: '/dashboard', label: 'My Dashboard', icon: <LayoutDashboard size={20} /> },
            { path: '/dashboard/borrows', label: 'My Borrows', icon: <BookOpen size={20} /> },
            { path: '/dashboard/reservations', label: 'Reservations', icon: <Calendar size={20} /> },
            { path: '/dashboard/fines', label: 'My Fines', icon: <DollarSign size={20} /> },
            { path: '/dashboard/wishlist', label: 'My Wishlist', icon: <Heart size={20} /> },
            { path: '/dashboard/reviews', label: 'My Reviews', icon: <Star size={20} /> },
            { path: '/dashboard/notifications', label: 'Notifications', icon: <Bell size={20} />, badge: unreadCount > 0 ? unreadCount : null },
            { path: '/dashboard/profile', label: 'Profile', icon: <User size={20} /> },
        ];
    }

    return (
        <div className="flex min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--background)', fontFamily: "'Inter', sans-serif" }}>
            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={isMobile ? { x: collapsed ? '-100%' : 0, width: 280 } : { width: collapsed ? 80 : 280, x: 0 }}
                className="md:rounded-r-3xl transition-all duration-300 fixed h-[100vh] md:h-[98vh] top-0 md:top-[1vh] z-[70] flex flex-col shadow-2xl overflow-hidden"
                style={{ backgroundColor: 'var(--sidebar)' }}
            >
                {/* Logo Row */}
                <div className="h-20 flex items-center justify-between px-6" style={{ borderBottom: '1px solid var(--border)' }}>
                    <AnimatePresence>
                        {(!collapsed || isMobile) && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Link 
                                    to="/" 
                                    className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    <BookOpen size={28} strokeWidth={2.5} style={{ color: 'var(--primary)' }} />
                                    <span className="font-bold text-2xl tracking-tight whitespace-nowrap">LibraSync</span>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`p-2 rounded-xl transition-all ml-auto ${isMobile ? 'hidden' : ''}`}
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <Menu size={22} />
                    </button>
                </div>

                {/* User Profile Card */}
                <AnimatePresence>
                    {(!collapsed || isMobile) && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-6"
                            style={{ borderBottom: '1px solid var(--border)' }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-2 overflow-hidden shrink-0"
                                        style={{
                                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                            color: '#fff',
                                            borderColor: 'var(--border)',
                                        }}
                                    >
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            user?.name?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <div
                                        className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full"
                                        style={{ backgroundColor: 'var(--success)', border: '2px solid var(--sidebar)' }}
                                    />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                                        {user?.name || 'User'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className="inline-flex px-2 py-0.5 text-xs font-bold rounded-md capitalize"
                                            style={{
                                                backgroundColor: 'var(--primary-muted)',
                                                color: 'var(--primary)',
                                                border: '1px solid var(--border)',
                                            }}
                                        >
                                            {user?.role || 'Member'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Nav Items */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/dashboard' && item.path !== '/admin' && item.path !== '/librarian/dashboard' && location.pathname.startsWith(item.path));
                        const handlePreload = () => {
                            const component = routeComponentMap[item.path];
                            if (component?.preload) component.preload();
                        };
                        return (
                            <div key={item.path}>
                                {item.divider && <hr className="my-6 mx-2" style={{ borderColor: 'var(--border)' }} />}
                                <Link
                                    to={item.path}
                                    onClick={() => isMobile && setCollapsed(true)}
                                    onFocus={handlePreload}
                                    title={collapsed && !isMobile ? item.label : undefined}
                                    className="relative flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-250 group overflow-hidden"
                                    style={{
                                        backgroundColor: isActive ? 'var(--surface-hover)' : 'transparent',
                                        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                    }}
                                    onMouseEnter={e => {
                                        handlePreload();
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                                            e.currentTarget.style.color = 'var(--text-primary)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--text-secondary)';
                                        }
                                    }}
                                >
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeIndicator"
                                            className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full"
                                            style={{ backgroundColor: 'var(--primary)' }}
                                        />
                                    )}
                                    <span className="shrink-0">{item.icon}</span>
                                    {(!collapsed || isMobile) && (
                                        <span className="flex-1 truncate">{item.label}</span>
                                    )}
                                    {(!collapsed || isMobile) && item.badge && (
                                        <span
                                            className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto"
                                            style={{ backgroundColor: 'var(--danger)', color: '#fff' }}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        );
                    })}

                    {/* Switch Portal */}
                    {(user?.role === 'admin' || user?.role === 'librarian') && (
                        <div className="mt-8">
                            <hr className="my-6 mx-2" style={{ borderColor: 'var(--border)' }} />
                            {(isAdminMode || isLibrarianMode) ? (
                                <Link
                                    to="/dashboard"
                                    onClick={() => isMobile && setCollapsed(true)}
                                    title={collapsed && !isMobile ? 'Member View' : undefined}
                                    className="relative flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-250 group overflow-hidden"
                                    style={{ color: 'var(--text-secondary)' }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                >
                                    <span className="shrink-0"><User size={20} /></span>
                                    {(!collapsed || isMobile) && <span className="flex-1 truncate">Switch to Member View</span>}
                                </Link>
                            ) : (
                                <Link
                                    to={user?.role === 'admin' ? '/admin' : '/librarian/dashboard'}
                                    onClick={() => isMobile && setCollapsed(true)}
                                    title={collapsed && !isMobile ? 'Admin View' : undefined}
                                    className="relative flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-250 group overflow-hidden"
                                    style={{ color: 'var(--text-secondary)' }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                >
                                    <span className="shrink-0"><Settings size={20} /></span>
                                    {(!collapsed || isMobile) && <span className="flex-1 truncate">Switch to {user?.role === 'admin' ? 'Admin' : 'Librarian'} View</span>}
                                </Link>
                            )}
                        </div>
                    )}
                </nav>

                {/* Sign Out */}
                <div className="p-5" style={{ borderTop: '1px solid var(--border)' }}>
                    <button 
                        onClick={logout} 
                        title={collapsed && !isMobile ? 'Sign Out' : undefined}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-250 ${(collapsed && !isMobile) ? 'justify-center' : ''}`}
                        style={{ color: 'var(--danger)' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--danger-muted)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {(!collapsed || isMobile) && <span className="truncate">Sign Out</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && !collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setCollapsed(true)}
                        className="fixed inset-0 bg-black/60 z-[65] backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className={`${isMobile ? 'ml-0' : (collapsed ? 'ml-[100px]' : 'ml-[300px]')} flex-1 flex flex-col min-h-screen transition-all duration-300 w-full overflow-x-hidden`}>
                {/* Top Header */}
                <header
                    className="h-20 backdrop-blur-xl sticky top-0 z-40 flex items-center px-6 sm:px-10 shadow-sm transition-all duration-300"
                    style={{
                        backgroundColor: 'var(--background)',
                        borderBottom: '1px solid var(--border)',
                    }}
                >
                    {isMobile && (
                        <button 
                            onClick={() => setCollapsed(false)} 
                            className="mr-4 p-2 rounded-xl transition-all"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <Menu size={24} />
                        </button>
                    )}
                    <h2 className="text-lg sm:text-2xl font-bold truncate max-w-[200px] sm:max-w-none" style={{ color: 'var(--text-primary)' }}>
                        {menuItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                    </h2>
                    <div className="flex items-center gap-3 sm:gap-6 ml-auto">
                        
                        {/* Theme Toggle */}
                        <div className="relative" ref={themeMenuRef}>
                            <button 
                                onClick={() => setShowThemeMenu(!showThemeMenu)}
                                className="relative p-2.5 transition-all duration-300 rounded-full"
                                style={{ color: showThemeMenu ? 'var(--primary)' : 'var(--text-secondary)' }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = showThemeMenu ? 'var(--primary)' : 'var(--text-secondary)'; }}
                            >
                                {theme === 'light' ? <Sun size={22} /> : theme === 'dark' ? <Moon size={22} /> : <Monitor size={22} />}
                            </button>
                            
                            <AnimatePresence>
                                {showThemeMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-3 w-40 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                                        style={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                        }}
                                    >
                                        {[
                                            { key: 'light', label: 'Light', icon: <Sun size={18} /> },
                                            { key: 'dark', label: 'Dark', icon: <Moon size={18} /> },
                                            { key: 'system', label: 'System', icon: <Monitor size={18} /> },
                                        ].map(opt => (
                                            <button 
                                                key={opt.key}
                                                onClick={() => { setTheme(opt.key); setShowThemeMenu(false); }}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors mt-0.5"
                                                style={{
                                                    backgroundColor: theme === opt.key ? 'var(--primary-muted)' : 'transparent',
                                                    color: theme === opt.key ? 'var(--primary)' : 'var(--text-secondary)',
                                                }}
                                                onMouseEnter={e => { if (theme !== opt.key) { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
                                                onMouseLeave={e => { if (theme !== opt.key) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
                                            >
                                                {opt.icon} {opt.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2.5 transition-all duration-300 rounded-full"
                                style={{ color: showNotifications ? 'var(--primary)' : 'var(--text-secondary)' }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = showNotifications ? 'var(--primary)' : 'var(--text-secondary)'; }}
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span
                                        className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: 'var(--danger)', border: '2px solid var(--background)' }}
                                    />
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-3 w-80 rounded-3xl shadow-2xl overflow-hidden z-50"
                                        style={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                        }}
                                    >
                                        <div className="flex justify-between items-center p-5" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-2)' }}>
                                            <div>
                                                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{unreadCount} unread</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-xs font-semibold transition-colors"
                                                        style={{ color: 'var(--text-secondary)' }}
                                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                                <Link
                                                    to="/dashboard/notifications"
                                                    onClick={() => setShowNotifications(false)}
                                                    className="text-sm font-semibold transition-colors"
                                                    style={{ color: 'var(--secondary)' }}
                                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--secondary-hover)'}
                                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--secondary)'}
                                                >
                                                    View All
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="max-h-[360px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-10 text-center">
                                                    <Bell size={32} className="mx-auto mb-3" style={{ color: 'var(--border-strong)' }} />
                                                    <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>You're all caught up!</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    {notifications.slice(0, 6).map((n) => (
                                                        <div 
                                                            key={n._id}
                                                            onClick={() => { markAsRead(n._id, n.isRead); setShowNotifications(false); }}
                                                            className="p-4 flex gap-3 cursor-pointer transition-colors"
                                                            style={{
                                                                borderBottom: '1px solid var(--border)',
                                                                backgroundColor: !n.isRead ? 'var(--primary-muted)' : 'transparent',
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = !n.isRead ? 'var(--primary-muted)' : 'transparent'}
                                                        >
                                                            <div
                                                                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                                                                style={{
                                                                    backgroundColor: !n.isRead ? 'var(--surface)' : 'var(--surface-hover)',
                                                                    border: !n.isRead ? '1px solid var(--border)' : 'none',
                                                                }}
                                                            >
                                                                {getNotificationIcon(n.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <h4
                                                                        className="text-sm font-bold leading-tight truncate"
                                                                        style={{ color: !n.isRead ? 'var(--primary)' : 'var(--text-primary)' }}
                                                                    >
                                                                        {n.title}
                                                                    </h4>
                                                                    {!n.isRead && (
                                                                        <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ backgroundColor: 'var(--primary)' }} />
                                                                    )}
                                                                </div>
                                                                <p className="text-xs line-clamp-1 mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                                                                <p className="text-[10px] font-bold mt-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile Avatar */}
                        <Link
                            to="/dashboard/profile"
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer hover:scale-105 transition-transform duration-300 overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                color: '#fff',
                                border: '2px solid var(--border)',
                            }}
                        >
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0).toUpperCase() || 'U'
                            )}
                        </Link>
                    </div>
                </header>

                <div className="flex-1 p-8 md:p-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
