import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const MyFinesPage = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(null);

    const fetchFines = async () => {
        try {
            setLoading(true);
            const res = await api.get('/fines/my');
            setFines(res.data.data.fines);
        } catch (err) {
            toast.error('Failed to load fines');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFines();
    }, []);

    const handlePay = async (id) => {
        try {
            setPaying(id);
            await api.put(`/fines/${id}/pay`);
            toast.success('Fine paid successfully!');
            fetchFines();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment failed');
        } finally {
            setPaying(null);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-[#0d5959] dark:border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const totalUnpaid = fines
        .filter(f => f.status === 'pending')
        .reduce((sum, f) => sum + f.amount, 0);

    return (
        <div className="max-w-5xl mx-auto py-8" style={{  }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl  font-bold text-[#1a1f36] dark:text-white">My Fines</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage and pay your library fines</p>
                </div>
                
                <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 shadow-sm flex flex-col items-end min-w-[200px]">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Total Unpaid</p>
                    <p className={`text-3xl font-bold ${totalUnpaid > 0 ? 'text-red-600 dark:text-red-400' : 'text-[#0d5959] dark:text-teal-500'}`}>
                        ${totalUnpaid.toFixed(2)}
                    </p>
                </div>
            </div>

            {fines.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-16 text-center shadow-sm">
                    <div className="w-24 h-24 bg-[#0d5959]/10 dark:bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0d5959] dark:text-teal-400">
                        <FiDollarSign size={40} />
                    </div>
                    <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white mb-3">No Fines</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto font-medium">
                        You have a perfectly clean record! Keep returning your books on time to avoid late fees.
                    </p>
                    <Link to="/catalog" className="inline-block px-8 py-3 bg-[#0d5959] dark:bg-teal-600 text-white font-bold rounded-xl hover:bg-[#0a4747] dark:hover:bg-teal-700 transition-all shadow-md shadow-[#0d5959]/20 dark:shadow-teal-900/20">
                        Borrow a Book
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {fines.map((fine) => (
                        <div key={fine._id} className={`bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 p-6 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm hover:shadow-md dark:shadow-none transition-shadow ${fine.status === 'pending' ? 'border-red-200 dark:border-red-900/30 bg-red-50/10 dark:bg-red-500/5' : 'border-slate-200/60 dark:border-slate-700'}`}>
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className={`shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${fine.status === 'pending' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-[#0d5959]/10 dark:bg-teal-500/10 text-[#0d5959] dark:text-teal-400'}`}>
                                    <FiDollarSign />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-[#1a1f36] dark:text-white mb-1">${fine.amount.toFixed(2)}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">{fine.reason}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-900 dark:bg-slate-700/50 inline-block px-3 py-1 rounded-md border dark:border-slate-700 border-slate-100 dark:border-slate-600">
                                        Book: <span className="font-semibold dark:text-slate-200">{fine.borrow?.book?.title || 'Unknown'}</span>
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t dark:border-slate-700 md:border-t-0 border-slate-200/60 dark:border-slate-700">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                                    fine.status === 'pending' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border dark:border-slate-700 border-red-100 dark:border-red-900/30' : 
                                    fine.status === 'paid' ? 'bg-[#0d5959]/10 dark:bg-teal-500/10 text-[#0d5959] dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                                }`}>
                                    {fine.status.toUpperCase()}
                                </span>
                                {fine.status === 'pending' && (
                                    <button
                                        onClick={() => handlePay(fine._id)}
                                        disabled={paying === fine._id}
                                        className="w-full md:w-auto px-8 py-3 bg-[#0d5959] dark:bg-teal-600 text-white font-bold rounded-xl hover:bg-[#0a4747] dark:hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md shadow-[#0d5959]/20 dark:shadow-teal-900/20 flex justify-center min-w-[140px]"
                                    >
                                        {paying === fine._id ? 'Processing...' : 'Pay Fine'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyFinesPage;
