import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiBookmark, FiBook, FiCheck, FiClock, FiCheckCircle } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const MyReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const navigate = useNavigate();

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reservations/my');
            setReservations(res.data.data.reservations);
        } catch (err) {
            toast.error('Failed to load reservations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const handleCancel = async (id) => {
        if(window.confirm("Are you sure you want to cancel this reservation?")) {
            try {
                await api.delete(`/reservations/${id}`);
                toast.success('Reservation cancelled successfully');
                fetchReservations();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to cancel reservation');
            }
        }
    };

    const handleClaim = async (id) => {
        try {
            setClaiming(true);
            await api.post(`/reservations/${id}/claim`);
            toast.success('Book claimed and borrowed successfully!', { duration: 4000 });
            navigate('/borrows');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to claim book');
        } finally {
            setClaiming(false);
            fetchReservations();
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary)' }}></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Reservations</h1>
                    <p className="font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your waitlist positions and claim ready books</p>
                </div>
            </div>

            {reservations.length === 0 ? (
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
                        <FiBookmark size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>No Active Reservations</h2>
                    <p className="text-lg mb-8 max-w-md mx-auto font-medium" style={{ color: 'var(--text-secondary)' }}>
                        You have no books on hold. Find a book that's currently checked out and reserve it!
                    </p>
                    <Link
                        to="/catalog"
                        className="inline-block px-8 py-3 text-white font-bold rounded-xl transition-all shadow-md ls-btn-primary"
                    >
                        Explore Catalog
                    </Link>
                </div>
            ) : (
                <div className="grid gap-8">
                    {reservations.map((res) => (
                        <div
                            key={res._id}
                            className="rounded-3xl p-6 md:p-8 flex flex-col gap-8 shadow-sm border transition-all duration-250 hover:shadow-md relative overflow-hidden"
                            style={{
                                backgroundColor: 'var(--surface)',
                                borderColor: res.status === 'fulfilled' ? 'var(--primary)' : 'var(--border)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            {res.status === 'fulfilled' && (
                                <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] dark:opacity-[0.05] rounded-bl-full pointer-events-none" style={{ backgroundColor: 'var(--primary)' }}></div>
                            )}

                            {/* Top row: Book info & action */}
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
                                <Link
                                    to={`/books/${res.book?._id}`}
                                    className="shrink-0 w-28 h-40 rounded-xl overflow-hidden border group flex items-center justify-center shadow-sm"
                                    style={{
                                        backgroundColor: 'var(--surface-hover)',
                                        borderColor: 'var(--border)',
                                    }}
                                >
                                    {res.book?.coverImage ? (
                                        <img src={res.book.coverImage} alt={res.book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <FiBook size={32} style={{ color: 'var(--text-muted)' }} />
                                    )}
                                </Link>

                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {res.status === 'fulfilled' ? (
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border"
                                                style={{
                                                    backgroundColor: 'var(--success-muted)',
                                                    color: 'var(--success)',
                                                    borderColor: 'var(--success-muted)',
                                                }}
                                            >
                                                <FiCheckCircle /> READY FOR PICKUP
                                            </span>
                                        ) : (
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border"
                                                style={{
                                                    backgroundColor: 'var(--warning-muted)',
                                                    color: 'var(--warning)',
                                                    borderColor: 'var(--warning-muted)',
                                                }}
                                            >
                                                <FiClock /> PENDING
                                            </span>
                                        )}
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-bold uppercase border"
                                            style={{
                                                backgroundColor: 'var(--surface-2)',
                                                borderColor: 'var(--border)',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            Reserved on {new Date(res.reservationDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/books/${res.book?._id}`}
                                        className="text-2xl font-bold transition-colors line-clamp-1 mb-1 hover:underline"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {res.book?.title}
                                    </Link>
                                    <p className="font-medium text-base mb-4" style={{ color: 'var(--text-secondary)' }}>{res.book?.author}</p>
                                    
                                    {res.status === 'pending' && (
                                        <p
                                            className="text-sm font-medium inline-block px-4 py-2 rounded-lg border"
                                            style={{
                                                backgroundColor: 'var(--surface-2)',
                                                borderColor: 'var(--border)',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            Estimated Wait: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>~{res.estimatedWaitDays !== undefined ? res.estimatedWaitDays : (res.position || 1) * 14} Days</span>
                                        </p>
                                    )}
                                </div>
                                
                                <div className="w-full md:w-auto flex flex-col gap-3 min-w-[200px]">
                                    {res.status === 'fulfilled' ? (
                                        <button
                                            onClick={() => handleClaim(res._id)}
                                            disabled={claiming}
                                            className="w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg flex justify-center items-center gap-2"
                                            style={{
                                                backgroundColor: 'var(--primary)',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                                        >
                                            {claiming ? 'Processing...' : <><FiCheck /> Claim Book</>}
                                        </button>
                                    ) : (
                                        <div
                                            className="rounded-xl p-4 text-center shadow-md border"
                                            style={{
                                                backgroundColor: 'var(--surface-2)',
                                                borderColor: 'var(--border)',
                                            }}
                                        >
                                            <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Queue Position</div>
                                            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>#{res.position}</div>
                                        </div>
                                    )}

                                    {res.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancel(res._id)}
                                            className="w-full py-2.5 bg-transparent border font-bold rounded-xl transition-colors"
                                            style={{
                                                borderColor: 'var(--border)',
                                                color: 'var(--text-secondary)',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--danger-muted)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                                        >
                                            Cancel Reservation
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Progress Timeline Tracker */}
                            <div className="pt-6 border-t relative z-10" style={{ borderColor: 'var(--border)' }}>
                                <div className="flex items-center justify-between relative">
                                    {/* Connecting Line */}
                                    <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1 rounded-full z-0" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
                                    <div 
                                        className="absolute left-[10%] top-1/2 -translate-y-1/2 h-1 rounded-full z-0 transition-all duration-1000"
                                        style={{
                                            width: res.status === 'fulfilled' ? '80%' : '35%',
                                            backgroundColor: 'var(--primary)',
                                        }}
                                    ></div>
                                    
                                    {/* Step 1 */}
                                    <div className="relative z-10 flex flex-col items-center gap-2 w-1/3">
                                        <div className="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-md" style={{ backgroundColor: 'var(--primary)' }}>
                                            <FiCheck size={16} />
                                        </div>
                                        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Reserved</span>
                                    </div>
                                    
                                    {/* Step 2 */}
                                    <div className="relative z-10 flex flex-col items-center gap-2 w-1/3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors"
                                            style={{
                                                backgroundColor: res.status === 'fulfilled' || res.status === 'pending' ? 'var(--primary)' : 'var(--surface)',
                                                color: res.status === 'fulfilled' || res.status === 'pending' ? '#fff' : 'var(--text-muted)',
                                                border: res.status === 'fulfilled' || res.status === 'pending' ? 'none' : '2px solid var(--border)',
                                            }}
                                        >
                                            {res.status === 'fulfilled' ? <FiCheck size={16} /> : <span className="font-bold text-sm">2</span>}
                                        </div>
                                        <span className="text-xs font-bold" style={{ color: res.status === 'fulfilled' || res.status === 'pending' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                            Waitlist
                                        </span>
                                    </div>
                                    
                                    {/* Step 3 */}
                                    <div className="relative z-10 flex flex-col items-center gap-2 w-1/3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors"
                                            style={{
                                                backgroundColor: res.status === 'fulfilled' ? 'var(--primary)' : 'var(--surface)',
                                                color: res.status === 'fulfilled' ? '#fff' : 'var(--text-muted)',
                                                border: res.status === 'fulfilled' ? 'none' : '2px solid var(--border)',
                                            }}
                                        >
                                            {res.status === 'fulfilled' ? <FiCheck size={16} /> : <span className="font-bold text-sm">3</span>}
                                        </div>
                                        <span className="text-xs font-bold" style={{ color: res.status === 'fulfilled' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                            Ready to Claim
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyReservationsPage;
