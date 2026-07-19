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
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Process Returns</h1>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Search active borrows and process book returns.</p>

            <div
                className="rounded-2xl border p-6 mb-6 shadow-sm"
                style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                }}
            >
                <input
                    type="text"
                    placeholder="Search by book title, ISBN, or member name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-transparent text-lg"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
            </div>

            {loading ? (
                <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading active borrows...</div>
            ) : filteredBorrows.length === 0 ? (
                <div
                    className="rounded-xl border p-12 text-center shadow-sm"
                    style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-secondary)',
                    }}
                >
                    <p className="text-4xl mb-4">📚</p>
                    <p className="text-lg">No active borrows found matching your search.</p>
                </div>
            ) : (
                <div
                    className="rounded-2xl border overflow-hidden shadow-sm"
                    style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                    }}
                >
                    <table className="w-full text-left">
                        <thead style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Member</th>
                                <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Book Info</th>
                                <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Due Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
                            {filteredBorrows.map(borrow => {
                                const overdueDays = daysOverdue(borrow.dueDate);
                                const isOverdue = overdueDays > 0;
                                return (
                                    <tr
                                        key={borrow._id}
                                        className="transition-colors"
                                        style={{
                                            backgroundColor: isOverdue ? 'var(--danger-muted)' : 'transparent',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = isOverdue ? 'var(--danger-muted)' : 'var(--surface-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = isOverdue ? 'var(--danger-muted)' : 'transparent'}
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{borrow.user?.name}</p>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{borrow.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{borrow.book?.title}</p>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>ISBN: {borrow.book?.isbn}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium" style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                                {new Date(borrow.dueDate).toLocaleDateString()}
                                            </span>
                                            {isOverdue && (
                                                <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{overdueDays} days late</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleReturn(borrow._id)}
                                                disabled={returningId === borrow._id}
                                                className="px-5 py-2 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                                                style={{ backgroundColor: 'var(--primary)' }}
                                                onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
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
