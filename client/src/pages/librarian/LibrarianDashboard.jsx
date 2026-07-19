import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LibrarianDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        issuedToday: 0,
        returnedToday: 0,
        activeBorrows: 0
    });
    const [overdueBorrows, setOverdueBorrows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const res = await api.get('/borrows');
                const borrows = res.data.data.borrows || [];

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let issued = 0;
                let returned = 0;
                let active = 0;
                const overdue = [];

                borrows.forEach(borrow => {
                    const issueDate = new Date(borrow.createdAt);
                    if (issueDate >= today) issued++;

                    if (borrow.status === 'returned') {
                        const returnDate = new Date(borrow.returnDate);
                        if (returnDate >= today) returned++;
                    } else if (borrow.status === 'active') {
                        active++;
                        const dueDate = new Date(borrow.dueDate);
                        if (dueDate < new Date()) {
                            overdue.push(borrow);
                        }
                    }
                });

                setStats({ issuedToday: issued, returnedToday: returned, activeBorrows: active });
                setOverdueBorrows(overdue);
            } catch (err) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const daysOverdue = (date) => Math.ceil((new Date() - new Date(date)) / 86400000);

    if (loading) return <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Librarian Dashboard</h1>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name}</p>

            {/* Today's Activity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div
                    className="rounded-2xl border p-6 shadow-sm"
                    style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                    }}
                >
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Books Issued Today</p>
                    <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.issuedToday}</p>
                </div>
                <div
                    className="rounded-2xl border p-6 shadow-sm"
                    style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                    }}
                >
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Books Returned Today</p>
                    <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.returnedToday}</p>
                </div>
                <div
                    className="rounded-2xl border p-6 shadow-sm"
                    style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        borderLeft: '4px solid var(--secondary)',
                    }}
                >
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Total Active Borrows</p>
                    <p className="text-4xl font-bold" style={{ color: 'var(--secondary)' }}>{stats.activeBorrows}</p>
                </div>
            </div>

            {/* Overdue Alerts */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span className="text-red-500">⚠️</span> Overdue Alerts
                </h2>
                
                {overdueBorrows.length === 0 ? (
                    <div
                        className="rounded-xl border p-8 text-center shadow-sm"
                        style={{
                            backgroundColor: 'var(--surface)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        <span className="text-3xl mb-2 block">🎉</span>
                        <p>No overdue books right now!</p>
                    </div>
                ) : (
                    <div
                        className="rounded-xl border shadow-sm overflow-hidden"
                        style={{
                            backgroundColor: 'var(--surface)',
                            borderColor: 'var(--border)',
                        }}
                    >
                        <table className="w-full text-left">
                            <thead style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Member</th>
                                    <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Book</th>
                                    <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Due Date</th>
                                    <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Days Overdue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
                                {overdueBorrows.map(borrow => (
                                    <tr
                                        key={borrow._id}
                                        className="transition-colors"
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--danger-muted)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{borrow.user?.name}</p>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{borrow.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{borrow.book?.title}</p>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{borrow.book?.isbn}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            {new Date(borrow.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="px-3 py-1 rounded-full text-sm font-medium"
                                                style={{
                                                    backgroundColor: 'var(--danger-muted)',
                                                    color: 'var(--danger)',
                                                }}
                                            >
                                                {daysOverdue(borrow.dueDate)} days
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibrarianDashboard;
