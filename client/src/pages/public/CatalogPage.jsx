import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { FiSearch, FiStar, FiCheck, FiX, FiBook, FiFilter, FiAlertCircle } from 'react-icons/fi';

const CatalogPage = () => {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Fiction', 'Science', 'Technology', 'History', 'Biography', 'Fantasy', 'Mystery'];

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ page, limit: 10 });
                if (search) params.set('search', search);
                if (activeCategory !== 'All') params.set('category', activeCategory);
                
                const res = await api.get(`/books?${params}`);
                setBooks(res.data.data.books);
                setTotalPages(res.data.data.pages);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        // Debounce search slightly
        const timeoutId = setTimeout(() => {
            fetchBooks();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [page, search, activeCategory]);

    return (
        <div className="min-h-screen bg-[#f8fafc]" >
            {/* Premium Hero Section */}
            <div className="bg-[#0d5959] pb-20 pt-16 px-6 relative overflow-hidden group">
                {/* Abstract Glassmorphism Background Shapes */}
                <div className="absolute top-[-20%] right-[-5%] w-[500px] h-[500px] bg-[#d4a853] opacity-20 rounded-full mix-blend-screen filter blur-[100px] group-hover:opacity-30 transition-opacity duration-700"></div>
                <div className="absolute bottom-[-20%] left-[10%] w-[400px] h-[400px] bg-[#1a1f36] opacity-30 rounded-full mix-blend-multiply filter blur-[80px]"></div>
                
                <div className="max-w-5xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl  font-bold text-white mb-6 tracking-tight drop-shadow-md">
                        Discover Your Next Great Read
                    </h1>
                    <p className="text-white/80 text-lg mb-12 max-w-2xl mx-auto font-medium">
                        Explore our vast collection of books, from timeless classics to modern bestsellers.
                    </p>
                    
                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative group/search">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 group-focus-within/search:text-[#0d5959] transition-colors">
                            <FiSearch size={24} />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by title, author, or ISBN..."
                            className="w-full pl-16 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 shadow-2xl focus:shadow-[0_20px_50px_rgba(13,89,89,0.3)] border-2 border-transparent focus:border-[#d4a853]/50 outline-none text-[#1a1f36] dark:text-white text-lg font-medium transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 pb-16">
                {/* Category Chips */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                    <div className="flex items-center gap-2 text-slate-500 font-medium mr-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-700 border-slate-100">
                        <FiFilter /> Categories
                    </div>
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => { setActiveCategory(cat); setPage(1); }}
                            className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                                activeCategory === cat 
                                ? 'bg-[#0d5959] text-white shadow-lg shadow-[#0d5959]/20 translate-y-[-2px]' 
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 hover:text-[#0d5959] hover:bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 border-slate-200 hover:border-[#0d5959]/30'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Book Grid */}
                {loading ? (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 shadow-sm border dark:border-slate-700 border-slate-100">
                        <SkeletonLoader 
                            type="grid-item" 
                            count={10} 
                            wrapperClass="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" 
                        />
                    </div>
                ) : books.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {books.map((book) => (
                            <Link
                                key={book._id}
                                to={`/books/${book._id}`}
                                className="group flex flex-col bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 border-slate-100 overflow-hidden hover:shadow-xl hover:border-[#d4a853]/30 hover:-translate-y-1.5 transition-all duration-300"
                            >
                                <div className="aspect-[2/3] bg-slate-50 dark:bg-slate-900 relative overflow-hidden flex items-center justify-center border-b dark:border-slate-700 border-slate-100">
                                    {book.coverImage ? (
                                        <img 
                                            src={book.coverImage} 
                                            alt={book.title} 
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
                                            }}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-700 dark:text-slate-200 group-hover:text-[#d4a853] transition-colors duration-300">
                                            <FiBook size={48} className="mb-2" />
                                            <span className="text-sm font-medium uppercase tracking-widest opacity-50">No Cover</span>
                                        </div>
                                    )}
                                    {/* Overlay Status Badge */}
                                    <div className="absolute top-3 right-3 z-10">
                                        {book.availableCopies > 0 ? (
                                            <span className="bg-[#0d5959] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-[#0d5959]/20 backdrop-blur-sm bg-opacity-90">
                                                <FiCheck size={14} /> Available
                                            </span>
                                        ) : (
                                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-red-500/20 backdrop-blur-sm bg-opacity-90">
                                                <FiX size={14} /> Out
                                            </span>
                                        )}
                                    </div>
                                    {/* Inner dark gradient overlay for better contrast at the bottom of the image if needed */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-bold text-[#1a1f36] dark:text-white text-lg line-clamp-1 mb-1 group-hover:text-[#0d5959] transition-colors">{book.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-1 mb-4 flex-1 font-medium">{book.author}</p>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t dark:border-slate-700 border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5 text-[#d4a853]">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FiStar 
                                                        key={star} 
                                                        size={14} 
                                                        className={star <= Math.round(book.averageRating || 0) ? "fill-current" : "text-slate-200 fill-slate-50"} 
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-bold text-[#1a1f36] dark:text-white">{book.averageRating?.toFixed(1) || '0.0'}</span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${book.availableCopies > 0 ? 'bg-[#0d5959]/10 text-[#0d5959]' : 'bg-red-50 text-red-600'}`}>
                                            {book.availableCopies} left
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-16 shadow-sm border dark:border-slate-700 border-slate-100 text-center max-w-3xl mx-auto mt-8">
                        <div className="w-24 h-24 bg-[#0d5959]/10 text-[#0d5959] rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiAlertCircle size={48} />
                        </div>
                        <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white mb-3">No Books Found</h2>
                        <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto font-medium">
                            {search 
                                ? `We couldn't find any books matching "${search}". Try adjusting your search terms or category.`
                                : "Our library catalog is currently empty. Please check back later!"}
                        </p>
                        {search && (
                            <button 
                                onClick={() => setSearch('')}
                                className="px-8 py-3 bg-[#0d5959] text-white font-bold rounded-xl hover:bg-[#0a4747] transition-all shadow-md shadow-[#0d5959]/20"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && books.length > 0 && (
                    <div className="flex justify-center items-center gap-2 mt-16">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-12 h-12 rounded-xl font-bold transition-all ${
                                    page === i + 1 
                                    ? 'bg-[#0d5959] text-white shadow-lg shadow-[#0d5959]/20' 
                                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 border dark:border-slate-700 border-slate-200 hover:border-[#0d5959]/30 hover:text-[#0d5959]'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CatalogPage;
