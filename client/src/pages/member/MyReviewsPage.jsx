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
            <div className="w-10 h-10 border-4 border-[#0d5959] dark:border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-8" style={{  }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl  font-bold text-[#1a1f36] dark:text-white">My Reviews</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage feedback you've shared about books</p>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-16 text-center shadow-sm">
                    <div className="w-24 h-24 bg-[#0d5959]/10 dark:bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0d5959] dark:text-teal-400">
                        <FiMessageSquare size={40} />
                    </div>
                    <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white mb-3">No Reviews Yet</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto font-medium">
                        You haven't reviewed any books yet. Borrow a book and share your thoughts to help others!
                    </p>
                    <Link to="/catalog" className="inline-block px-8 py-3 bg-[#0d5959] dark:bg-teal-600 text-white font-bold rounded-xl hover:bg-[#0a4747] dark:hover:bg-teal-700 transition-all shadow-md shadow-[#0d5959]/20 dark:shadow-teal-900/20">
                        Explore Books
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md dark:shadow-none transition-shadow">
                            <Link to={`/books/${review.book?._id}`} className="shrink-0 w-32 h-48 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 group">
                                {review.book?.coverImage ? (
                                    <img src={review.book.coverImage} alt={review.book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-700 dark:text-slate-200 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 dark:bg-slate-700/50">
                                        No Cover
                                    </div>
                                )}
                            </Link>
                            
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <Link to={`/books/${review.book?._id}`} className="text-xl font-bold text-[#1a1f36] dark:text-white hover:text-[#0d5959] dark:hover:text-teal-400 transition-colors line-clamp-1">
                                            {review.book?.title}
                                        </Link>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{review.book?.author}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete Review"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-1 mb-4 text-[#d4a853]">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar key={i} size={16} className={i < review.rating ? "fill-current" : "text-slate-200 dark:text-slate-600"} />
                                    ))}
                                    <span className="ml-2 text-sm font-bold text-slate-700 dark:text-slate-200">{review.rating}/5</span>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900 dark:bg-slate-700/50 rounded-xl p-4 flex-1 border dark:border-slate-700 border-slate-100 dark:border-slate-600">
                                    <h4 className="font-bold text-[#1a1f36] dark:text-white mb-1">{review.title}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">{review.comment}</p>
                                </div>
                                
                                <div className="mt-4 flex justify-between items-center text-xs font-medium text-slate-500 dark:text-slate-400">
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
