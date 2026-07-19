import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { QRCodeSVG } from 'qrcode.react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
    FiStar, FiArrowLeft, FiCheckCircle, FiClock, FiBook, FiUser, 
    FiHeart, FiShare2, FiDownload, FiThumbsUp, FiEdit2, FiTrash2, FiMoreVertical, FiChevronRight, FiMapPin
} from 'react-icons/fi';

const BookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reserving, setReserving] = useState(false);
    
    // Reviews state
    const [sortOption, setSortOption] = useState('recent');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
    const [editingReviewId, setEditingReviewId] = useState(null);
    
    const [isShared, setIsShared] = useState(false);
    
    const isWishlisted = user?.wishlist?.includes(id);

    useEffect(() => {
        const fetchBookData = async () => {
            try {
                setLoading(true);
                const [bookRes, reviewsRes, relatedRes] = await Promise.all([
                    api.get(`/books/${id}`),
                    api.get(`/reviews/${id}`),
                    api.get(`/books/${id}/related`).catch(() => ({ data: { data: { books: [] } } }))
                ]);
                setBook(bookRes.data.data.book);
                setReviews(reviewsRes.data.data.reviews);
                setRelatedBooks(relatedRes.data.data.books || []);
            } catch (err) {
                toast.error('Failed to load book details');
            } finally {
                setLoading(false);
            }
        };
        fetchBookData();
    }, [id]);

    const handleReserve = async () => {
        if (!user) {
            toast.error('Please login to reserve books');
            navigate('/login');
            return;
        }
        try {
            setReserving(true);
            await api.post('/reservations', { bookId: id });
            toast.success('Book reserved successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reserve book');
        } finally {
            setReserving(false);
        }
    };

    const handleBorrow = async () => {
        if (!user) {
            toast.error('Please login to borrow books');
            navigate('/login');
            return;
        }
        try {
            setReserving(true); // Using same loading state
            await api.post('/borrows/self', { bookId: id });
            toast.success('Book borrowed successfully! Check your dashboard.');
            // Optimistically update the UI
            setBook(prev => ({
                ...prev,
                availableCopies: prev.availableCopies - 1,
                borrowsCount: (prev.borrowsCount || 0) + 1
            }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to borrow book');
        } finally {
            setReserving(false);
        }
    };

    const handleToggleWishlist = async () => {
        if (!user) return navigate('/login');

        // Optimistically update UI
        const isAdding = !isWishlisted;
        const previousWishlist = [...(user.wishlist || [])];
        
        setUser({
            ...user,
            wishlist: isAdding 
                ? [...previousWishlist, id] 
                : previousWishlist.filter(bId => bId !== id)
        });

        try {
            await api.post(`/books/${id}/wishlist`);
        } catch (err) {
            setUser({ ...user, wishlist: previousWishlist });
            toast.error('Failed to update wishlist');
        }
    };

    const handleShare = async () => {
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: book.title,
                    text: `Check out ${book.title} on Librasync!`,
                    url: window.location.href,
                });
            } catch (err) {
                // User cancelled share
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const handleDownloadPdf = () => {
        toast('PDF Download starting soon...', { icon: '📄' });
        // Generate PDF logic here (could use jsPDF)
    };

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            if (editingReviewId) {
                const res = await api.put(`/reviews/${editingReviewId}`, reviewForm);
                setReviews(reviews.map(r => r._id === editingReviewId ? res.data.data.review : r));
                toast.success('Review updated!');
            } else {
                const res = await api.post(`/reviews/${id}`, reviewForm);
                setReviews([res.data.data.review, ...reviews]);
                toast.success('Review added!');
            }
            setShowReviewModal(false);
            setReviewForm({ rating: 5, title: '', comment: '' });
            setEditingReviewId(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        }
    };

    const deleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await api.delete(`/reviews/${reviewId}`);
                setReviews(reviews.filter(r => r._id !== reviewId));
                toast.success('Review deleted');
            } catch (err) {
                toast.error('Failed to delete review');
            }
        }
    };

    const toggleHelpful = async (reviewId) => {
        if (!user) return navigate('/login');

        // Optimistic update
        const previousReviews = [...reviews];
        const targetReview = previousReviews.find(r => r._id === reviewId);
        const isCurrentlyHelpful = targetReview?.helpfulVotes?.includes(user._id);
        
        setReviews(reviews.map(r => {
            if (r._id === reviewId) {
                const votes = r.helpfulVotes || [];
                return {
                    ...r,
                    helpfulVotes: !isCurrentlyHelpful 
                        ? [...votes, user._id] 
                        : votes.filter(v => v !== user._id)
                };
            }
            return r;
        }));

        try {
            await api.put(`/reviews/${reviewId}/vote`);
        } catch (err) {
            // Revert on error
            setReviews(previousReviews);
            toast.error('Failed to vote');
        }
    };

    const sortedReviews = useMemo(() => {
        const sorted = [...reviews];
        if (sortOption === 'recent') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (sortOption === 'highest') sorted.sort((a, b) => b.rating - a.rating);
        if (sortOption === 'lowest') sorted.sort((a, b) => a.rating - b.rating);
        if (sortOption === 'helpful') sorted.sort((a, b) => (b.helpfulVotes?.length || 0) - (a.helpfulVotes?.length || 0));
        return sorted;
    }, [reviews, sortOption]);

    const renderStars = (rating = 0, size = 18, interactive = false) => {
        return (
            <div className={`flex gap-1 text-[#d4a853] ${interactive ? 'cursor-pointer' : ''}`}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar 
                        key={star} 
                        size={size} 
                        onClick={() => interactive && setReviewForm({...reviewForm, rating: star})}
                        className={`${star <= Math.round(rating) ? "fill-current" : "text-slate-200 fill-slate-50"} ${interactive && 'hover:scale-110 transition-transform'}`} 
                    />
                ))}
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f8fafc] pt-20 px-6">
            <div className="max-w-7xl mx-auto">
                <SkeletonLoader type="detail" />
            </div>
        </div>
    );

    if (!book) return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white">Book Not Found</h2>
            <Link to="/catalog" className="text-[#0d5959] font-medium mt-4 hover:underline flex items-center gap-2">
                <FiArrowLeft /> Back to Catalog
            </Link>
        </div>
    );

    const estReadTime = Math.ceil((book.pageCount || 300) * 1.5 / 60); // approx hours

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-24 text-slate-800">
            {/* Breadcrumb Navigation */}
            <div className="bg-[#1a1f36] text-white pt-24 pb-3 px-6">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <Link to="/" className="hover:text-white transition-colors">Home</Link>
                    <FiChevronRight size={14} />
                    <Link to="/catalog" className="hover:text-white transition-colors">Catalog</Link>
                    <FiChevronRight size={14} />
                    <span className="text-[#d4a853] truncate max-w-[200px]">{book.title}</span>
                </div>
            </div>

            {/* Header / Hero Section */}
            <div className="bg-[#1a1f36] relative pb-48 overflow-hidden group">
                <div className="absolute top-[-20%] right-[-5%] w-[500px] h-[500px] bg-[#d4a853] opacity-10 rounded-full mix-blend-screen filter blur-[100px]"></div>
                <div className="absolute bottom-[-20%] left-[10%] w-[400px] h-[400px] bg-[#0d5959] opacity-20 rounded-full mix-blend-screen filter blur-[80px]"></div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-6 relative z-20 -mt-40">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Sticky Column */}
                    <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
                        {/* Book Cover Card */}
                        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl shadow-2xl shadow-[#1a1f36]/20">
                            <div className="aspect-[2/3] bg-slate-50 dark:bg-slate-900 relative overflow-hidden rounded-xl flex items-center justify-center">
                                {book.coverImage ? (
                                    <img 
                                        src={book.coverImage} 
                                        alt={book.title} 
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`; }}
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-700 dark:text-slate-200">
                                        <FiBook size={64} className="mb-4" />
                                        <span className="text-sm font-medium uppercase tracking-widest opacity-50">No Cover</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions Sticky Panel */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-sm border dark:border-slate-700 border-slate-100 p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b dark:border-slate-700 border-slate-100">
                                <div className="text-center w-1/3 border-r border-slate-100">
                                    <div className="text-2xl font-bold text-[#1a1f36] dark:text-white">{book.averageRating?.toFixed(1) || '0.0'}</div>
                                    <div className="text-xs text-slate-500 font-medium">Rating</div>
                                </div>
                                <div className="text-center w-1/3 border-r border-slate-100">
                                    <div className="text-2xl font-bold text-[#1a1f36] dark:text-white">{book.views || 0}</div>
                                    <div className="text-xs text-slate-500 font-medium">Views</div>
                                </div>
                                <div className="text-center w-1/3">
                                    <div className="text-2xl font-bold text-[#1a1f36] dark:text-white">{book.borrowsCount || 0}</div>
                                    <div className="text-xs text-slate-500 font-medium">Borrows</div>
                                </div>
                            </div>

                            <div className="flex justify-center mb-6">
                                {book.availableCopies > 0 ? (
                                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                                        <FiCheckCircle size={20} /> Available ({book.availableCopies} left)
                                    </div>
                                ) : (
                                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                                        <FiClock size={20} /> Currently Out
                                    </div>
                                )}
                            </div>

                            {book.availableCopies > 0 ? (
                                <button
                                    onClick={handleBorrow}
                                    disabled={reserving}
                                    className="w-full py-4 text-white font-bold rounded-xl transition-all mb-3 disabled:opacity-50 ls-btn-primary"
                                >
                                    {reserving ? 'Processing...' : 'Borrow Book'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleReserve}
                                    disabled={reserving}
                                    className="w-full py-4 font-bold rounded-xl transition-all mb-3 border disabled:opacity-50"
                                    style={{
                                        backgroundColor: 'var(--surface-hover)',
                                        color: 'var(--text-primary)',
                                        borderColor: 'var(--border)',
                                    }}
                                    onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--border-strong)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                                >
                                    {reserving ? 'Reserving...' : 'Reserve Book'}
                                </button>
                            )}

                            <div className="flex gap-3">
                                <button 
                                    onClick={handleToggleWishlist}
                                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl border dark:border-slate-700 font-bold transition-all ${isWishlisted ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 hover:border-slate-300'}`}
                                >
                                    <FiHeart className={isWishlisted ? "fill-current" : ""} /> {isWishlisted ? 'Saved' : 'Wishlist'}
                                </button>
                                <button 
                                    onClick={handleShare} 
                                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl border dark:border-slate-700 font-bold transition-all ${isShared ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 hover:border-slate-300'}`}
                                >
                                    {isShared ? <FiCheckCircle /> : <FiShare2 />} {isShared ? 'Copied!' : 'Share'}
                                </button>
                            </div>
                            
                            {/* QR Code */}
                            <div className="mt-6 pt-6 border-t dark:border-slate-700 border-slate-100 flex flex-col items-center">
                                <p className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wider">Scan to access</p>
                                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-700 border-slate-100 shadow-sm">
                                    <QRCodeSVG value={window.location.href} size={80} bgColor="#ffffff" fgColor="#1a1f36" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Main Column */}
                    <div className="flex-1 flex flex-col gap-6 min-w-0">
                        
                        {/* Book Title & Meta */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-sm border dark:border-slate-700 border-slate-100 p-8 md:p-10 relative overflow-hidden">
                            <div className="flex flex-wrap gap-2 items-center mb-4">
                                <span className="bg-[#d4a853]/10 text-[#b58b38] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {book.category?.name || 'Uncategorized'}
                                </span>
                                {Array.from(new Set((book.genres || []).map(g => g.trim().toLowerCase())))
                                    .filter(g => g !== book.category?.name?.trim().toLowerCase())
                                    .slice(0,3).map((genre, idx) => (
                                    <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl  font-bold text-[#1a1f36] dark:text-white mb-3 leading-tight break-words">
                                {book.title}
                            </h1>
                            <p className="text-xl text-slate-500 font-medium mb-6 flex items-center gap-2 flex-wrap">
                                by <span className="text-[#0d5959] border-b dark:border-slate-700 border-transparent hover:border-[#0d5959] cursor-pointer transition-colors">{book.author}</span>
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-6 py-4 border-y border-slate-100">
                                <div className="flex items-center gap-3">
                                    {renderStars(book.averageRating || 0, 20)}
                                    <span className="text-slate-500 font-medium"><span className="text-[#1a1f36] dark:text-white font-bold mr-1">{book.numReviews || 0}</span> Reviews</span>
                                </div>
                                <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
                                <div className="flex items-center gap-2 text-slate-500 font-medium">
                                    <FiBook className="text-[#0d5959]" /> {book.pageCount || 'N/A'} Pages
                                </div>
                                <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
                                <div className="flex items-center gap-2 text-slate-500 font-medium">
                                    <FiClock className="text-[#0d5959]" /> ~{estReadTime}h Read
                                </div>
                                <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
                                <div className="flex items-center gap-2 text-slate-500 font-medium">
                                    <FiMapPin className="text-[#0d5959]" /> {book.location?.shelf ? `Shelf ${book.location.shelf}` : 'General Section'}
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-[#1a1f36] dark:text-white mb-4">Synopsis</h3>
                                <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-line break-words">
                                    {book.description || 'No detailed synopsis is available for this book at the moment. It remains a mystery waiting to be uncovered!'}
                                </div>
                            </div>
                            
                            {/* Detailed Info Grid */}
                            <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm break-words">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Publisher</p>
                                    <p className="font-bold text-slate-700">{book.publisher || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Published Date</p>
                                    <p className="font-bold text-slate-700">{book.publishedDate && !isNaN(new Date(book.publishedDate)) ? format(new Date(book.publishedDate), 'MMM yyyy') : 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">ISBN</p>
                                    <p className="font-bold text-slate-700">{book.isbn}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Language</p>
                                    <p className="font-bold text-slate-700 uppercase">{book.language || 'EN'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-sm border dark:border-slate-700 border-slate-100 p-8 md:p-10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                                <div>
                                    <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white">Reader Reviews</h2>
                                    <p className="text-slate-500 mt-1">{book.numReviews} ratings & reviews</p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <select 
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 border-slate-200 text-slate-700 font-medium rounded-xl px-4 py-2.5 outline-none focus:border-[#0d5959] transition-colors"
                                    >
                                        <option value="recent">Most Recent</option>
                                        <option value="highest">Highest Rated</option>
                                        <option value="lowest">Lowest Rated</option>
                                        <option value="helpful">Most Helpful</option>
                                    </select>
                                    <button 
                                        onClick={() => user ? setShowReviewModal(true) : navigate('/login')}
                                        className="bg-[#1a1f36] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-black transition-colors whitespace-nowrap"
                                    >
                                        Write a Review
                                    </button>
                                </div>
                            </div>
                            
                            {reviews.length === 0 ? (
                                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 border-dashed border-slate-200">
                                    <FiStar className="mx-auto text-4xl text-slate-700 dark:text-slate-200 mb-3" />
                                    <p className="text-slate-500 font-medium text-lg">No reviews yet.</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Be the first to share your thoughts!</p>
                                    <button onClick={() => user ? setShowReviewModal(true) : navigate('/login')} className="mt-4 text-[#0d5959] font-bold hover:underline">Write Review</button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {sortedReviews.map((review) => (
                                        <div key={review._id} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 border-slate-100 shadow-sm hover:border-slate-200 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg">
                                                        {review.user?.name?.charAt(0) || <FiUser />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#1a1f36] dark:text-white flex items-center gap-2">
                                                            {review.user?.name || 'Anonymous'} 
                                                            {review.isVerifiedBorrower && <FiCheckCircle className="text-green-500" title="Verified Borrower" size={14} />}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{formatDistanceToNow(new Date(review.createdAt))} ago</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {renderStars(review.rating, 14)}
                                                    {user && review.user?._id === user._id && (
                                                        <div className="flex gap-2 text-slate-500 dark:text-slate-400">
                                                            <button onClick={() => {
                                                                setEditingReviewId(review._id);
                                                                setReviewForm({ rating: review.rating, title: review.title || '', comment: review.comment || '' });
                                                                setShowReviewModal(true);
                                                            }} className="hover:text-[#0d5959]"><FiEdit2 size={14} /></button>
                                                            <button onClick={() => deleteReview(review._id)} className="hover:text-red-500"><FiTrash2 size={14} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {review.title && <h4 className="font-bold text-[#1a1f36] dark:text-white mb-2 text-lg break-words">{review.title}</h4>}
                                            {review.comment && <p className="text-slate-600 leading-relaxed mb-4 break-words">{review.comment}</p>}
                                            
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => toggleHelpful(review._id)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border dark:border-slate-700 transition-colors ${review.helpfulVotes?.includes(user?._id) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900'}`}
                                                >
                                                    <FiThumbsUp className={review.helpfulVotes?.includes(user?._id) ? "fill-current" : ""} /> Helpful ({review.helpfulVotes?.length || 0})
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Related Books */}
                        {relatedBooks.length > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-sm border dark:border-slate-700 border-slate-100 p-8 md:p-10 mb-8">
                                <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white mb-6">You might also like</h2>
                                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                                    {relatedBooks.map(rb => (
                                        <Link key={rb._id} to={`/books/${rb._id}`} className="w-36 flex-shrink-0 group">
                                            <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 border dark:border-slate-700 border-slate-100">
                                                {rb.coverImage ? (
                                                    <img src={rb.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center"><FiBook size={32} className="text-slate-700 dark:text-slate-200" /></div>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-[#1a1f36] dark:text-white text-sm line-clamp-2 group-hover:text-[#0d5959] transition-colors">{rb.title}</h4>
                                            <p className="text-xs text-slate-500 mt-1 truncate">{rb.author}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
                        <button onClick={() => { setShowReviewModal(false); setEditingReviewId(null); setReviewForm({rating:5, title:'', comment:''}); }} className="absolute top-6 right-6 text-slate-500 dark:text-slate-400 hover:text-slate-800">
                            <FiMoreVertical className="rotate-45" size={24} />
                        </button>
                        <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white mb-2">{editingReviewId ? 'Edit Review' : 'Write a Review'}</h2>
                        <p className="text-slate-500 mb-6 font-medium">Share your thoughts on "{book.title}"</p>
                        
                        <form onSubmit={submitReview}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
                                {renderStars(reviewForm.rating, 32, true)}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Title (Optional)</label>
                                <input 
                                    type="text" 
                                    value={reviewForm.title} 
                                    onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
                                    placeholder="Summarize your thoughts"
                                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all font-medium bg-transparent"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Review</label>
                                <textarea 
                                    rows="4" 
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                    placeholder="What did you like or dislike? What should others know before reading?"
                                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all font-medium bg-transparent resize-none"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                required></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg"
                                style={{ backgroundColor: 'var(--primary)' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                            >
                                {editingReviewId ? 'Update Review' : 'Post Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookDetailPage;
