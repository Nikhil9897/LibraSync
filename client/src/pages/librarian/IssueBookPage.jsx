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
            
            const booksRes = await api.get('/books?limit=500');
            setBooks(booksRes.data.data.books.filter(b => b.availableCopies > 0));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to issue book');
        } finally {
            setIssuing(false);
        }
    };

    if (loading) return <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading form data...</div>;

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Issue Book</h1>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Select a member and an available book to check out.</p>

            <div
                className="rounded-2xl shadow-sm border p-8"
                style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                }}
            >
                <form onSubmit={handleIssue} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Library Member</label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            required
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-transparent"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        >
                            <option value="" disabled style={{ backgroundColor: 'var(--surface)' }}>-- Select a Member --</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id} style={{ backgroundColor: 'var(--surface)' }}>
                                    {u.name} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Available Book</label>
                        <select
                            value={selectedBook}
                            onChange={(e) => setSelectedBook(e.target.value)}
                            required
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-transparent"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        >
                            <option value="" disabled style={{ backgroundColor: 'var(--surface)' }}>-- Select a Book --</option>
                            {books.map(b => (
                                <option key={b._id} value={b._id} style={{ backgroundColor: 'var(--surface)' }}>
                                    {b.title} by {b.author} - {b.availableCopies} available
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={issuing}
                            className="w-full py-3 text-white text-lg font-medium rounded-xl disabled:opacity-50 transition-colors shadow-sm"
                            style={{ backgroundColor: 'var(--primary)' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--primary)'}
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
