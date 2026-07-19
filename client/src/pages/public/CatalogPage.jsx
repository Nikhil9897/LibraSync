import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { FiSearch, FiStar, FiCheck, FiX, FiBook, FiFilter, FiAlertCircle } from 'react-icons/fi';

const CatalogPage = () => {
    const [searchParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');

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
        const timeoutId = setTimeout(() => {
            fetchBooks();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [page, search, activeCategory]);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            {/* Hero Section */}
            <div
                className="pb-20 pt-16 px-6 relative overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, #000))' }}
            >
                <div className="absolute top-[-20%] right-[-5%] w-[500px] h-[500px] opacity-20 rounded-full mix-blend-screen filter blur-[100px] group-hover:opacity-30 transition-opacity duration-700" style={{ backgroundColor: 'var(--secondary)' }}></div>
                
                <div className="max-w-5xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-md">
                        Discover Your Next Great Read
                    </h1>
                    <p className="text-white/80 text-lg mb-12 max-w-2xl mx-auto font-medium">
                        Explore our vast collection of books, from timeless classics to modern bestsellers.
                    </p>
                    
                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative group/search">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 transition-colors group-focus-within/search:text-white">
                            <FiSearch size={24} />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by title, author, or ISBN..."
                            className="w-full pl-16 pr-6 py-4 rounded-2xl shadow-2xl outline-none text-lg font-medium transition-all"
                            style={{
                                backgroundColor: 'var(--surface)',
                                color: 'var(--text-primary)',
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 pb-16">
                {/* Category Chips */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                    <div
                        className="flex items-center gap-2 font-medium mr-2 px-3 py-2 rounded-xl shadow-sm border"
                        style={{
                            backgroundColor: 'var(--surface-2)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        <FiFilter /> Categories
                    </div>
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => { setActiveCategory(cat); setPage(1); }}
                            className="px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm border"
                            style={{
                                backgroundColor: activeCategory === cat ? 'var(--primary)' : 'var(--surface-2)',
                                color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                                borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border)',
                            }}
                            onMouseEnter={e => {
                                if (activeCategory !== cat) {
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                    e.currentTarget.style.color = 'var(--primary)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (activeCategory !== cat) {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Book Grid */}
                {loading ? (
                    <div
                        className="rounded-3xl p-8 shadow-sm border"
                        style={{
                            backgroundColor: 'var(--surface)',
                            borderColor: 'var(--border)',
                        }}
                    >
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
                                className="group flex flex-col rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border"
                                style={{
                                    backgroundColor: 'var(--surface)',
                                    borderColor: 'var(--border)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                <div
                                    className="aspect-[2/3] relative overflow-hidden flex items-center justify-center border-b"
                                    style={{
                                        backgroundColor: 'var(--surface-2)',
                                        borderColor: 'var(--border)',
                                    }}
                                >
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
                                        <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-[var(--primary)] transition-colors duration-300">
                                            <FiBook size={48} className="mb-2" />
                                            <span className="text-sm font-medium uppercase tracking-widest opacity-50">No Cover</span>
                                        </div>
                                    )}
                                    {/* Overlay Status Badge */}
                                    <div className="absolute top-3 right-3 z-10">
                                        {book.availableCopies > 0 ? (
                                            <span className="text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md backdrop-blur-sm bg-opacity-90" style={{ backgroundColor: 'var(--primary)' }}>
                                                <FiCheck size={14} /> Available
                                            </span>
                                        ) : (
                                            <span className="text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md backdrop-blur-sm bg-opacity-90" style={{ backgroundColor: 'var(--danger)' }}>
                                                <FiX size={14} /> Out
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-bold text-lg line-clamp-1 mb-1 transition-colors group-hover:text-[var(--primary)]" style={{ color: 'var(--text-primary)' }}>{book.title}</h3>
                                    <p className="text-sm line-clamp-1 mb-4 flex-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{book.author}</p>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5" style={{ color: 'var(--warning)' }}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FiStar 
                                                        key={star} 
                                                        size={14} 
                                                        className={star <= Math.round(book.averageRating || 0) ? "fill-current" : "opacity-30"} 
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{book.averageRating?.toFixed(1) || '0.0'}</span>
                                        </div>
                                        <span
                                            className="text-xs font-bold px-2 py-1 rounded-md border"
                                            style={{
                                                backgroundColor: book.availableCopies > 0 ? 'var(--primary-muted)' : 'var(--danger-muted)',
                                                color: book.availableCopies > 0 ? 'var(--primary)' : 'var(--danger)',
                                                borderColor: book.availableCopies > 0 ? 'var(--primary-muted)' : 'var(--danger-muted)',
                                            }}
                                        >
                                            {book.availableCopies} left
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div
                        className="rounded-3xl p-16 shadow-sm border text-center max-w-3xl mx-auto mt-8"
                        style={{
                            backgroundColor: 'var(--surface)',
                            borderColor: 'var(--border)',
                        }}
                    >
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                            style={{ backgroundColor: 'var(--primary-muted)', color: 'var(--primary)' }}
                        >
                            <FiAlertCircle size={48} />
                        </div>
                        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>No Books Found</h2>
                        <p className="text-lg mb-8 max-w-md mx-auto font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {search 
                                ? `We couldn't find any books matching "${search}". Try adjusting your search terms or category.`
                                : "Our library catalog is currently empty. Please check back later!"}
                        </p>
                        {search && (
                            <button 
                                onClick={() => setSearch('')}
                                className="px-8 py-3 text-white font-bold rounded-xl transition-all shadow-md ls-btn-primary"
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
                                className="w-12 h-12 rounded-xl font-bold transition-all border"
                                style={{
                                    backgroundColor: page === i + 1 ? 'var(--primary)' : 'var(--surface-2)',
                                    color: page === i + 1 ? '#fff' : 'var(--text-secondary)',
                                    borderColor: page === i + 1 ? 'var(--primary)' : 'var(--border)',
                                }}
                                onMouseEnter={e => {
                                    if (page !== i + 1) {
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                        e.currentTarget.style.color = 'var(--primary)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (page !== i + 1) {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                    }
                                }}
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
