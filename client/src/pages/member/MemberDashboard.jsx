import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { 
    BookOpen, CheckCircle, Clock, AlertCircle, 
    TrendingUp, Calendar as CalendarIcon, Activity, Search,
    ArrowRight, Book, User, Target, ChevronRight,
    Compass, Star, Award, Heart, PlusCircle, Flame, CalendarDays
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const MemberDashboard = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [categoryCounts, setCategoryCounts] = useState({});

    useEffect(() => {
        api.get('/borrows/my')
            .then((res) => setBorrows(res.data.data.borrows))
            .catch(console.error)
            .finally(() => setLoading(false));

        api.get('/books', { params: { limit: 8 } })
            .then((res) => { if (res.data.data.books) setRecommendedBooks(res.data.data.books); })
            .catch(console.error);

        api.get('/books/category-counts')
            .then((res) => {
                if (res.data?.data?.counts) {
                    const countsMap = {};
                    res.data.data.counts.forEach(c => { countsMap[c.name] = c.count; });
                    setCategoryCounts(countsMap);
                }
            })
            .catch(console.error);
    }, []);

    const handleRenew = async (borrowId) => {
        try {
            await api.put(`/borrows/${borrowId}/renew`);
            toast.success('Book renewed successfully!');
            const res = await api.get('/borrows/my');
            setBorrows(res.data.data.borrows);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Renewal failed');
        }
    };

    const activeBorrows = borrows.filter((b) => b.status === 'active');
    const returnedBorrows = borrows.filter((b) => b.status === 'returned');
    const daysUntil = (date) => Math.ceil((new Date(date) - new Date()) / 86400000);

    const chartData = [
        { name: 'Jan', borrows: 2 },
        { name: 'Feb', borrows: 3 },
        { name: 'Mar', borrows: 1 },
        { name: 'Apr', borrows: 4 },
        { name: 'May', borrows: 2 },
        { name: 'Jun', borrows: activeBorrows.length + returnedBorrows.length || 5 },
    ];

    // Activity items use semantic icon colors
    const onboardingActivity = [
        { id: '1', action: 'Account created', title: 'Welcome to LibraSync!',
          iconColor: 'var(--primary)', bgColor: 'var(--primary-muted)',
          date: user?.createdAt || new Date() },
        { id: '2', action: 'Profile setup', title: 'Complete your profile for personalized recommendations',
          iconColor: 'var(--secondary)', bgColor: 'var(--secondary-muted)',
          date: user?.createdAt || new Date() },
    ];

    const recentActivity = borrows.length > 0
        ? [...borrows]
            .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
            .slice(0, 4)
            .map(b => ({
                id: b._id,
                title: b.book?.title,
                action: b.status === 'returned' ? 'Returned' : 'Borrowed',
                date: b.status === 'returned' ? b.returnDate : b.borrowDate,
                iconColor: b.status === 'returned' ? 'var(--success)' : 'var(--secondary)',
                bgColor: b.status === 'returned' ? 'var(--success-muted)' : 'var(--secondary-muted)',
                IconComp: b.status === 'returned' ? CheckCircle : BookOpen,
            }))
        : onboardingActivity.map(a => ({ ...a, IconComp: Award }));

    const displayRecommended = recommendedBooks.slice(0, 4);

    // Category cards: each gets a distinct accent color  
    const categoryCards = [
        { name: 'Fiction',    IconComp: BookOpen,  count: categoryCounts['Fiction']    || 0, iconColor: 'var(--secondary)',     iconBg: 'var(--secondary-muted)' },
        { name: 'Fantasy',    IconComp: Compass,   count: categoryCounts['Fantasy']    || 0, iconColor: 'var(--accent-purple)',  iconBg: 'rgba(139,92,246,0.1)' },
        { name: 'History',    IconComp: Clock,     count: categoryCounts['History']    || 0, iconColor: 'var(--warning)',        iconBg: 'var(--warning-muted)' },
        { name: 'Mystery',    IconComp: Heart,     count: categoryCounts['Mystery']    || 0, iconColor: 'var(--danger)',         iconBg: 'var(--danger-muted)' },
        { name: 'Technology', IconComp: Activity,  count: categoryCounts['Technology'] || 0, iconColor: 'var(--primary)',        iconBg: 'var(--primary-muted)' },
    ];

    // Quick action cards: each has a distinct hover border semantic color
    const quickActions = [
        { title: 'Browse Catalog', desc: 'Find your next read',          IconComp: Search, iconColor: 'var(--secondary)', hoverBorder: 'var(--secondary)', path: '/catalog' },
        { title: 'Update Profile', desc: 'Manage your settings',         IconComp: User,   iconColor: 'var(--primary)',   hoverBorder: 'var(--primary)',   path: '/dashboard/profile' },
        { title: 'Wishlist',       desc: 'Books you want to read',       IconComp: Heart,  iconColor: 'var(--danger)',    hoverBorder: 'var(--danger)',    path: '/dashboard/wishlist' },
        { title: 'AI Picks',       desc: 'Smart recommendations',        IconComp: Star,   iconColor: 'var(--warning)',   hoverBorder: 'var(--warning)',   onClick: () => window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { action: 'ai-picks' } })) },
    ];

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const booksBorrowedThisMonth = borrows.filter(b => {
        const d = new Date(b.borrowDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const readingGoal = { current: booksBorrowedThisMonth, target: user?.monthlyReadingGoal || 5 };
    const goalPercentage = Math.min(100, Math.round((readingGoal.current / readingGoal.target) * 100) || 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } },
    };

    if (loading) {
        return <div className="flex h-[60vh] items-center justify-center font-medium" style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</div>;
    }

    // Shared card style (inline)
    const cardStyle = {
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
    };

    return (
        <motion.div 
            className="max-w-[1500px] mx-auto pb-12 space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Hero Banner */}
            <motion.div
                variants={itemVariants}
                className="rounded-[32px] p-8 md:p-10 text-white shadow-xl relative overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 60%, #000))' }}
            >
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, white, transparent)' }} />
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] animate-pulse" style={{ backgroundColor: 'var(--secondary)' }} />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 lg:w-28 lg:h-28 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-4xl font-bold border border-white/20 shadow-2xl shrink-0 overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white drop-shadow-md">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                            )}
                        </div>
                        <div>
                            <p className="font-bold mb-1 tracking-widest text-xs uppercase opacity-80 text-white/70">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
                            <h1 className="text-3xl lg:text-4xl font-bold mb-2 tracking-tight drop-shadow-sm">
                                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
                            </h1>
                            <p className="text-white/80 text-sm font-medium italic opacity-90 max-w-md">
                                "Every book opens another world. What will you discover today?"
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 lg:gap-6 bg-black/20 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div className="flex flex-col justify-center">
                            <span className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Flame size={14} className="text-orange-400" /> Streak
                            </span>
                            <span className="text-xl font-bold leading-none">{user?.currentStreak || 0} Day{user?.currentStreak !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="w-px h-10 bg-white/10 hidden sm:block" />
                        <div className="flex flex-col justify-center">
                            <span className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Target size={14} className="text-purple-400" /> Goal
                            </span>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${goalPercentage}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-white/80 rounded-full" />
                                    </div>
                                    <span className="text-sm font-bold leading-none">{goalPercentage}%</span>
                                </div>
                                <span className="text-white/60 text-[10px] font-medium leading-none">{readingGoal.current} of {readingGoal.target} books · Monthly</span>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-white/10 hidden sm:block" />
                        <div className="flex flex-col justify-center">
                            <span className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <BookOpen size={14} className="text-white/70" /> Active
                            </span>
                            <span className="text-xl font-bold leading-none">{activeBorrows.length} Books</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Action Cards */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {quickActions.map((action, idx) => {
                        const { IconComp } = action;
                        const CardInner = () => (
                            <div className="relative z-10 flex flex-col h-full">
                                <div
                                    className={`mb-4 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${idx === 0 ? 'w-16 h-16' : 'w-14 h-14'}`}
                                    style={{ backgroundColor: 'var(--surface-hover)' }}
                                >
                                    <IconComp size={idx === 0 ? 28 : 24} style={{ color: action.iconColor }} />
                                </div>
                                <h3 className={`font-bold mb-1 ${idx === 0 ? 'text-lg' : 'text-base'}`} style={{ color: 'var(--text-primary)' }}>{action.title}</h3>
                                <p className={`font-medium leading-relaxed ${idx === 0 ? 'text-sm' : 'text-xs'}`} style={{ color: 'var(--text-secondary)' }}>{action.desc}</p>
                                <div className="mt-auto pt-4 flex justify-end">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-250 group-hover:scale-110"
                                        style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)' }}
                                    >
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        );

                        const sharedClass = `group p-5 rounded-[24px] flex flex-col h-full relative overflow-hidden transition-all duration-250 text-left`;
                        const baseStyle = { ...cardStyle };

                        return (
                            <motion.div key={idx} variants={itemVariants} className={idx === 0 ? 'col-span-2 sm:col-span-3 md:col-span-2' : 'col-span-1'}>
                                {action.onClick ? (
                                    <button
                                        onClick={action.onClick}
                                        className={`w-full ${sharedClass}`}
                                        style={baseStyle}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = action.hoverBorder; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <CardInner />
                                    </button>
                                ) : (
                                    <Link
                                        to={action.path}
                                        className={sharedClass}
                                        style={baseStyle}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = action.hoverBorder; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <CardInner />
                                    </Link>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Stat Cards — semantic colors, subtle top border */}
                <div className="lg:col-span-5 grid grid-cols-3 gap-4">
                    {[
                        { title: 'Active', count: activeBorrows.length,   IconComp: BookOpen,    accentColor: 'var(--secondary)', topBorder: 'var(--secondary)',  iconBg: 'var(--secondary-muted)' },
                        { title: 'Read',   count: returnedBorrows.length,  IconComp: CheckCircle, accentColor: 'var(--success)',   topBorder: 'var(--success)',    iconBg: 'var(--success-muted)', trend: returnedBorrows.length > 0 ? `+${returnedBorrows.length}` : null },
                        { title: 'Total',  count: borrows.length,          IconComp: Activity,    accentColor: 'var(--accent-purple)', topBorder: 'var(--accent-purple)', iconBg: 'rgba(139,92,246,0.1)' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className="p-5 rounded-[24px] flex flex-col justify-between overflow-hidden transition-all duration-250"
                            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderTop: `2px solid ${stat.topBorder}` }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.iconBg, color: stat.accentColor }}>
                                    <stat.IconComp size={18} />
                                </div>
                                {stat.trend && (
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1" style={{ backgroundColor: 'var(--success-muted)', color: 'var(--success)' }}>
                                        ▲ {stat.trend}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold" style={{ color: stat.accentColor }}>{stat.count}</h2>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>{stat.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                {/* Left Column */}
                <div className="xl:col-span-8 flex flex-col gap-8">

                    {/* Currently Borrowed / Recommended */}
                    {activeBorrows.length > 0 ? (
                        <motion.div variants={itemVariants} className="rounded-[32px] shadow-sm p-8" style={cardStyle}>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                                    <span className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--secondary-muted)', color: 'var(--secondary)' }}>
                                        <BookOpen size={20} />
                                    </span>
                                    Currently Borrowed
                                </h2>
                                <Link
                                    to="/dashboard/borrows"
                                    className="text-sm font-bold flex items-center gap-1.5 group px-4 py-2 rounded-xl transition-all duration-250"
                                    style={{ color: 'var(--secondary)', backgroundColor: 'var(--secondary-muted)' }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--secondary)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--secondary-muted)'; e.currentTarget.style.color = 'var(--secondary)'; }}
                                >
                                    View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="space-y-5">
                                {activeBorrows.map((borrow) => {
                                    const days = daysUntil(borrow.dueDate);
                                    const isUrgent = days <= 3;
                                    return (
                                        <div
                                            key={borrow._id}
                                            className="group p-5 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden transition-all duration-250"
                                            style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                                <div className="w-20 h-28 rounded-xl shadow-md flex items-center justify-center overflow-hidden shrink-0" style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                                                    {borrow.book?.coverImage ? (
                                                        <img src={borrow.book.coverImage} alt={borrow.book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <Book style={{ color: 'var(--text-muted)' }} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-xl line-clamp-1 transition-colors" style={{ color: 'var(--text-primary)' }}>{borrow.book?.title}</h3>
                                                    <p className="text-sm font-medium mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>{borrow.book?.author}</p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
                                                            {borrow.book?.category?.name || 'Category'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                                                <div
                                                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl"
                                                    style={{
                                                        backgroundColor: isUrgent ? 'var(--danger-muted)' : 'var(--surface-hover)',
                                                        color: isUrgent ? 'var(--danger)' : 'var(--text-secondary)',
                                                        border: `1px solid ${isUrgent ? 'var(--danger-muted)' : 'var(--border)'}`,
                                                    }}
                                                >
                                                    {isUrgent ? <AlertCircle size={14} /> : <CalendarIcon size={14} />}
                                                    {days > 0 ? `${days} Days Remaining` : 'Overdue!'}
                                                </div>
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <Link
                                                        to={`/books/${borrow.book?._id}`}
                                                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-xl text-center transition-all duration-250"
                                                        style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--border-strong)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                                                    >
                                                        View Details
                                                    </Link>
                                                    <button
                                                        onClick={() => handleRenew(borrow._id)}
                                                        disabled={borrow.renewalsCount >= borrow.maxRenewals}
                                                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-xl disabled:opacity-50 transition-all duration-250 flex items-center justify-center gap-1.5"
                                                        style={{ backgroundColor: 'var(--primary-muted)', color: 'var(--primary)', border: '1px solid var(--border)' }}
                                                        onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}}
                                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary-muted)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                                    >
                                                        Renew <span className="opacity-70 text-[10px]">({borrow.renewalsCount}/{borrow.maxRenewals})</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div variants={itemVariants} className="rounded-[32px] shadow-sm p-8" style={cardStyle}>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                                    <span className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--warning-muted)', color: 'var(--warning)' }}>
                                        <Star className="fill-current" size={20} />
                                    </span>
                                    AI Recommended Picks
                                </h2>
                            </div>
                            <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x">
                                {displayRecommended.map(book => (
                                    <Link
                                        key={book._id}
                                        to={`/books/${book._id}`}
                                        className="snap-start shrink-0 w-[200px] group flex flex-col rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300"
                                        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                                    >
                                        <div className="h-[280px] flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                            {book.coverImage ? (
                                                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <Book size={48} style={{ color: 'var(--text-muted)' }} />
                                            )}
                                            <div className="absolute top-3 right-3 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                                                <Star size={12} style={{ color: 'var(--warning)' }} className="fill-current" />
                                                <span className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>{book.averageRating?.toFixed(1) || '4.5'}</span>
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="font-bold text-sm line-clamp-2 transition-colors" style={{ color: 'var(--text-primary)' }}>{book.title}</h3>
                                            <p className="text-xs line-clamp-1 mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{book.author}</p>
                                            <div className="mt-auto pt-3">
                                                <button
                                                    className="w-full py-2 text-xs font-bold rounded-xl transition-all duration-250"
                                                    style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--primary)' }}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Reading Trends Chart */}
                    <motion.div variants={itemVariants} className="rounded-[32px] shadow-sm p-8 flex-1 flex flex-col" style={cardStyle}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                                <span className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--secondary-muted)', color: 'var(--secondary)' }}>
                                    <TrendingUp size={20} />
                                </span>
                                Reading Trends
                            </h2>
                            <div className="flex items-center gap-4 text-sm font-bold p-1 rounded-xl" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                <button className="px-4 py-1.5 shadow-sm rounded-lg" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Books</button>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-[288px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }} />
                                    <RechartsTooltip
                                        cursor={{ fill: 'var(--primary-muted)', opacity: 0.6 }}
                                        contentStyle={{ borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', padding: '12px' }}
                                        itemStyle={{ color: 'var(--primary)', fontWeight: 800 }}
                                        labelStyle={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}
                                    />
                                    <Bar dataKey="borrows" radius={[8, 8, 0, 0]} barSize={40}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'var(--primary)' : 'var(--surface-hover)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column */}
                <div className="xl:col-span-4 flex flex-col gap-8">

                    {/* Due This Week */}
                    <motion.div variants={itemVariants} className="rounded-[32px] shadow-sm p-8" style={cardStyle}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                                <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--warning-muted)', color: 'var(--warning)' }}>
                                    <CalendarDays size={16} />
                                </span>
                                Due This Week
                            </h2>
                        </div>
                        <div className="rounded-2xl p-5 flex items-center justify-center" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                            {activeBorrows.filter(b => daysUntil(b.dueDate) <= 7 && daysUntil(b.dueDate) >= 0).length > 0 ? (
                                <div className="space-y-4 w-full">
                                    {activeBorrows.filter(b => daysUntil(b.dueDate) <= 7 && daysUntil(b.dueDate) >= 0).map(borrow => (
                                        <div
                                            key={borrow._id}
                                            className="flex justify-between items-center p-3 rounded-xl"
                                            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>{borrow.book?.title}</span>
                                                <span className="text-xs font-bold" style={{ color: 'var(--warning)' }}>{format(new Date(borrow.dueDate), 'MMM do')}</span>
                                            </div>
                                            <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--warning-muted)', color: 'var(--warning)' }}>
                                                {daysUntil(borrow.dueDate)} days
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center py-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--success-muted)', color: 'var(--success)' }}>
                                        <CheckCircle size={24} />
                                    </div>
                                    <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>No books due this week! 🎉</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div variants={itemVariants} className="rounded-[32px] shadow-sm p-8" style={cardStyle}>
                        <h2 className="text-xl font-bold mb-8 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                            <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
                                <Clock size={16} />
                            </span>
                            Recent Activity
                        </h2>
                        <div className="space-y-6 relative pl-2">
                            <div className="absolute left-6 top-4 bottom-4 w-0.5" style={{ background: 'linear-gradient(to bottom, var(--border-strong), transparent)' }} />
                            {recentActivity.map((activity, idx) => {
                                const IconComp = activity.IconComp;
                                return (
                                    <div key={idx} className="flex gap-5 relative group z-10">
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                                            style={{ backgroundColor: activity.bgColor, border: '2px solid var(--surface)', color: activity.iconColor }}
                                        >
                                            <IconComp size={16} />
                                        </div>
                                        <div className="pt-1.5 pb-2">
                                            <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-secondary)' }}>
                                                {activity.action} <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{activity.title}</span>
                                            </p>
                                            <p className="text-[10px] mt-1.5 font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                                {activity.date ? format(new Date(activity.date), 'MMM do, h:mm a') : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Categories */}
                    <motion.div variants={itemVariants} className="rounded-[32px] shadow-sm p-8 flex-1 flex flex-col" style={cardStyle}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                                <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--danger-muted)', color: 'var(--danger)' }}>
                                    <Compass size={16} />
                                </span>
                                Explore
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 flex-1 content-start">
                            {categoryCards.map(cat => (
                                <Link
                                    key={cat.name}
                                    to={`/catalog?category=${cat.name}`}
                                    className="flex items-center justify-between p-4 rounded-[20px] group transition-all duration-250"
                                    style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = cat.iconColor; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: cat.iconBg, color: cat.iconColor }}>
                                            <cat.IconComp size={22} />
                                        </div>
                                        <div>
                                            <span className="font-bold block transition-colors text-sm" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{cat.count} Books</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-250" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
                                        <ChevronRight size={16} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default MemberDashboard;
