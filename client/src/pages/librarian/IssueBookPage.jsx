import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const IssueBookPage = () => {
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [issuing, setIssuing] = useState(false);

    const [selectedUser, setSelectedUser] = useState('');
    const [selectedBook, setSelectedBook] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [usersRes, booksRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/books?limit=500') // Get a large list for dropdown
                ]);
                setUsers(usersRes.data.data.users);
                setBooks(booksRes.data.data.books.filter(b => b.availableCopies > 0));
            } catch (err) {
                toast.error('Failed to load data for issuing');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleIssue = async (e) => {
        e.preventDefault();
        if (!selectedUser || !selectedBook) return toast.error('Please select both a member and a book.');

        try {
            setIssuing(true);
            await api.post('/borrows', { userId: selectedUser, bookId: selectedBook });
            toast.success('Book issued successfully!');
            setSelectedUser('');
            setSelectedBook('');
            
            // Refresh book availability
            const booksRes = await api.get('/books?limit=500');
            setBooks(booksRes.data.data.books.filter(b => b.availableCopies > 0));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to issue book');
        } finally {
            setIssuing(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400">Loading form data...</div>;

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Issue Book</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Select a member and an available book to check out.</p>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 p-8">
                <form onSubmit={handleIssue} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Library Member</label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            required
                            className="w-full px-4 py-3 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:text-white dark:border-slate-700 bg-gray-50 dark:bg-slate-700"
                        >
                            <option value="" disabled>-- Select a Member --</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id}>
                                    {u.name} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Available Book</label>
                        <select
                            value={selectedBook}
                            onChange={(e) => setSelectedBook(e.target.value)}
                            required
                            className="w-full px-4 py-3 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:text-white dark:border-slate-700 bg-gray-50 dark:bg-slate-700"
                        >
                            <option value="" disabled>-- Select a Book --</option>
                            {books.map(b => (
                                <option key={b._id} value={b._id}>
                                    {b.title} by {b.author} - {b.availableCopies} available
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={issuing}
                            className="w-full py-3 bg-[#0d5959] text-white text-lg font-medium rounded-xl hover:bg-[#0a4747] disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {issuing ? 'Processing...' : 'Confirm Issue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IssueBookPage;
