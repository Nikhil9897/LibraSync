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
            <div className="w-10 h-10 border-4 border-[#0d5959] dark:border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-8" style={{  }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl  font-bold text-[#1a1f36] dark:text-white">My Borrow History</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your active borrows and reading history</p>
                </div>
            </div>

            {borrows.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-16 text-center shadow-sm">
                    <div className="w-24 h-24 bg-[#0d5959]/10 dark:bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0d5959] dark:text-teal-500">
                        <FiBookOpen size={40} />
                    </div>
                    <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white mb-3">No Borrows Found</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto font-medium">
                        You haven't borrowed any books yet. Check out our catalog to find your next great read!
                    </p>
                    <Link to="/catalog" className="inline-block px-8 py-3 bg-[#0d5959] dark:bg-teal-600 text-white font-bold rounded-xl hover:bg-[#0a4747] dark:hover:bg-teal-700 transition-all shadow-md shadow-[#0d5959]/20 dark:shadow-teal-900/20">
                        Explore Catalog
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {borrows.map((borrow) => {
                        const days = daysUntil(borrow.dueDate);
                        const isUrgent = days <= 3 && borrow.status === 'active';
                        
                        return (
                            <div key={borrow._id} className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md dark:shadow-none transition-shadow">
                                <div className="shrink-0 w-24 h-36 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 group">
                                    {borrow.book?.coverImage ? (
                                        <img src={borrow.book.coverImage} alt={borrow.book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-700 dark:text-slate-200 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 dark:bg-slate-700 text-xs uppercase font-bold text-center p-2">
                                            No Cover
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="text-xl font-bold text-[#1a1f36] dark:text-white mb-1">{borrow.book?.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-4">{borrow.book?.author}</p>
                                    
                                    <div className="flex flex-wrap gap-3 text-sm">
                                        <span className={`px-3 py-1 rounded-full font-bold shadow-sm ${
                                            borrow.status === 'active' ? 'bg-[#0d5959]/10 text-[#0d5959] dark:bg-teal-500/10 dark:text-teal-400' : 'bg-green-50 text-green-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                        }`}>
                                            {borrow.status.toUpperCase()}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-700 dark:text-slate-200 py-1 font-medium bg-slate-50 dark:bg-slate-900 dark:bg-slate-700/50 px-3 rounded-full border dark:border-slate-700 border-slate-100 dark:border-slate-600">
                                            Issued: {new Date(borrow.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-start md:items-end justify-center gap-3 border-t dark:border-slate-700 md:border-t-0 md:border-l border-slate-200/60 dark:border-slate-700 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                                    {borrow.status === 'active' ? (
                                        <>
                                            <div className="text-center md:text-right w-full">
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">Due Date</p>
                                                <p className={`font-bold text-lg ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-[#1a1f36] dark:text-white'}`}>
                                                    {days > 0 ? `In ${days} Days` : 'Overdue!'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRenew(borrow._id)}
                                                disabled={borrow.renewalsCount >= borrow.maxRenewals}
                                                className="w-full px-5 py-2.5 bg-[#0d5959] dark:bg-teal-600 text-white font-bold rounded-xl hover:bg-[#0a4747] dark:hover:bg-teal-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-500 transition-all shadow-md shadow-[#0d5959]/20 dark:shadow-teal-900/20 disabled:shadow-none"
                                            >
                                                Renew ({borrow.renewalsCount}/{borrow.maxRenewals})
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center md:text-right w-full bg-slate-50 dark:bg-slate-900 dark:bg-slate-700/50 p-4 rounded-xl border dark:border-slate-700 border-slate-200/60 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">Returned On</p>
                                            <p className="font-bold text-[#1a1f36] dark:text-white">
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
