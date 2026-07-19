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
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary)' }}></div>
        </div>
    );

    const totalUnpaid = fines
        .filter(f => f.status === 'pending')
        .reduce((sum, f) => sum + f.amount, 0);

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Fines</h1>
                    <p className="font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>Manage and pay your library fines</p>
                </div>
                
                <div
                    className="px-6 py-4 rounded-2xl border shadow-sm flex flex-col items-end min-w-[200px]"
                    style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                    }}
                >
                    <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Total Unpaid</p>
                    <p className="text-3xl font-bold" style={{ color: totalUnpaid > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        ${totalUnpaid.toFixed(2)}
                    </p>
                </div>
            </div>

            {fines.length === 0 ? (
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
                            backgroundColor: 'var(--success-muted)',
                            color: 'var(--success)',
                        }}
                    >
                        <FiDollarSign size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>No Fines</h2>
                    <p className="text-lg mb-8 max-w-md mx-auto font-medium" style={{ color: 'var(--text-secondary)' }}>
                        You have a perfectly clean record! Keep returning your books on time to avoid late fees.
                    </p>
                    <Link
                        to="/catalog"
                        className="inline-block px-8 py-3 text-white font-bold rounded-xl transition-all shadow-md ls-btn-primary"
                    >
                        Borrow a Book
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {fines.map((fine) => (
                        <div
                            key={fine._id}
                            className="rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm border transition-all duration-250"
                            style={{
                                backgroundColor: 'var(--surface)',
                                borderColor: fine.status === 'pending' ? 'var(--danger-muted)' : 'var(--border)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = fine.status === 'pending' ? 'var(--danger)' : 'var(--primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = fine.status === 'pending' ? 'var(--danger-muted)' : 'var(--border)'; }}
                        >
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div
                                    className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                                    style={{
                                        backgroundColor: fine.status === 'pending' ? 'var(--danger-muted)' : 'var(--success-muted)',
                                        color: fine.status === 'pending' ? 'var(--danger)' : 'var(--success)',
                                    }}
                                >
                                    <FiDollarSign />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>${fine.amount.toFixed(2)}</h3>
                                    <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>{fine.reason}</p>
                                    <p
                                        className="text-sm mt-2 inline-block px-3 py-1 rounded-md border"
                                        style={{
                                            backgroundColor: 'var(--surface-2)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        Book: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{fine.borrow?.book?.title || 'Unknown'}</span>
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0" style={{ borderColor: 'var(--border)' }}>
                                <span
                                    className="px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border"
                                    style={{
                                        backgroundColor: fine.status === 'pending' ? 'var(--danger-muted)' : 'var(--success-muted)',
                                        color: fine.status === 'pending' ? 'var(--danger)' : 'var(--success)',
                                        borderColor: fine.status === 'pending' ? 'var(--danger-muted)' : 'var(--success-muted)',
                                    }}
                                >
                                    {fine.status.toUpperCase()}
                                </span>
                                {fine.status === 'pending' && (
                                    <button
                                        onClick={() => handlePay(fine._id)}
                                        disabled={paying === fine._id}
                                        className="w-full md:w-auto px-8 py-3 text-white font-bold rounded-xl disabled:opacity-50 transition-all shadow-md flex justify-center min-w-[140px]"
                                        style={{
                                            backgroundColor: 'var(--primary)',
                                        }}
                                        onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
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
