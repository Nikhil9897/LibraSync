import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Heart, Trash2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyWishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users/wishlist');
            setWishlist(res.data.data.wishlist);
        } catch (err) {
            toast.error('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (bookId) => {
        try {
            await api.post(`/books/${bookId}/wishlist`);
            toast.success('Removed from wishlist');
            setWishlist(prev => prev.filter(b => b._id !== bookId));
        } catch (err) {
            toast.error('Failed to remove from wishlist');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-[#0d5959] dark:border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a1f36] dark:text-white flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-500 dark:text-pink-400">
                            <Heart size={24} />
                        </span>
                        My Wishlist
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                        {wishlist.length} {wishlist.length === 1 ? 'book' : 'books'} saved
                    </p>
                </div>
            </div>

            {wishlist.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-16 text-center shadow-sm">
                    <div className="w-24 h-24 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-500 dark:text-pink-400">
                        <Heart size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1a1f36] dark:text-white mb-3">Your Wishlist is Empty</h2>
                    <p className="text-slate-600 dark:text-slate-300 text-lg mb-8 max-w-md mx-auto font-medium">
                        You haven't saved any books yet. Check out our catalog to find your next great read!
                    </p>
                    <Link to="/catalog" className="inline-block px-8 py-3 bg-[#0d5959] text-white font-bold rounded-xl hover:bg-[#0a4747] transition-all shadow-md">
                        Explore Catalog
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((book) => (
                        <div key={book._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex gap-4 mb-4">
                                <Link to={`/books/${book._id}`} className="shrink-0 w-20 h-28 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden shadow-sm">
                                    {book.coverImage ? (
                                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 text-xs font-bold uppercase text-center p-2">No Cover</div>
                                    )}
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link to={`/books/${book._id}`}>
                                        <h3 className="text-base font-bold text-[#1a1f36] dark:text-white mb-1 line-clamp-2 hover:text-[#0d5959] dark:hover:text-teal-400 transition-colors leading-snug">
                                            {book.title}
                                        </h3>
                                    </Link>
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 truncate">{book.author}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${book.availableCopies > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                            {book.availableCopies > 0 ? `Available (${book.availableCopies} left)` : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                                <Link
                                    to={`/books/${book._id}`}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-[#1a1f36] dark:text-white font-bold text-sm rounded-xl hover:bg-[#0d5959] hover:text-white dark:hover:bg-teal-700 transition-colors"
                                >
                                    <BookOpen size={15} /> View Details
                                </Link>
                                <button
                                    onClick={() => handleRemove(book._id)}
                                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-colors"
                                    title="Remove from wishlist"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyWishlistPage;
