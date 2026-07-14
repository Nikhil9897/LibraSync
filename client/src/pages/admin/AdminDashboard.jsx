import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { 
    Users, BookOpen, Clock, DollarSign, 
    Calendar as CalendarIcon, Upload, Download, UserPlus, FileText,
    ShieldCheck, ShieldAlert, CheckCircle2, XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [kpis, setKpis] = useState({ totalUsers: 0, totalBooks: 0, activeBorrows: 0, totalFines: 0 });
    const [trends, setTrends] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);
    const [systemHealth, setSystemHealth] = useState({ status: 'checking' });
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [kpiRes, trendsRes, popularRes] = await Promise.all([
                    api.get('/analytics/kpis'),
                    api.get('/analytics/borrow-trends'),
                    api.get('/analytics/popular-books')
                ]);
                
                // Fetch health check separately so it doesn't fail the whole dashboard if the API has a different route
                // The health endpoint is mounted at /api/health directly, not /api/v1/analytics
                try {
                    // Temporarily using axios directly or api with full path since api is likely configured with /api/v1 baseURL
                    const healthRes = await fetch('/api/health').then(res => res.json());
                    if (healthRes.status === 'ok') {
                        setSystemHealth({ status: 'ok' });
                    } else {
                        setSystemHealth({ status: 'error' });
                    }
                } catch (e) {
                    setSystemHealth({ status: 'error' });
                }

                setKpis(kpiRes.data.data.kpis);
                setTrends(trendsRes.data.data.trends);
                setPopularBooks(popularRes.data.data.popularBooks);
            } catch (err) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
        </div>
    );

    const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Custom Tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="text-slate-700 dark:text-slate-200 text-xs mb-1">{new Date(label).toLocaleDateString()}</p>
                    <p className="text-[#10B981] font-bold">Borrows: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-12 text-slate-200">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! <span className="animate-wave inline-block origin-[70%_70%]">👋</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening in your library today.</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 dark:bg-[#111827] px-4 py-2.5 rounded-xl border dark:border-slate-700 border-slate-200 dark:border-slate-200/60 dark:border-slate-700 shadow-sm">
                    <CalendarIcon size={18} className="text-[#10B981]" />
                    <div className="text-right">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{formattedDate}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{formattedTime}</p>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Users KPI */}
                <div className="bg-white dark:bg-slate-800 dark:bg-[#111827] rounded-2xl p-6 border-t-4 border-t-blue-500 shadow-sm border dark:border-slate-700 border-slate-200 dark:border-slate-200/60 dark:border-slate-700/50 relative overflow-hidden group flex flex-col justify-between h-[160px]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={64} className="text-[#0d5959]" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Users size={20} className="text-[#0d5959]" />
                        </div>
                        <h3 className="font-semibold text-slate-500 dark:text-slate-400">Total Users</h3>
                    </div>
                    <p className="text-4xl font-bold text-slate-800 dark:text-white">{kpis.totalUsers}</p>
                </div>

                {/* Books KPI */}
                <div className="bg-white dark:bg-slate-800 dark:bg-[#111827] rounded-2xl p-6 border-t-4 border-t-emerald-500 shadow-sm border dark:border-slate-700 border-slate-200 dark:border-slate-200/60 dark:border-slate-700/50 relative overflow-hidden group flex flex-col justify-between h-[160px]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BookOpen size={64} className="text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <BookOpen size={20} className="text-emerald-500" />
                        </div>
                        <h3 className="font-semibold text-slate-500 dark:text-slate-400">Total Books</h3>
                    </div>
                    <p className="text-4xl font-bold text-slate-800 dark:text-white">{kpis.totalBooks}</p>
                </div>

                {/* Active Borrows KPI */}
                <div className="bg-white dark:bg-slate-800 dark:bg-[#111827] rounded-2xl p-6 border-t-4 border-t-amber-500 shadow-sm border dark:border-slate-700 border-slate-200 dark:border-slate-200/60 dark:border-slate-700/50 relative overflow-hidden group flex flex-col justify-between h-[160px]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock size={64} className="text-amber-500" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#ffb800]/10 flex items-center justify-center">
                            <Clock size={20} className="text-amber-500" />
                        </div>
                        <h3 className="font-semibold text-slate-500 dark:text-slate-400">Active Borrows</h3>
                    </div>
                    <p className="text-4xl font-bold text-slate-800 dark:text-white">{kpis.activeBorrows}</p>
                </div>

                {/* Fines KPI */}
                <div className="bg-white dark:bg-slate-800 dark:bg-[#111827] rounded-2xl p-6 border-t-4 border-t-purple-500 shadow-sm border dark:border-slate-700 border-slate-200 dark:border-slate-200/60 dark:border-slate-700/50 relative overflow-hidden group flex flex-col justify-between h-[160px]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={64} className="text-purple-500" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <DollarSign size={20} className="text-purple-500" />
                        </div>
                        <h3 className="font-semibold text-slate-500 dark:text-slate-400">Total Fines</h3>
                    </div>
                    <p className="text-4xl font-bold text-slate-800 dark:text-white">${kpis.totalFines.toFixed(2)}</p>
                </div>
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 30-Day Trends */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 dark:bg-[#111827] rounded-2xl p-6 shadow-sm border dark:border-slate-700 border-slate-200 dark:border-slate-200/60 dark:border-slate-700/50 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">30-Day Borrowing Trends</h2>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        {trends.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(tick) => {
                                            const d = new Date(tick);
                                            return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 11 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 11 }}
                                    />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="borrows" 
                                        stroke="#10B981" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorBorrows)" 
                                        activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                                No borrowing data available for the last 30 days.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Quick Actions & Popular Books */}
                <div className="flex flex-col gap-6 lg:col-span-1">
                    
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-800 dark:bg-[#111827] rounded-2xl p-6 shadow-sm border dark:border-slate-700 border-slate-200 dark:border-slate-200/60 dark:border-slate-700/50">
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-5">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/admin/books" className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border dark:border-slate-700 border-slate-200/60 dark:border-slate-700">
                                <div className="bg-emerald-500/10 p-1.5 rounded-lg"><BookOpen size={16} className="text-emerald-500" /></div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Add Book</span>
                            </Link>
                            <Link to="/admin/issue" className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border dark:border-slate-700 border-slate-200/60 dark:border-slate-700">
                                <div className="bg-blue-500/10 p-1.5 rounded-lg"><Upload size={16} className="text-[#0d5959]" /></div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Issue Book</span>
                            </Link>
                            <Link to="/admin/return" className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border dark:border-slate-700 border-slate-200/60 dark:border-slate-700">
                                <div className="bg-[#ffb800]/10 p-1.5 rounded-lg"><Download size={16} className="text-amber-500" /></div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Return Book</span>
                            </Link>
                            <Link to="/admin/users" className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border dark:border-slate-700 border-slate-200/60 dark:border-slate-700">
                                <div className="bg-purple-500/10 p-1.5 rounded-lg"><UserPlus size={16} className="text-purple-500" /></div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Add User</span>
                            </Link>
                            <Link to="/admin/reports" className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border dark:border-slate-700 border-slate-200/60 dark:border-slate-700">
                                <div className="bg-teal-500/10 p-1.5 rounded-lg"><FileText size={16} className="text-teal-500" /></div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Reports</span>
                            </Link>
                            <Link to="/dashboard" className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border dark:border-slate-700 border-slate-200/60 dark:border-slate-700">
                                <div className="bg-orange-500/10 p-1.5 rounded-lg"><Users size={16} className="text-orange-500" /></div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Member View</span>
                            </Link>
                        </div>
                    </div>

                    {/* System Health */}
                    <div className={`rounded-2xl p-5 border dark:border-slate-700 shadow-sm relative overflow-hidden transition-all bg-white dark:bg-slate-800 ${
                        systemHealth.status === 'ok' 
                            ? 'border-emerald-200 dark:border-emerald-900/30' 
                            : systemHealth.status === 'error'
                            ? 'border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-500/5'
                            : 'border-slate-200 dark:border-slate-700'
                    }`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${
                            systemHealth.status === 'ok' ? 'bg-emerald-500/10 dark:bg-emerald-500/5' : systemHealth.status === 'error' ? 'bg-red-500/10' : 'bg-slate-50 dark:bg-slate-9000/10'
                        }`}></div>
                        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 relative z-10">System Health</h2>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    systemHealth.status === 'ok' ? 'bg-emerald-100 dark:bg-emerald-500/20' : systemHealth.status === 'error' ? 'bg-red-100 dark:bg-red-500/20' : 'bg-slate-100 bg-slate-50 dark:bg-slate-9000/20'
                                }`}>
                                    {systemHealth.status === 'ok' && <ShieldCheck size={24} className="text-emerald-600 dark:text-emerald-400" />}
                                    {systemHealth.status === 'error' && <ShieldAlert size={24} className="text-red-600 dark:text-red-400" />}
                                    {systemHealth.status === 'checking' && <div className="w-6 h-6 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <p className={`text-base font-bold tracking-tight ${
                                            systemHealth.status === 'ok' ? 'text-slate-800 dark:text-white' : systemHealth.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'
                                        }`}>
                                            {systemHealth.status === 'ok' ? 'All Systems Operational' : systemHealth.status === 'error' ? 'System Degraded' : 'Checking Systems...'}
                                        </p>
                                        
                                        {/* Heartbeat Line */}
                                        {systemHealth.status === 'ok' && (
                                            <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80 hidden sm:block">
                                                <path d="M0 10 H15 L20 2 L25 18 L30 10 H60" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-heartbeat filter drop-shadow-[0_0_2px_rgba(16,185,129,0.5)]" />
                                            </svg>
                                        )}
                                        {systemHealth.status === 'error' && (
                                            <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80 hidden sm:block">
                                                <path d="M0 10 H60" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className={`text-xs mt-0.5 ${
                                        systemHealth.status === 'ok' ? 'text-slate-500 dark:text-slate-400' : systemHealth.status === 'error' ? 'text-red-500 dark:text-red-400/70' : 'text-slate-500'
                                    }`}>
                                        {systemHealth.status === 'ok' ? 'Everything is running smoothly.' : systemHealth.status === 'error' ? 'Backend health check failed.' : 'Awaiting response...'}
                                    </p>
                                </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                                systemHealth.status === 'ok' ? 'bg-emerald-100 dark:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] dark:shadow-[0_0_20px_rgba(16,185,129,0.4)]' : systemHealth.status === 'error' ? 'bg-red-100 dark:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] dark:shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-slate-100 dark:bg-slate-700'
                            }`}>
                                {systemHealth.status === 'ok' && <CheckCircle2 size={20} className="text-emerald-600 dark:text-white" />}
                                {systemHealth.status === 'error' && <XCircle size={20} className="text-red-600 dark:text-white" />}
                            </div>
                        </div>
                    </div>

                    {/* Popular Books */}
                    <div className="bg-white dark:bg-slate-800 dark:bg-[#111827] rounded-2xl p-6 shadow-sm border dark:border-slate-700 border-slate-200 dark:border-slate-200/60 dark:border-slate-700/50 flex-1 flex flex-col">
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-5">Most Popular Books</h2>
                        <div className="flex-1 min-h-[200px]">
                            {popularBooks.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={popularBooks} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
                                        <XAxis type="number" hide />
                                        <YAxis 
                                            dataKey="title" 
                                            type="category" 
                                            axisLine={false} 
                                            tickLine={false}
                                            tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                            width={140}
                                        />
                                        <RechartsTooltip 
                                            cursor={{ fill: 'transparent' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-700 p-2 rounded-lg shadow-xl text-xs">
                                                            <p className="text-slate-700 dark:text-white mb-1 truncate max-w-[150px]">{payload[0].payload.title}</p>
                                                            <p className="text-[#3B82F6] font-bold">{payload[0].value} Borrows</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="borrows" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={12} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                    No borrowing data available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
