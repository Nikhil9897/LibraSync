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

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400">Loading dashboard...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-2">Librarian Dashboard</h1>
            <p className="text-gray-500 dark:text-slate-400 mb-8">Welcome back, {user?.name}</p>

            {/* Today's Activity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Books Issued Today</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.issuedToday}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Books Returned Today</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.returnedToday}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 p-6 shadow-sm border-l-4 border-l-blue-500">
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Total Active Borrows</p>
                    <p className="text-4xl font-bold text-blue-600">{stats.activeBorrows}</p>
                </div>
            </div>

            {/* Overdue Alerts */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-red-500">⚠️</span> Overdue Alerts
                </h2>
                
                {overdueBorrows.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-8 text-center text-gray-500 dark:text-slate-400 shadow-sm">
                        <span className="text-3xl mb-2 block">🎉</span>
                        <p>No overdue books right now!</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-700 border-b dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Member</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Book</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Due Date</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Days Overdue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-slate-700">
                                {overdueBorrows.map(borrow => (
                                    <tr key={borrow._id} className="hover:bg-red-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{borrow.user?.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">{borrow.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{borrow.book?.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">{borrow.book?.isbn}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                                            {new Date(borrow.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
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
