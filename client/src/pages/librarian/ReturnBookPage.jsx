import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReturnBookPage = () => {
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returningId, setReturningId] = useState(null);
    const [search, setSearch] = useState('');

    const fetchActiveBorrows = async () => {
        try {
            setLoading(true);
            const res = await api.get('/borrows');
            const allBorrows = res.data.data.borrows || [];
            setBorrows(allBorrows.filter(b => b.status === 'active'));
        } catch (err) {
            toast.error('Failed to load active borrows');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveBorrows();
    }, []);

    const handleReturn = async (id) => {
        try {
            setReturningId(id);
            const res = await api.put(`/borrows/${id}/return`);
            
            // Check if fine was generated
            if (res.data.data.borrow.fine) {
                toast.error('Book returned late. A fine has been generated.', { icon: '💰' });
            } else {
                toast.success('Book returned successfully!');
            }
            
            fetchActiveBorrows();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to return book');
        } finally {
            setReturningId(null);
        }
    };

    const filteredBorrows = borrows.filter(b => 
        b.book?.title.toLowerCase().includes(search.toLowerCase()) || 
        b.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        b.book?.isbn.includes(search)
    );

    const daysOverdue = (date) => Math.ceil((new Date() - new Date(date)) / 86400000);

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Process Returns</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Search active borrows and process book returns.</p>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 p-6 mb-6">
                <input
                    type="text"
                    placeholder="Search by book title, ISBN, or member name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-3 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:text-white dark:border-slate-700 bg-gray-50 dark:bg-slate-700 text-lg"
                />
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500 dark:text-slate-400">Loading active borrows...</div>
            ) : filteredBorrows.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-12 text-center text-gray-500 dark:text-slate-400">
                    <p className="text-4xl mb-4">📚</p>
                    <p className="text-lg">No active borrows found matching your search.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-700 border-b dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Member</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Book Info</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Due Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-700">
                            {filteredBorrows.map(borrow => {
                                const overdueDays = daysOverdue(borrow.dueDate);
                                const isOverdue = overdueDays > 0;
                                return (
                                    <tr key={borrow._id} className={`hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50/10' : ''}`}>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{borrow.user?.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">{borrow.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{borrow.book?.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">ISBN: {borrow.book?.isbn}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600 dark:text-slate-400'}`}>
                                                {new Date(borrow.dueDate).toLocaleDateString()}
                                            </span>
                                            {isOverdue && (
                                                <p className="text-xs text-red-500 mt-1">{overdueDays} days late</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleReturn(borrow._id)}
                                                disabled={returningId === borrow._id}
                                                className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                            >
                                                {returningId === borrow._id ? 'Returning...' : 'Process Return'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ReturnBookPage;
