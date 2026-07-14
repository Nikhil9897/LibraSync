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
        // Poll for new notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Refetch when the notification dropdown is opened
    useEffect(() => {
        if (showNotifications) {
            fetchNotifications();
        }
    }, [showNotifications]);

    // Close dropdowns when clicking outside
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

    const getNotificationIcon = (type) => {
        switch(type) {
            case 'due_reminder': return <Clock size={16} className="text-amber-500" />;
            case 'overdue': return <AlertTriangle size={16} className="text-red-500" />;
            case 'reservation': return <Bookmark size={16} className="text-[#0d5959] dark:text-teal-400" />;
            case 'fine': return <DollarSign size={16} className="text-red-500" />;
            case 'announcement': return <Info size={16} className="text-[#0d5959]" />;
            case 'borrow': return <BookOpen size={16} className="text-[#0d5959]" />;
            case 'system': return <Bell size={16} className="text-slate-500 dark:text-slate-400" />;
            default: return <Bell size={16} className="text-[#0d5959]" />;
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
        // Member mode
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
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Premium Sidebar Panel */}
            <motion.aside 
                initial={false}
                animate={isMobile ? { x: collapsed ? '-100%' : 0, width: 280 } : { width: collapsed ? 80 : 280, x: 0 }}
                className="bg-slate-50 dark:bg-slate-900 md:rounded-r-3xl transition-all duration-300 fixed h-[100vh] md:h-[98vh] top-0 md:top-[1vh] z-[70] flex flex-col shadow-2xl overflow-hidden"
            >
                <div className="h-20 flex items-center justify-between px-6 border-b dark:border-slate-700 border-slate-200/60 dark:border-slate-700 backdrop-blur-sm">
                    <AnimatePresence>
                        {(!collapsed || isMobile) && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Link 
                                    to="/" 
                                    className="flex items-center gap-3 text-[#1a1f36] dark:text-white hover:opacity-90 transition-opacity"
                                >
                                    <BookOpen size={28} className="text-[#0d5959]" strokeWidth={2.5} />
                                    <span className="font-bold text-2xl tracking-tight tracking-tight whitespace-nowrap">LibraSync</span>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button onClick={() => setCollapsed(!collapsed)} className={`p-2 text-slate-500 dark:text-slate-400 hover:text-[#1a1f36] dark:text-white hover:bg-white dark:bg-slate-800 rounded-xl transition-all ml-auto ${isMobile ? 'hidden' : ''}`}>
                        <Menu size={22} />
                    </button>
                </div>

                {/* Enhanced User Profile Card */}
                <AnimatePresence>
                    {(!collapsed || isMobile) && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-6 border-b dark:border-slate-700 border-slate-200/60 dark:border-slate-700"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FCD34D] text-[#115E59] flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white/20 overflow-hidden shrink-0">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            user?.name?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-[#0F766E] rounded-full"></div>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-base font-bold text-[#1a1f36] dark:text-white truncate">{user?.name || 'User'}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="inline-flex px-2 py-0.5 bg-[#D4AF37]/20 border dark:border-slate-700 border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold rounded-md capitalize shadow-sm">
                                            {user?.role || 'Member'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/dashboard' && item.path !== '/admin' && item.path !== '/librarian/dashboard' && location.pathname.startsWith(item.path));
                        const handlePreload = () => {
                            const component = routeComponentMap[item.path];
                            if (component?.preload) component.preload();
                        };
                        return (
                            <div key={item.path}>
                                {item.divider && <hr className="my-6 border-slate-200/60 dark:border-slate-700 mx-2" />}
                                <Link
                                    to={item.path}
                                    onClick={() => isMobile && setCollapsed(true)}
                                    onMouseEnter={handlePreload}
                                    onFocus={handlePreload}
                                    title={collapsed && !isMobile ? item.label : undefined}
                                    className={`relative flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group overflow-hidden ${
                                        isActive
                                            ? 'bg-white dark:bg-slate-800 text-[#0d5959] dark:text-teal-400 shadow-lg shadow-black/5'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:bg-slate-800 hover:text-[#1a1f36] dark:text-white'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeIndicator"
                                            className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-[#0d5959] dark:bg-teal-400 rounded-r-full shadow-[0_0_12px_rgba(13,89,89,0.5)] dark:shadow-[0_0_12px_rgba(45,212,191,0.5)]" 
                                        />
                                    )}
                                    <span className={`${isActive ? 'text-[#0d5959] dark:text-teal-400' : 'text-slate-500 group-hover:text-[#1a1f36] dark:text-white'} transition-colors shrink-0`}>
                                        {item.icon}
                                    </span>
                                    {(!collapsed || isMobile) && (
                                        <span className="flex-1 truncate">{item.label}</span>
                                    )}
                                    {(!collapsed || isMobile) && item.badge && (
                                        <span className="bg-blue-500 text-[#1a1f36] dark:text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md ml-auto">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        );
                    })}

                    {/* Switch Portal Button */}
                    {(user?.role === 'admin' || user?.role === 'librarian') && (
                        <div className="mt-8">
                            <hr className="my-6 border-slate-200/60 dark:border-slate-700 mx-2" />
                            {(isAdminMode || isLibrarianMode) ? (
                                <Link
                                    to="/dashboard"
                                    onClick={() => isMobile && setCollapsed(true)}
                                    title={collapsed && !isMobile ? "Member View" : undefined}
                                    className="relative flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-white dark:bg-slate-800 hover:text-[#1a1f36] dark:text-white transition-all duration-300 group overflow-hidden"
                                >
                                    <span className="text-slate-500 group-hover:text-[#1a1f36] dark:text-white transition-colors shrink-0"><User size={20} /></span>
                                    {(!collapsed || isMobile) && <span className="flex-1 truncate">Switch to Member View</span>}
                                </Link>
                            ) : (
                                <Link
                                    to={user?.role === 'admin' ? '/admin' : '/librarian/dashboard'}
                                    onClick={() => isMobile && setCollapsed(true)}
                                    title={collapsed && !isMobile ? "Admin View" : undefined}
                                    className="relative flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-white dark:bg-slate-800 hover:text-[#1a1f36] dark:text-white transition-all duration-300 group overflow-hidden"
                                >
                                    <span className="text-slate-500 group-hover:text-[#1a1f36] dark:text-white transition-colors shrink-0"><Settings size={20} /></span>
                                    {(!collapsed || isMobile) && <span className="flex-1 truncate">Switch to {user?.role === 'admin' ? 'Admin' : 'Librarian'} View</span>}
                                </Link>
                            )}
                        </div>
                    )}
                </nav>
                
                <div className="p-5 border-t dark:border-slate-700 border-slate-200/60 dark:border-slate-700 bg-black/10 backdrop-blur-md">
                    <button 
                        onClick={logout} 
                        title={collapsed && !isMobile ? "Sign Out" : undefined}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 rounded-2xl transition-all duration-300 ${(collapsed && !isMobile) ? 'justify-center' : ''}`}
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

            {/* Main Content Area */}
            <main className={`${isMobile ? 'ml-0' : (collapsed ? 'ml-[100px]' : 'ml-[300px]')} flex-1 flex flex-col min-h-screen transition-all duration-300 w-full overflow-x-hidden`}>
                {/* Top Glass Header for Mobile/Context */}
                <header className="h-20 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-xl border-b dark:border-slate-700 border-slate-200/60 dark:border-slate-700 sticky top-0 z-40 flex items-center px-6 sm:px-10 shadow-sm transition-all duration-300">
                    {isMobile && (
                        <button 
                            onClick={() => setCollapsed(false)} 
                            className="mr-4 p-2 text-slate-500 dark:text-slate-400 hover:text-[#1a1f36] dark:text-white rounded-xl transition-all"
                        >
                            <Menu size={24} />
                        </button>
                    )}
                    <h2 className="text-lg sm:text-2xl font-bold text-[#1a1f36] dark:text-white truncate max-w-[200px] sm:max-w-none">
                        {menuItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                    </h2>
                    <div className="flex items-center gap-3 sm:gap-6 ml-auto">
                        
                        {/* Theme Toggle */}
                        <div className="relative" ref={themeMenuRef}>
                            <button 
                                onClick={() => setShowThemeMenu(!showThemeMenu)}
                                className="relative p-2.5 transition-all duration-300 rounded-full text-slate-500 dark:text-slate-400 hover:text-[#0d5959] dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-white dark:bg-slate-800"
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
                                        className="absolute right-0 mt-3 w-40 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 overflow-hidden z-50 p-2"
                                    >
                                        <button 
                                            onClick={() => { setTheme('light'); setShowThemeMenu(false); }}
                                            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${theme === 'light' ? 'bg-slate-100/50 dark:bg-slate-800/50 text-[#0d5959] dark:text-teal-400' : 'text-slate-600 dark:text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                        >
                                            <Sun size={18} /> Light
                                        </button>
                                        <button 
                                            onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
                                            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors mt-1 ${theme === 'dark' ? 'bg-slate-100/50 dark:bg-slate-800/50 text-[#0d5959] dark:text-teal-400' : 'text-slate-600 dark:text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                        >
                                            <Moon size={18} /> Dark
                                        </button>
                                        <button 
                                            onClick={() => { setTheme('system'); setShowThemeMenu(false); }}
                                            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors mt-1 ${theme === 'system' ? 'bg-slate-100/50 dark:bg-slate-800/50 text-[#0d5959] dark:text-teal-400' : 'text-slate-600 dark:text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                        >
                                            <Monitor size={18} /> System
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2.5 transition-all duration-300 rounded-full ${showNotifications ? 'bg-slate-100/50 dark:bg-slate-800/50 text-[#0d5959] dark:text-teal-400' : 'text-slate-500 dark:text-slate-400 hover:text-[#0d5959] dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-white dark:bg-slate-800'}`}
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-200/60 dark:border-slate-700 shadow-sm"></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 overflow-hidden z-50"
                                    >
                                        <div className="flex justify-between items-center p-5 border-b dark:border-slate-700 border-slate-200/60 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 backdrop-blur-sm">
                                            <div>
                                                <h3 className="font-bold text-[#1a1f36] dark:text-white">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <span className="text-xs font-bold text-[#0d5959] dark:text-teal-400">{unreadCount} unread</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {unreadCount > 0 && (
                                                    <button onClick={markAllAsRead} className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#0d5959] dark:hover:text-teal-400 transition-colors">
                                                        Mark all read
                                                    </button>
                                                )}
                                                <Link to="/dashboard/notifications" onClick={() => setShowNotifications(false)} className="text-sm font-semibold text-[#0d5959] hover:text-[#B4932D] dark:hover:text-[#FCD34D] transition-colors">
                                                    View All
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="max-h-[360px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-10 text-center">
                                                    <Bell size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                                                    <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">You're all caught up!</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    {notifications.slice(0, 6).map((n) => (
                                                        <div 
                                                            key={n._id}
                                                            onClick={() => { markAsRead(n._id, n.isRead); setShowNotifications(false); }}
                                                            className={`p-4 border-b dark:border-slate-700 border-slate-100 flex gap-3 cursor-pointer transition-colors ${
                                                                !n.isRead
                                                                    ? 'bg-teal-50/60 dark:bg-teal-900/20 hover:bg-teal-50 dark:hover:bg-teal-900/30'
                                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                            }`}
                                                        >
                                                            <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                                                                !n.isRead ? 'bg-white dark:bg-slate-700 shadow-sm border dark:border-slate-600 border-slate-100' : 'bg-slate-100 dark:bg-slate-700'
                                                            }`}>
                                                                {getNotificationIcon(n.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <h4 className={`text-sm font-bold leading-tight truncate ${
                                                                        !n.isRead ? 'text-[#0d5959] dark:text-teal-400' : 'text-slate-700 dark:text-slate-200'
                                                                    }`}>{n.title}</h4>
                                                                    {!n.isRead && <span className="w-2 h-2 bg-teal-500 rounded-full shrink-0 mt-1"></span>}
                                                                </div>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{n.message}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">{new Date(n.createdAt).toLocaleDateString()}</p>
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

                        {/* Profile Image */}
                        <Link to="/dashboard/profile" className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FCD34D] text-[#115E59] flex items-center justify-center font-bold shadow-md border-[3px] border-white dark:border-slate-200/60 dark:border-slate-700 cursor-pointer hover:scale-105 transition-transform duration-300 overflow-hidden">
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
