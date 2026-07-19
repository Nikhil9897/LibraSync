import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiStar, FiTrash2, FiMessageSquare } from 'react-icons/fi';

const MyReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reviews/user/me');
            setReviews(res.data.data.reviews);
        } catch (err) {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                await api.delete(`/reviews/${id}`);
                toast.success('Review deleted successfully');
                fetchReviews();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete review');
            }
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
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Reviews</h1>
                    <p className="font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>Manage feedback you've shared about books</p>
                </div>
            </div>

            {reviews.length === 0 ? (
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
                        <FiMessageSquare size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>No Reviews Yet</h2>
                    <p className="text-lg mb-8 max-w-md mx-auto font-medium" style={{ color: 'var(--text-secondary)' }}>
                        You haven't reviewed any books yet. Borrow a book and share your thoughts to help others!
                    </p>
                    <Link
                        to="/catalog"
                        className="inline-block px-8 py-3 text-white font-bold rounded-xl transition-all shadow-md ls-btn-primary"
                    >
                        Explore Books
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reviews.map((review) => (
                        <div
                            key={review._id}
                            className="rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-sm border transition-all duration-250"
                            style={{
                                backgroundColor: 'var(--surface)',
                                borderColor: 'var(--border)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <Link
                                to={`/books/${review.book?._id}`}
                                className="shrink-0 w-32 h-48 rounded-lg overflow-hidden border group flex items-center justify-center"
                                style={{
                                    backgroundColor: 'var(--surface-hover)',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                {review.book?.coverImage ? (
                                    <img src={review.book.coverImage} alt={review.book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="text-xs uppercase font-bold text-center p-2" style={{ color: 'var(--text-muted)' }}>
                                        No Cover
                                    </div>
                                )}
                            </Link>
                            
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <Link
                                            to={`/books/${review.book?._id}`}
                                            className="text-xl font-bold transition-colors line-clamp-1 hover:underline"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {review.book?.title}
                                        </Link>
                                        <p className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>{review.book?.author}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="p-2 rounded-lg transition-colors"
                                        style={{ color: 'var(--text-secondary)' }}
                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--danger-muted)'; e.currentTarget.style.color = 'var(--danger)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                        title="Delete Review"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-1 mb-4" style={{ color: 'var(--warning)' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar key={i} size={16} className={i < review.rating ? "fill-current" : "opacity-30"} />
                                    ))}
                                    <span className="ml-2 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{review.rating}/5</span>
                                </div>

                                <div
                                    className="rounded-xl p-4 flex-1 border"
                                    style={{
                                        backgroundColor: 'var(--surface-2)',
                                        borderColor: 'var(--border)',
                                    }}
                                >
                                    <h4 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{review.title}</h4>
                                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
                                </div>
                                
                                <div className="mt-4 flex justify-between items-center text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                    <span>Posted on {new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyReviewsPage;
