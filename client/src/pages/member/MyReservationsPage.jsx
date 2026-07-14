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
            <div className="w-10 h-10 border-4 border-[#0d5959] dark:border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-8" style={{  }}>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl  font-bold text-[#1a1f36] dark:text-white">My Reservations</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your waitlist positions and claim ready books</p>
                </div>
            </div>

            {reservations.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-16 text-center shadow-sm">
                    <div className="w-24 h-24 bg-[#0d5959]/10 dark:bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0d5959] dark:text-teal-400">
                        <FiBookmark size={40} />
                    </div>
                    <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white mb-3">No Active Reservations</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto font-medium">
                        You have no books on hold. Find a book that's currently checked out and reserve it!
                    </p>
                    <Link to="/catalog" className="inline-block px-8 py-3 bg-[#0d5959] dark:bg-teal-600 text-white font-bold rounded-xl hover:bg-[#0a4747] dark:hover:bg-teal-700 transition-all shadow-md shadow-[#0d5959]/20 dark:shadow-teal-900/20">
                        Explore Catalog
                    </Link>
                </div>
            ) : (
                <div className="grid gap-8">
                    {reservations.map((res) => (
                        <div key={res._id} className={`bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 ${res.status === 'fulfilled' ? 'border-[#0d5959]/30 dark:border-teal-500/30 shadow-[#0d5959]/10 dark:shadow-teal-900/10' : 'border-slate-200/60 dark:border-slate-700 shadow-slate-200/50 dark:shadow-none'} p-6 md:p-8 flex flex-col gap-8 shadow-sm transition-all hover:shadow-md relative overflow-hidden`}>
                            
                            {/* Decorative background for fulfilled */}
                            {res.status === 'fulfilled' && (
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#0d5959] dark:bg-teal-500 opacity-[0.03] dark:opacity-[0.05] rounded-bl-full pointer-events-none"></div>
                            )}

                            {/* Top row: Book info & action */}
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
                                <Link to={`/books/${res.book?._id}`} className="shrink-0 w-28 h-40 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 group flex items-center justify-center shadow-sm">
                                    {res.book?.coverImage ? (
                                        <img src={res.book.coverImage} alt={res.book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <FiBook size={32} className="text-slate-700 dark:text-slate-200 dark:text-slate-500 group-hover:text-[#d4a853] transition-colors" />
                                    )}
                                </Link>

                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {res.status === 'fulfilled' ? (
                                            <span className="bg-green-100 dark:bg-emerald-500/20 text-green-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border dark:border-slate-700 border-green-200 dark:border-emerald-500/30">
                                                <FiCheckCircle /> READY FOR PICKUP
                                            </span>
                                        ) : (
                                            <span className="bg-yellow-50 dark:bg-[#ffb800]/20 text-yellow-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border dark:border-slate-700 border-yellow-200 dark:border-amber-500/30">
                                                <FiClock /> PENDING
                                            </span>
                                        )}
                                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                            Reserved on {new Date(res.reservationDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <Link to={`/books/${res.book?._id}`} className="text-2xl font-bold text-[#1a1f36] dark:text-white hover:text-[#0d5959] dark:hover:text-teal-400 transition-colors line-clamp-1 mb-1">
                                        {res.book?.title}
                                    </Link>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-base mb-4">{res.book?.author}</p>
                                    
                                    {res.status === 'pending' && (
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 dark:bg-slate-700/50 inline-block px-4 py-2 rounded-lg border dark:border-slate-700 border-slate-100 dark:border-slate-600">
                                            Estimated Wait: <span className="font-bold text-[#1a1f36] dark:text-white">~{(res.position || 1) * 14} Days</span>
                                        </p>
                                    )}
                                </div>
                                
                                <div className="w-full md:w-auto flex flex-col gap-3 min-w-[200px]">
                                    {res.status === 'fulfilled' ? (
                                        <button
                                            onClick={() => handleClaim(res._id)}
                                            disabled={claiming}
                                            className="w-full py-4 bg-[#0d5959] dark:bg-teal-600 text-white font-bold rounded-xl hover:bg-[#0a4747] dark:hover:bg-teal-700 hover:-translate-y-1 transition-all shadow-lg shadow-[#0d5959]/30 dark:shadow-teal-900/30 text-lg flex justify-center items-center gap-2"
                                        >
                                            {claiming ? 'Processing...' : <><FiCheck /> Claim Book</>}
                                        </button>
                                    ) : (
                                        <div className="bg-[#1a1f36] dark:bg-slate-700 text-white rounded-xl p-4 text-center shadow-md">
                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Queue Position</div>
                                            <div className="text-3xl font-bold">#{res.position}</div>
                                        </div>
                                    )}

                                    {res.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancel(res._id)}
                                            className="w-full py-2.5 bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/30 hover:text-red-600 transition-colors"
                                        >
                                            Cancel Reservation
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Progress Timeline Tracker */}
                            <div className="pt-6 border-t dark:border-slate-700 border-slate-200/60 dark:border-slate-700 relative z-10">
                                <div className="flex items-center justify-between relative">
                                    {/* Connecting Line */}
                                    <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-700 rounded-full z-0"></div>
                                    <div 
                                        className="absolute left-[10%] top-1/2 -translate-y-1/2 h-1 bg-[#0d5959] dark:bg-teal-500 rounded-full z-0 transition-all duration-1000"
                                        style={{ width: res.status === 'fulfilled' ? '80%' : '35%' }}
                                    ></div>
                                    
                                    {/* Step 1 */}
                                    <div className="relative z-10 flex flex-col items-center gap-2 w-1/3">
                                        <div className="w-8 h-8 rounded-full bg-[#0d5959] dark:bg-teal-500 text-white flex items-center justify-center shadow-md">
                                            <FiCheck size={16} />
                                        </div>
                                        <span className="text-xs font-bold text-[#1a1f36] dark:text-white">Reserved</span>
                                    </div>
                                    
                                    {/* Step 2 */}
                                    <div className="relative z-10 flex flex-col items-center gap-2 w-1/3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${res.status === 'fulfilled' || res.status === 'pending' ? 'bg-[#0d5959] dark:bg-teal-500 text-white' : 'bg-white dark:bg-slate-800 border-2 border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 dark:text-slate-600'}`}>
                                            {res.status === 'fulfilled' ? <FiCheck size={16} /> : <span className="font-bold text-sm">2</span>}
                                        </div>
                                        <span className={`text-xs font-bold ${res.status === 'fulfilled' || res.status === 'pending' ? 'text-[#1a1f36] dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                            Waitlist
                                        </span>
                                    </div>
                                    
                                    {/* Step 3 */}
                                    <div className="relative z-10 flex flex-col items-center gap-2 w-1/3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${res.status === 'fulfilled' ? 'bg-[#0d5959] dark:bg-teal-500 text-white ring-4 ring-[#0d5959]/20 dark:ring-teal-500/20' : 'bg-white dark:bg-slate-800 border-2 border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 dark:text-slate-600'}`}>
                                            {res.status === 'fulfilled' ? <FiCheck size={16} /> : <span className="font-bold text-sm">3</span>}
                                        </div>
                                        <span className={`text-xs font-bold ${res.status === 'fulfilled' ? 'text-[#1a1f36] dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
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
