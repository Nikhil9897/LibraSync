import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageBooksPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [categories, setCategories] = useState([]);
    
    const [formData, setFormData] = useState({
        _id: '', title: '', author: '', isbn: '', 
        description: '', totalCopies: 1, availableCopies: 1, category: ''
    });

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const res = await api.get('/books?limit=100'); // Fetch enough for the table
            setBooks(res.data.data.books);
        } catch (err) {
            toast.error('Failed to load books');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/books/categories/all');
            setCategories(res.data.data.categories);
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    useEffect(() => {
        fetchBooks();
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (book) => {
        setFormData({ 
            ...book,
            category: book.category?._id || book.category || ''
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this book?')) return;
        try {
            await api.delete(`/books/${id}`);
            toast.success('Book deactivated successfully');
            fetchBooks();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete book');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const { _id, ...updateData } = formData;
                await api.put(`/books/${_id}`, updateData);
                toast.success('Book updated successfully');
            } else {
                const { _id, ...createData } = formData; // Exclude empty _id
                await api.post('/books', createData);
                toast.success('Book added successfully');
            }
            setFormData({ _id: '', title: '', author: '', isbn: '', description: '', totalCopies: 1, availableCopies: 1, category: '' });
            setIsEditing(false);
            fetchBooks();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save book');
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">
            
            {/* Form Section */}
            <div className="lg:w-1/3">
                <div
                    className="rounded-2xl border p-6 sticky top-8 shadow-sm"
                    style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                    }}
                >
                    <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none bg-transparent"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Author</label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none bg-transparent"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>ISBN</label>
                            <input
                                type="text"
                                name="isbn"
                                value={formData.isbn}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none bg-transparent"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
                            <select 
                                name="category" 
                                value={formData.category} 
                                onChange={handleInputChange} 
                                required 
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none bg-transparent"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            >
                                <option value="" style={{ backgroundColor: 'var(--surface)' }}>Select a Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id} style={{ backgroundColor: 'var(--surface)' }}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Total Copies</label>
                                <input
                                    type="number"
                                    name="totalCopies"
                                    min="1"
                                    value={formData.totalCopies}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none bg-transparent"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Available</label>
                                <input
                                    type="number"
                                    name="availableCopies"
                                    min="0"
                                    value={formData.availableCopies}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none bg-transparent"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                            <textarea
                                name="description"
                                rows="3"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none bg-transparent resize-none"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <div className="pt-2 flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 text-white py-2 rounded-lg font-medium transition-colors"
                                style={{ backgroundColor: 'var(--primary)' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                            >
                                {isEditing ? 'Update Book' : 'Save Book'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => { setIsEditing(false); setFormData({ _id: '', title: '', author: '', isbn: '', description: '', totalCopies: 1, availableCopies: 1, category: '' }); }}
                                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                                    style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)' }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* List Section */}
            <div className="lg:w-2/3">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Manage Library Books</h2>
                {loading ? (
                    <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading books...</div>
                ) : (
                    <div
                        className="rounded-2xl border overflow-hidden shadow-sm"
                        style={{
                            backgroundColor: 'var(--surface)',
                            borderColor: 'var(--border)',
                        }}
                    >
                        <table className="w-full text-left">
                            <thead style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Book Info</th>
                                    <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Stock</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
                                {books.map((book) => (
                                    <tr
                                        key={book._id}
                                        className="transition-colors"
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{book.title}</p>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{book.author} • {book.isbn}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm">
                                                <span style={{ color: book.availableCopies > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
                                                    {book.availableCopies} available
                                                </span>
                                                <span style={{ color: 'var(--text-secondary)' }}>{book.totalCopies} total</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEdit(book)}
                                                className="font-medium text-sm mr-4 transition-colors"
                                                style={{ color: 'var(--secondary)' }}
                                                onMouseEnter={e => e.currentTarget.style.color = 'var(--secondary-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'var(--secondary)'}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(book._id)}
                                                className="font-medium text-sm transition-colors"
                                                style={{ color: 'var(--danger)' }}
                                                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'var(--danger)'}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ManageBooksPage;
