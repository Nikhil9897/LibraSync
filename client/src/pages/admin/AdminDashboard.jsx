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
                
                try {
                    const healthRes = await fetch('/api/health').then(res => res.json());
                    setSystemHealth({ status: healthRes.status === 'ok' ? 'ok' : 'error' });
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }} />
        </div>
    );

    const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Chart tooltip using tokens
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="p-3.5 rounded-xl shadow-2xl"
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <p className="text-[10px] uppercase font-bold tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                        <p className="font-bold text-lg leading-none" style={{ color: 'var(--text-primary)' }}>
                            {payload[0].value} <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Borrows</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    // KPI stat cards — semantic colors per metric
    const kpiCards = [
        {
            label: 'Total Users',
            value: kpis.totalUsers,
            icon: <Users size={20} />,
            accentColor: 'var(--secondary)',          // info = blue
            topBorderColor: 'var(--secondary)',
            iconBg: 'var(--secondary-muted)',
        },
        {
            label: 'Total Books',
            value: kpis.totalBooks,
            icon: <BookOpen size={20} />,
            accentColor: 'var(--success)',             // books = green
            topBorderColor: 'var(--success)',
            iconBg: 'var(--success-muted)',
        },
        {
            label: 'Active Borrows',
            value: kpis.activeBorrows,
            icon: <Clock size={20} />,
            accentColor: 'var(--warning)',             // active/time = amber
            topBorderColor: 'var(--warning)',
            iconBg: 'var(--warning-muted)',
        },
        {
            label: 'Total Fines',
            value: `$${kpis.totalFines.toFixed(2)}`,
            icon: <DollarSign size={20} />,
            // Fines = red if non-zero, muted if zero
            accentColor: kpis.totalFines > 0 ? 'var(--danger)' : 'var(--text-muted)',
            topBorderColor: kpis.totalFines > 0 ? 'var(--danger)' : 'var(--border-strong)',
            iconBg: kpis.totalFines > 0 ? 'var(--danger-muted)' : 'var(--surface-hover)',
        },
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! <span className="animate-wave inline-block origin-[70%_70%]">👋</span>
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Here's what's happening in your library today.</p>
                </div>
                <div
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-sm"
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <CalendarIcon size={18} style={{ color: 'var(--primary)' }} />
                    <div className="text-right">
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{formattedDate}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{formattedTime}</p>
                    </div>
                </div>
            </div>

            {/* KPI Grid — stat cards with subtle top border + tinted icon bg */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {kpiCards.map((card, idx) => (
                    <div
                        key={idx}
                        className="rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[160px] transition-all duration-250"
                        style={{
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderTop: `2px solid ${card.topBorderColor}`,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px color-mix(in srgb, ${card.accentColor} 10%, transparent)`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        {/* Ghost watermark icon */}
                        <div className="absolute top-0 right-0 p-4 opacity-[0.06] pointer-events-none" style={{ color: card.accentColor }}>
                            {card.icon && <div style={{ transform: 'scale(3)', transformOrigin: 'top right' }}>{card.icon}</div>}
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: card.iconBg, color: card.accentColor }}
                            >
                                {card.icon}
                            </div>
                            <h3 className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{card.label}</h3>
                        </div>
                        <p className="text-4xl font-bold relative z-10" style={{ color: card.accentColor }}>
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 30-Day Trends Chart */}
                <div
                    className="lg:col-span-2 rounded-2xl p-6 shadow-sm flex flex-col"
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>30-Day Borrowing Trends</h2>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        {trends.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.6} />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(tick) => {
                                            const d = new Date(tick);
                                            return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
                                        dy={15}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
                                        dx={-10}
                                    />
                                    <RechartsTooltip 
                                        content={<CustomTooltip />} 
                                        cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.4 }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="borrows" 
                                        stroke="var(--primary)" 
                                        strokeWidth={2.5}
                                        fillOpacity={1} 
                                        fill="url(#colorBorrows)" 
                                        activeDot={{ r: 5, fill: 'var(--primary)', stroke: 'var(--surface)', strokeWidth: 3 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                                No borrowing data available for the last 30 days.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6 lg:col-span-1">
                    
                    {/* Quick Actions */}
                    <div
                        className="rounded-2xl p-6 shadow-sm"
                        style={{
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)',
                        }}
                    >
                        <h2 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { to: '/admin/books',   icon: <BookOpen size={16} />,  label: 'Add Book',   color: 'var(--success)',   bg: 'var(--success-muted)' },
                                { to: '/admin/issue',   icon: <Upload size={16} />,    label: 'Issue Book', color: 'var(--secondary)', bg: 'var(--secondary-muted)' },
                                { to: '/admin/return',  icon: <Download size={16} />,  label: 'Return Book',color: 'var(--warning)',   bg: 'var(--warning-muted)' },
                                { to: '/admin/users',   icon: <UserPlus size={16} />,  label: 'Add User',   color: 'var(--accent-purple)', bg: 'rgba(139,92,246,0.1)' },
                                { to: '/admin/reports', icon: <FileText size={16} />,  label: 'Reports',    color: 'var(--primary)',   bg: 'var(--primary-muted)' },
                                { to: '/dashboard',     icon: <Users size={16} />,     label: 'Member View',color: 'var(--warning)',   bg: 'var(--warning-muted)' },
                            ].map(action => (
                                <Link
                                    key={action.to}
                                    to={action.to}
                                    className="flex items-center gap-2 p-3 rounded-xl transition-all duration-250"
                                    style={{
                                        backgroundColor: 'var(--surface-2)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-secondary)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; e.currentTarget.style.borderColor = action.color; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: action.bg, color: action.color }}>
                                        {action.icon}
                                    </div>
                                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* System Health */}
                    <div
                        className="rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all"
                        style={{
                            backgroundColor: 'var(--surface)',
                            border: `1px solid ${systemHealth.status === 'ok' ? 'var(--success-muted)' : systemHealth.status === 'error' ? 'var(--danger-muted)' : 'var(--border)'}`,
                        }}
                    >
                        <h2 className="text-xs font-bold uppercase tracking-wider mb-4 relative z-10" style={{ color: 'var(--text-secondary)' }}>System Health</h2>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{
                                        backgroundColor: systemHealth.status === 'ok' ? 'var(--success-muted)' : systemHealth.status === 'error' ? 'var(--danger-muted)' : 'var(--surface-hover)',
                                        color: systemHealth.status === 'ok' ? 'var(--success)' : systemHealth.status === 'error' ? 'var(--danger)' : 'var(--text-muted)',
                                    }}
                                >
                                    {systemHealth.status === 'ok'       && <ShieldCheck size={24} />}
                                    {systemHealth.status === 'error'     && <ShieldAlert size={24} />}
                                    {systemHealth.status === 'checking'  && <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border-strong)', borderTopColor: 'transparent' }} />}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <p
                                            className="text-base font-bold tracking-tight"
                                            style={{
                                                color: systemHealth.status === 'ok' ? 'var(--text-primary)' : systemHealth.status === 'error' ? 'var(--danger)' : 'var(--text-primary)',
                                            }}
                                        >
                                            {systemHealth.status === 'ok' ? 'All Systems Operational' : systemHealth.status === 'error' ? 'System Degraded' : 'Checking Systems...'}
                                        </p>
                                        {systemHealth.status === 'ok' && (
                                            <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80 hidden sm:block">
                                                <path d="M0 10 H15 L20 2 L25 18 L30 10 H60" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-heartbeat" />
                                            </svg>
                                        )}
                                        {systemHealth.status === 'error' && (
                                            <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80 hidden sm:block">
                                                <path d="M0 10 H60" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                        {systemHealth.status === 'ok' ? 'Everything is running smoothly.' : systemHealth.status === 'error' ? 'Backend health check failed.' : 'Awaiting response...'}
                                    </p>
                                </div>
                            </div>
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                style={{
                                    backgroundColor: systemHealth.status === 'ok' ? 'var(--success-muted)' : systemHealth.status === 'error' ? 'var(--danger-muted)' : 'var(--surface-hover)',
                                    color: systemHealth.status === 'ok' ? 'var(--success)' : systemHealth.status === 'error' ? 'var(--danger)' : 'var(--text-muted)',
                                }}
                            >
                                {systemHealth.status === 'ok'    && <CheckCircle2 size={20} />}
                                {systemHealth.status === 'error'  && <XCircle size={20} />}
                            </div>
                        </div>
                    </div>

                    {/* Popular Books Chart */}
                    <div
                        className="rounded-2xl p-6 shadow-sm flex-1 flex flex-col"
                        style={{
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)',
                        }}
                    >
                        <h2 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: 'var(--text-primary)' }}>Most Popular Books</h2>
                        <div className="flex-1 min-h-[200px]">
                            {popularBooks.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={popularBooks} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.6} />
                                        <XAxis type="number" hide />
                                        <YAxis 
                                            dataKey="title" 
                                            type="category" 
                                            axisLine={false} 
                                            tickLine={false}
                                            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                            width={140}
                                        />
                                        <RechartsTooltip 
                                            cursor={{ fill: 'var(--primary-muted)' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div
                                                            className="p-2 rounded-lg shadow-xl text-xs"
                                                            style={{
                                                                backgroundColor: 'var(--surface)',
                                                                border: '1px solid var(--border)',
                                                            }}
                                                        >
                                                            <p className="mb-1 truncate max-w-[150px]" style={{ color: 'var(--text-primary)' }}>{payload[0].payload.title}</p>
                                                            <p className="font-bold" style={{ color: 'var(--secondary)' }}>{payload[0].value} Borrows</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="borrows" fill="var(--secondary)" radius={[0, 4, 4, 0]} barSize={12} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
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
