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
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary)' }}></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                        <span className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--danger-muted)', color: 'var(--danger)' }}>
                            <Heart size={24} />
                        </span>
                        My Wishlist
                    </h1>
                    <p className="font-medium mt-2" style={{ color: 'var(--text-secondary)' }}>
                        {wishlist.length} {wishlist.length === 1 ? 'book' : 'books'} saved
                    </p>
                </div>
            </div>

            {wishlist.length === 0 ? (
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
                            backgroundColor: 'var(--danger-muted)',
                            color: 'var(--danger)',
                        }}
                    >
                        <Heart size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Your Wishlist is Empty</h2>
                    <p className="text-lg mb-8 max-w-md mx-auto font-medium" style={{ color: 'var(--text-secondary)' }}>
                        You haven't saved any books yet. Check out our catalog to find your next great read!
                    </p>
                    <Link
                        to="/catalog"
                        className="inline-block px-8 py-3 text-white font-bold rounded-xl transition-all shadow-md ls-btn-primary"
                    >
                        Explore Catalog
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((book) => (
                        <div
                            key={book._id}
                            className="rounded-2xl p-5 flex flex-col shadow-sm border transition-all duration-250 group"
                            style={{
                                backgroundColor: 'var(--surface)',
                                borderColor: 'var(--border)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div className="flex gap-4 mb-4">
                                <Link
                                    to={`/books/${book._id}`}
                                    className="shrink-0 w-20 h-28 rounded-xl overflow-hidden shadow-sm flex items-center justify-center border"
                                    style={{
                                        backgroundColor: 'var(--surface-hover)',
                                        borderColor: 'var(--border)',
                                    }}
                                >
                                    {book.coverImage ? (
                                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-xs font-bold uppercase text-center p-2" style={{ color: 'var(--text-muted)' }}>No Cover</div>
                                    )}
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link to={`/books/${book._id}`}>
                                        <h3
                                            className="text-base font-bold mb-1 line-clamp-2 hover:underline leading-snug"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {book.title}
                                        </h3>
                                    </Link>
                                    <p className="text-sm font-semibold mb-3 truncate" style={{ color: 'var(--text-secondary)' }}>{book.author}</p>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: book.availableCopies > 0 ? 'var(--success)' : 'var(--danger)' }}
                                        />
                                        <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                                            {book.availableCopies > 0 ? `Available (${book.availableCopies} left)` : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
                                <Link
                                    to={`/books/${book._id}`}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-bold text-sm rounded-xl transition-colors"
                                    style={{
                                        backgroundColor: 'var(--surface-hover)',
                                        color: 'var(--text-primary)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                >
                                    <BookOpen size={15} /> View Details
                                </Link>
                                <button
                                    onClick={() => handleRemove(book._id)}
                                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-colors"
                                    style={{
                                        backgroundColor: 'var(--danger-muted)',
                                        color: 'var(--danger)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--danger)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--danger-muted)'; e.currentTarget.style.color = 'var(--danger)'; }}
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
