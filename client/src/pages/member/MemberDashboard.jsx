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
import { format, addDays } from 'date-fns';
import { motion } from 'framer-motion';

const MemberDashboard = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    
    // Determine actual active theme for Recharts (if 'system', check media query)
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        if (theme === 'system') {
            setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
        } else {
            setIsDark(theme === 'dark');
        }
    }, [theme]);

    useEffect(() => {
        api.get('/borrows/my')
            .then((res) => setBorrows(res.data.data.borrows))
            .catch(console.error)
            .finally(() => setLoading(false));
            
        api.get('/books', { params: { limit: 8 } })
            .then((res) => {
                if (res.data.data.books) {
                    setRecommendedBooks(res.data.data.books);
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

    // Mock Chart Data
    const chartData = [
        { name: 'Jan', borrows: 2 },
        { name: 'Feb', borrows: 3 },
        { name: 'Mar', borrows: 1 },
        { name: 'Apr', borrows: 4 },
        { name: 'May', borrows: 2 },
        { name: 'Jun', borrows: activeBorrows.length + returnedBorrows.length || 5 },
    ];

    // Placeholder data for new users
    const onboardingActivity = [
        { id: '1', action: 'Account created', title: 'Welcome to LibraSync!', icon: <Award className="text-[#0d5959]" />, date: user?.createdAt || new Date(), color: 'bg-amber-100 dark:bg-[#ffb800]/20' },
        { id: '2', action: 'Profile setup', title: 'Complete your profile for personalized recommendations', icon: <User className="text-[#0d5959]" />, date: user?.createdAt || new Date(), color: 'bg-teal-100 dark:bg-teal-500/20' }
    ];

    const recentActivity = borrows.length > 0 ? [...borrows]
        .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
        .slice(0, 4)
        .map(b => ({
            id: b._id,
            title: b.book?.title,
            action: b.status === 'returned' ? 'Returned' : 'Borrowed',
            date: b.status === 'returned' ? b.returnDate : b.borrowDate,
            icon: b.status === 'returned' ? <CheckCircle className="text-emerald-600 dark:text-emerald-400" /> : <BookOpen className="text-blue-600 dark:text-blue-400" />,
            color: b.status === 'returned' ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-blue-100 dark:bg-blue-500/20'
        })) : onboardingActivity;

    const displayRecommended = recommendedBooks.slice(0, 4);

    const categoryCards = [
        { name: 'Fiction', icon: <BookOpen />, count: 342, bg: 'bg-blue-500', hover: '' },
        { name: 'Sci-Fi', icon: <Compass />, count: 128, bg: 'bg-indigo-500', hover: '' },
        { name: 'History', icon: <Clock />, count: 94, bg: 'bg-[#ffb800]', hover: '' },
        { name: 'Romance', icon: <Heart />, count: 80, bg: 'bg-rose-500', hover: '' },
        { name: 'Technology', icon: <Activity />, count: 61, bg: 'bg-teal-500', hover: '' }
    ];

    const quickActions = [
        { title: 'Browse Catalog', desc: 'Find your next read', icon: <Search className="text-[#0d5959] dark:text-blue-400" size={28} />, path: '/catalog', border: 'border-slate-700 group-hover:border-blue-300 dark:group-hover:border-blue-500/50' },
        { title: 'Update Profile', desc: 'Manage your settings', icon: <User className="text-[#0d5959]" size={28} />, path: '/dashboard/profile', border: 'border-slate-700 group-hover:border-amber-300 dark:group-hover:border-amber-500/50' },
        { title: 'Wishlist', desc: 'Books you want to read', icon: <Heart className="text-pink-500 dark:text-pink-400" size={28} />, path: '/dashboard/wishlist', border: 'border-slate-700 group-hover:border-pink-300 dark:group-hover:border-pink-500/50' },
        { title: 'AI Picks', desc: 'Smart recommendations', icon: <Star className="text-rose-500 dark:text-rose-400" size={28} />, onClick: () => window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { action: 'ai-picks' } })), border: 'border-slate-700 group-hover:border-rose-300 dark:group-hover:border-rose-500/50' }
    ];

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const booksBorrowedThisMonth = borrows.filter(b => {
        const borrowDate = new Date(b.borrowDate);
        return borrowDate.getMonth() === currentMonth && borrowDate.getFullYear() === currentYear;
    }).length;
    
    const readingGoal = { current: booksBorrowedThisMonth, target: user?.monthlyReadingGoal || 5 };
    const goalPercentage = Math.min(100, Math.round((readingGoal.current / readingGoal.target) * 100) || 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100, damping: 15 }
        }
    };

    if (loading) {
        return <div className="flex h-[60vh] items-center justify-center text-slate-500 dark:text-slate-400 font-medium">Loading your elegant dashboard...</div>;
    }

    return (
        <motion.div 
            className="max-w-[1500px] mx-auto pb-12 space-y-8" 
            style={{  }}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Premium Hero Banner */}
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#0F766E] to-[#115E59] dark:from-[#0b4d48] dark:to-[#07302d] rounded-[32px] p-8 md:p-10 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/10 dark:bg-slate-800/5 backdrop-blur-[2px]"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500 opacity-20 rounded-full mix-blend-screen filter blur-[100px] group-hover:opacity-30 transition-opacity duration-700 animate-pulse"></div>
                <div className="absolute bottom-[-20%] left-[5%] w-[400px] h-[400px] bg-slate-50 dark:bg-slate-900 opacity-40 rounded-full mix-blend-multiply filter blur-[80px]"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 lg:w-28 lg:h-28 bg-white/10 dark:bg-slate-800/10 backdrop-blur-md rounded-full flex items-center justify-center text-4xl font-bold border dark:border-slate-700 border-white/20 shadow-2xl shrink-0 overflow-hidden relative">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover relative z-10" />
                            ) : (
                                <span className="relative z-10 text-white drop-shadow-md">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                            )}
                        </div>
                        <div>
                            <p className="text-blue-400 font-bold mb-1 tracking-widest text-xs uppercase opacity-90">{format(new Date(), "EEEE, MMMM do, yyyy")}</p>
                            <h1 className="text-3xl lg:text-4xl  font-bold mb-2 tracking-tight drop-shadow-sm">
                                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
                            </h1>
                            <p className="text-white/80 text-sm font-medium italic opacity-90 max-w-md">
                                "Every book opens another world. What will you discover today?"
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 lg:gap-6 bg-black/20 p-5 rounded-2xl border dark:border-slate-700 border-white/10 backdrop-blur-sm">
                        <div className="flex flex-col justify-center h-full">
                            <span className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Flame size={14} className="text-orange-400" /> Streak</span>
                            <span className="text-xl font-bold leading-none">{user?.currentStreak || 0} Day{user?.currentStreak !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="w-px h-10 bg-white/10 dark:bg-slate-800/10 hidden sm:block"></div>
                        <div className="flex flex-col justify-center h-full">
                            <span className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Target size={14} className="text-purple-400" /> Goal</span>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-24 h-2 bg-white dark:bg-slate-800/20 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${goalPercentage}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-gradient-to-r from-purple-400 to-[#D4AF37]"></motion.div>
                                    </div>
                                    <span className="text-sm font-bold leading-none">{goalPercentage}%</span>
                                </div>
                                <span className="text-white/60 text-[10px] font-medium leading-none">{readingGoal.current} of {readingGoal.target} books · Monthly</span>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-white/10 dark:bg-slate-800/10 hidden sm:block"></div>
                        <div className="flex flex-col justify-center h-full">
                            <span className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><BookOpen size={14} className="text-blue-400" /> Active</span>
                            <span className="text-xl font-bold leading-none">{activeBorrows.length} Books</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions & Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Action Cards (Span 7) */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {quickActions.map((action, idx) => {
                        const CardContent = () => (
                            <>
                                <div className="absolute inset-0 bg-slate-50 dark:bg-slate-700/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className={`mb-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${idx === 0 ? 'w-16 h-16' : 'w-14 h-14'}`}>
                                        {action.icon}
                                    </div>
                                    <h3 className={`font-bold text-[#1a1f36] dark:text-white mb-1 ${idx === 0 ? 'text-lg' : 'text-base'}`}>{action.title}</h3>
                                    <p className={`text-slate-600 dark:text-slate-300 font-medium leading-relaxed ${idx === 0 ? 'text-sm' : 'text-xs'}`}>{action.desc}</p>
                                    <div className="mt-auto pt-4 flex justify-end">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white text-slate-500 dark:text-slate-400 transition-colors shadow-sm">
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        );

                        return (
                            <motion.div key={idx} variants={itemVariants} className={idx === 0 ? "col-span-2 sm:col-span-3 md:col-span-2" : "col-span-1 sm:col-span-1 md:col-span-1"}>
                                {action.onClick ? (
                                    <button onClick={action.onClick} className={`w-full text-left group bg-white dark:bg-slate-800 p-5 rounded-[24px] border dark:border-slate-700 ${action.border} shadow-[0_1px_2px_rgba(0,0,0,0.18),0_8px_24px_rgba(0,0,0,0.22)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full relative overflow-hidden`}>
                                        <CardContent />
                                    </button>
                                ) : (
                                    <Link to={action.path} className={`group bg-white dark:bg-slate-800 p-5 rounded-[24px] border dark:border-slate-700 ${action.border} shadow-[0_1px_2px_rgba(0,0,0,0.18),0_8px_24px_rgba(0,0,0,0.22)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full relative overflow-hidden`}>
                                        <CardContent />
                                    </Link>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Stats Cards (Span 5) */}
                <div className="lg:col-span-5 grid grid-cols-3 gap-4">
                    {[
                        { title: 'Active Borrows', count: activeBorrows.length, icon: <BookOpen className="text-blue-600 dark:text-blue-400" />, bg: 'bg-white dark:bg-slate-800', border: 'border-slate-700' },
                        { title: 'Books Read', count: returnedBorrows.length, icon: <CheckCircle className="text-emerald-600 dark:text-emerald-400" />, trend: '+18%', bg: 'bg-white dark:bg-slate-800', border: 'border-slate-700' },
                        { title: 'Total Borrows', count: borrows.length, icon: <Activity className="text-purple-600 dark:text-purple-400" />, bg: 'bg-white dark:bg-slate-800', border: 'border-slate-700' }
                    ].map((stat, idx) => (
                        <motion.div key={idx} variants={itemVariants} className={`bg-slate-100/50 dark:bg-slate-800/80 p-5 rounded-[24px] border dark:border-slate-700 ${stat.border} shadow-[0_1px_2px_rgba(0,0,0,0.18),0_8px_24px_rgba(0,0,0,0.22)] flex flex-col justify-between overflow-hidden`}>
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shadow-sm`}>
                                    {stat.icon}
                                </div>
                                {stat.trend && (
                                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                                        ▲ {stat.trend}
                                    </span>
                                )}
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-3xl  font-bold text-[#1a1f36] dark:text-white">{stat.count}</h2>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{stat.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                {/* Left Column (Span 8) */}
                <div className="xl:col-span-8 flex flex-col gap-8">
                    
                    {/* Currently Borrowed & Continue Reading */}
                    {activeBorrows.length > 0 ? (
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-teal-500/10 flex items-center justify-center text-[#0d5959] shadow-sm"><BookOpen size={20} /></span>
                                    Currently Borrowed
                                </h2>
                                <Link to="/dashboard/borrows" className="text-sm font-bold text-[#0d5959] hover:text-[#B4932D] dark:hover:text-blue-400 flex items-center gap-1.5 group bg-blue-500/10 dark:bg-blue-500/20 px-4 py-2 rounded-xl transition-colors">
                                    View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            
                            <div className="space-y-5">
                                {activeBorrows.map((borrow) => {
                                    const days = daysUntil(borrow.dueDate);
                                    const isUrgent = days <= 3;
                                    const progress = Math.floor(Math.random() * 60) + 10; // Mock progress

                                    return (
                                        <div key={borrow._id} className="group p-5 rounded-[24px] border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 hover:border-[#0F766E]/30 dark:hover:border-teal-500/30 bg-white dark:bg-slate-800 hover:shadow-xl dark:shadow-none transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                                            {/* Progress Bar Background (Subtle) */}
                                            <div className="absolute bottom-0 left-0 h-1 bg-slate-100 dark:bg-slate-700 w-full">
                                                <div className="h-full bg-gradient-to-r from-[#0F766E] to-[#D4AF37] dark:from-teal-500 dark:to-[#D4AF37]" style={{ width: `${progress}%` }}></div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-28 bg-slate-100 dark:bg-slate-700 rounded-xl shadow-md flex items-center justify-center overflow-hidden shrink-0 border dark:border-slate-700 border-slate-200/60 dark:border-slate-700">
                                                    {borrow.book?.coverImage ? (
                                                        <img src={borrow.book.coverImage} alt={borrow.book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <Book className="text-slate-500 dark:text-slate-400 text-3xl" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-[#1a1f36] dark:text-white text-xl line-clamp-1 group-hover:text-[#0F766E] dark:group-hover:text-teal-400 transition-colors">{borrow.book?.title}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{borrow.book?.author}</p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md">{borrow.book?.category?.name || 'Category'}</span>
                                                        <span className="text-xs font-bold text-[#0d5959]">{progress}% Read</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-start sm:items-end gap-3 sm:w-1/3">
                                                <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-sm ${isUrgent ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border dark:border-slate-700 border-slate-700' : 'bg-slate-50 dark:bg-slate-900 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border dark:border-slate-700 border-slate-200/60 dark:border-slate-700'}`}>
                                                    {isUrgent ? <AlertCircle size={14} /> : <CalendarIcon size={14} />}
                                                    {days > 0 ? `${days} Days Remaining` : 'Overdue!'}
                                                </div>
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <Link to={`/books/${borrow.book?._id}`} className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-center border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 shadow-sm">
                                                        Read
                                                    </Link>
                                                    <button
                                                        onClick={() => handleRenew(borrow._id)}
                                                        disabled={borrow.renewalsCount >= borrow.maxRenewals}
                                                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold bg-white dark:bg-slate-800 border-2 border-[#0F766E]/20 dark:border-teal-500/20 text-[#0d5959] rounded-xl hover:bg-blue-500 hover:text-white dark:hover:bg-teal-500 dark:hover:text-white disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-1.5"
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
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-[#ffb800]/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm"><Star className="fill-current" size={20} /></span>
                                    AI Recommended Picks
                                </h2>
                            </div>
                            <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x">
                                {displayRecommended.map(book => (
                                    <Link key={book._id} to={`/books/${book._id}`} className="snap-start shrink-0 w-[200px] group flex flex-col bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 overflow-hidden hover:shadow-xl dark:shadow-none hover:border-[#D4AF37]/30 dark:hover:border-[#D4AF37]/50 hover:-translate-y-2 transition-all duration-300">
                                        <div className="h-[280px] bg-slate-50 dark:bg-slate-900 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden border-b dark:border-slate-700 border-slate-200/60 dark:border-slate-700 relative">
                                            {book.coverImage ? (
                                                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <Book size={48} className="text-slate-700 dark:text-slate-200 dark:text-slate-600 group-hover:text-[#0d5959] transition-colors duration-300" />
                                            )}
                                            <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 border dark:border-slate-700 border-slate-100 dark:border-slate-600">
                                                <Star size={12} className="text-amber-500 fill-current" />
                                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{book.averageRating?.toFixed(1) || '4.5'}</span>
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="font-bold text-sm text-[#1a1f36] dark:text-white line-clamp-2 group-hover:text-[#0F766E] dark:group-hover:text-teal-400 transition-colors">{book.title}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-medium">{book.author}</p>
                                            <div className="mt-auto pt-3">
                                                <button className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-[#0d5959] font-bold text-xs rounded-xl group-hover:bg-blue-500 dark:group-hover:bg-teal-500 group-hover:text-white dark:group-hover:text-white transition-colors">View Details</button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Reading Trends Interactive Chart */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-8 flex-1 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                            <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white flex items-center gap-3">
                                <span className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm"><TrendingUp size={20} /></span>
                                Reading Trends
                            </h2>
                            <div className="flex items-center gap-4 text-sm font-bold bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border dark:border-slate-700 border-slate-200/60 dark:border-slate-700">
                                <button className="px-4 py-1.5 bg-white dark:bg-slate-800 dark:bg-slate-700 shadow-sm rounded-lg text-[#1a1f36] dark:text-white">Books</button>
                                <button className="px-4 py-1.5 text-slate-500 dark:text-slate-400 hover:text-[#1a1f36] dark:text-white dark:hover:text-white">Pages</button>
                                <button className="px-4 py-1.5 text-slate-500 dark:text-slate-400 hover:text-[#1a1f36] dark:text-white dark:hover:text-white">Hours</button>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-[288px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#E5E7EB"} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                                    <RechartsTooltip 
                                        cursor={{fill: isDark ? '#334155' : '#F1F5F9', opacity: 0.5}}
                                        contentStyle={{borderRadius: '16px', border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`, backgroundColor: isDark ? '#1E293B' : '#FFFFFF', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                                        itemStyle={{color: isDark ? '#2DD4BF' : '#0F766E', fontWeight: 800}}
                                        labelStyle={{color: '#94A3B8', fontWeight: 700, marginBottom: '4px'}}
                                    />
                                    <Bar dataKey="borrows" radius={[8, 8, 0, 0]} barSize={40}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? "url(#colorGradient)" : (isDark ? "#475569" : "#94A3B8")} />
                                        ))}
                                    </Bar>
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={isDark ? "#2DD4BF" : "#0F766E"} />
                                            <stop offset="100%" stopColor={isDark ? "#115E59" : "#115E59"} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column (Span 4) */}
                <div className="xl:col-span-4 flex flex-col gap-8">
                    
                    {/* Due This Week Widget */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl  font-bold text-[#1a1f36] dark:text-white flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm"><CalendarDays size={16} /></span>
                                Due This Week
                            </h2>
                        </div>
                        <div className={`bg-slate-50 dark:bg-slate-900 dark:bg-slate-700/30 rounded-2xl p-5 border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 flex items-center justify-center ${activeBorrows.filter(b => daysUntil(b.dueDate) <= 7 && daysUntil(b.dueDate) >= 0).length === 0 ? 'py-8' : ''}`}>
                            {activeBorrows.filter(b => daysUntil(b.dueDate) <= 7 && daysUntil(b.dueDate) >= 0).length > 0 ? (
                                <div className="space-y-4 w-full">
                                    {activeBorrows.filter(b => daysUntil(b.dueDate) <= 7 && daysUntil(b.dueDate) >= 0).map(borrow => (
                                        <div key={borrow._id} className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border dark:border-slate-700 border-slate-200/60 dark:border-slate-700">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-[#1a1f36] dark:text-white line-clamp-1">{borrow.book?.title}</span>
                                                <span className="text-xs font-bold text-orange-500 dark:text-orange-400">{format(new Date(borrow.dueDate), 'MMM do')}</span>
                                            </div>
                                            <span className="text-xs font-bold bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-md">{daysUntil(borrow.dueDate)} days</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mb-3">
                                        <CheckCircle size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No books due this week! 🎉</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Activity Timeline */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-8">
                        <h2 className="text-xl  font-bold text-[#1a1f36] dark:text-white mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm"><Clock size={16} /></span>
                            Recent Activity
                        </h2>
                        <div className="space-y-6 relative pl-2">
                            {/* Connecting Line */}
                            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-slate-200 dark:from-slate-700 to-transparent"></div>
                            
                            {recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex gap-5 relative group z-10">
                                    <div className={`w-9 h-9 rounded-full ${activity.color} border-2 border-white dark:border-slate-200/60 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                                        {activity.icon}
                                    </div>
                                    <div className="pt-1.5 pb-2">
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-snug">
                                            {activity.action} <span className="font-bold text-[#1a1f36] dark:text-white">{activity.title}</span>
                                        </p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                            {activity.date ? format(new Date(activity.date), 'MMM do, h:mm a') : 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Categories List */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-8 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl  font-bold text-[#1a1f36] dark:text-white flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-sm"><Compass size={16} /></span>
                                Explore
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 flex-1 content-start">
                            {categoryCards.map(cat => (
                                <Link 
                                    key={cat.name} 
                                    to={`/catalog?category=${cat.name}`}
                                    className={`flex items-center justify-between p-4 rounded-[20px] border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.18),0_8px_24px_rgba(0,0,0,0.22)] ${cat.hover} hover:-translate-y-1 transition-all duration-300 group bg-white dark:bg-slate-800`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${cat.bg} group-hover:scale-110 transition-transform duration-300`}>
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <span className="font-bold text-[#1a1f36] dark:text-white block group-hover:text-[#0F766E] dark:group-hover:text-teal-400 transition-colors text-sm">{cat.name}</span>
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{cat.count} Books</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 dark:bg-slate-700 flex items-center justify-center group-hover:bg-blue-500 dark:group-hover:bg-teal-500 group-hover:text-white text-slate-500 dark:text-slate-400 transition-colors">
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
