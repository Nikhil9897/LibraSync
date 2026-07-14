import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageBooksPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        _id: '', title: '', author: '', isbn: '', 
        description: '', totalCopies: 1, availableCopies: 1
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

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (book) => {
        setFormData({ ...book });
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
            // Reset form
            setFormData({ _id: '', title: '', author: '', isbn: '', description: '', totalCopies: 1, availableCopies: 1 });
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
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 p-6 sticky top-8">
                    <h2 className="text-xl font-bold mb-6">{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-3 py-2 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Author</label>
                            <input type="text" name="author" value={formData.author} onChange={handleInputChange} required className="w-full px-3 py-2 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">ISBN</label>
                            <input type="text" name="isbn" value={formData.isbn} onChange={handleInputChange} required className="w-full px-3 py-2 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Total Copies</label>
                                <input type="number" name="totalCopies" min="1" value={formData.totalCopies} onChange={handleInputChange} required className="w-full px-3 py-2 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Available</label>
                                <input type="number" name="availableCopies" min="0" value={formData.availableCopies} onChange={handleInputChange} required className="w-full px-3 py-2 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                            <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:text-white dark:border-slate-700 resize-none" />
                        </div>
                        <div className="pt-2 flex gap-3">
                            <button type="submit" className="flex-1 bg-[#0d5959] text-white py-2 rounded-lg font-medium hover:bg-[#0a4747] transition-colors">
                                {isEditing ? 'Update Book' : 'Save Book'}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={() => { setIsEditing(false); setFormData({ _id: '', title: '', author: '', isbn: '', description: '', totalCopies: 1, availableCopies: 1 }); }} className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* List Section */}
            <div className="lg:w-2/3">
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Manage Library Books</h2>
                {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-slate-400">Loading books...</div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-700 border-b dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Book Info</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Stock</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-slate-700">
                                {books.map((book) => (
                                    <tr key={book._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{book.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">{book.author} • {book.isbn}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm">
                                                <span className={`${book.availableCopies > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}`}>
                                                    {book.availableCopies} available
                                                </span>
                                                <span className="text-gray-500 dark:text-slate-400">{book.totalCopies} total</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleEdit(book)} className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-4">Edit</button>
                                            <button onClick={() => handleDelete(book._id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Remove</button>
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
