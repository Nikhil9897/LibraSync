import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiBookOpen } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const MyBorrowsPage = () => {
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBorrows = async () => {
        try {
            setLoading(true);
            const res = await api.get('/borrows/my');
            setBorrows(res.data.data.borrows);
        } catch (err) {
            toast.error('Failed to load borrow history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBorrows();
    }, []);

    const handleRenew = async (borrowId) => {
        try {
            await api.put(`/borrows/${borrowId}/renew`);
            toast.success('Book renewed successfully!');
            fetchBorrows();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Renewal failed');
        }
    };

    const daysUntil = (date) => Math.ceil((new Date(date) - new Date()) / 86400000);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary)' }}></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Borrow History</h1>
                    <p className="font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your active borrows and reading history</p>
                </div>
            </div>

            {borrows.length === 0 ? (
                <div
                    className="rounded-3xl p-16 text-center shadow-sm border"
                    style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                    }}
                >
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{
                            backgroundColor: 'var(--primary-muted)',
                            color: 'var(--primary)',
                        }}
                    >
                        <FiBookOpen size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>No Borrows Found</h2>
                    <p className="text-lg mb-8 max-w-md mx-auto font-medium" style={{ color: 'var(--text-secondary)' }}>
                        You haven't borrowed any books yet. Check out our catalog to find your next great read!
                    </p>
                    <Link
                        to="/catalog"
                        className="inline-block px-8 py-3 text-white font-bold rounded-xl transition-all shadow-md ls-btn-primary"
                    >
                        Explore Catalog
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {borrows.map((borrow) => {
                        const days = daysUntil(borrow.dueDate);
                        const isUrgent = days <= 3 && borrow.status === 'active';
                        
                        return (
                            <div
                                key={borrow._id}
                                className="rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-sm border transition-all duration-250"
                                style={{
                                    backgroundColor: 'var(--surface)',
                                    borderColor: 'var(--border)',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div
                                    className="shrink-0 w-24 h-36 rounded-lg overflow-hidden border flex items-center justify-center"
                                    style={{
                                        backgroundColor: 'var(--surface-hover)',
                                        borderColor: 'var(--border)',
                                    }}
                                >
                                    {borrow.book?.coverImage ? (
                                        <img src={borrow.book.coverImage} alt={borrow.book.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-xs uppercase font-bold text-center p-2" style={{ color: 'var(--text-muted)' }}>
                                            No Cover
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{borrow.book?.title}</h3>
                                    <p className="font-medium text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{borrow.book?.author}</p>
                                    
                                    <div className="flex flex-wrap gap-3 text-sm">
                                        <span
                                            className="px-3 py-1 rounded-full font-bold shadow-sm"
                                            style={{
                                                backgroundColor: borrow.status === 'active' ? 'var(--primary-muted)' : 'var(--success-muted)',
                                                color: borrow.status === 'active' ? 'var(--primary)' : 'var(--success)',
                                            }}
                                        >
                                            {borrow.status.toUpperCase()}
                                        </span>
                                        <span
                                            className="py-1 font-medium px-3 rounded-full border"
                                            style={{
                                                backgroundColor: 'var(--surface-2)',
                                                borderColor: 'var(--border)',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            Issued: {new Date(borrow.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                
                                <div
                                    className="flex flex-col items-start md:items-end justify-center gap-3 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 min-w-[200px]"
                                    style={{ borderColor: 'var(--border)' }}
                                >
                                    {borrow.status === 'active' ? (
                                        <>
                                            <div className="text-center md:text-right w-full">
                                                <p className="text-sm mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Due Date</p>
                                                <p className="font-bold text-lg" style={{ color: isUrgent ? 'var(--danger)' : 'var(--text-primary)' }}>
                                                    {days > 0 ? `In ${days} Days` : 'Overdue!'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRenew(borrow._id)}
                                                disabled={borrow.renewalsCount >= borrow.maxRenewals}
                                                className="w-full px-5 py-2.5 text-white font-bold rounded-xl disabled:opacity-50 transition-all shadow-md"
                                                style={{
                                                    backgroundColor: 'var(--primary)',
                                                }}
                                                onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
                                            >
                                                Renew ({borrow.renewalsCount}/{borrow.maxRenewals})
                                            </button>
                                        </>
                                    ) : (
                                        <div
                                            className="text-center md:text-right w-full p-4 rounded-xl border"
                                            style={{
                                                backgroundColor: 'var(--surface-2)',
                                                borderColor: 'var(--border)',
                                            }}
                                        >
                                            <p className="text-sm mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Returned On</p>
                                            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                                {new Date(borrow.returnDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyBorrowsPage;
