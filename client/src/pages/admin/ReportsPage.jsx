import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const ReportsPage = () => {
    const [popularBooks, setPopularBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const res = await api.get('/analytics/popular-books');
                setPopularBooks(res.data.data.popularBooks);
            } catch (err) {
                toast.error('Failed to load reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const handleExportCSV = () => {
        if (popularBooks.length === 0) return toast.error('No data to export');

        let csvContent = 'data:text/csv;charset=utf-8,Book Title,Total Borrows\n';

        popularBooks.forEach(b => {
            const title = b.title.includes(',') ? `"${b.title}"` : b.title;
            csvContent += `${title},${b.borrows}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'popular_books_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Report downloaded');
    };

    if (loading) return <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading reports...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Analytics & Reports</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>View detailed insights and export system data.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-6 py-2.5 text-white font-medium rounded-xl transition-all shadow-sm"
                    style={{ backgroundColor: 'var(--primary)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                >
                    <span>📥</span> Export CSV
                </button>
            </div>

            <div
                className="rounded-2xl shadow-sm border p-8 mb-8"
                style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                }}
            >
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Top 5 Most Popular Books</h2>
                {popularBooks.length === 0 ? (
                    <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>No borrowing data available yet.</div>
                ) : (
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={popularBooks} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis 
                                    dataKey="title" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                    dy={10}
                                    angle={-45}
                                    textAnchor="end"
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                    dx={-10}
                                    allowDecimals={false}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: '1px solid var(--border)', 
                                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                        backgroundColor: 'var(--surface)',
                                        color: 'var(--text-primary)'
                                    }}
                                    cursor={{ fill: 'var(--primary-muted)', opacity: 0.6 }}
                                />
                                <Bar 
                                    dataKey="borrows" 
                                    fill="var(--accent-purple)" 
                                    radius={[4, 4, 0, 0]}
                                    barSize={60}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
            
            {/* Table View of the Same Data */}
            <div
                className="rounded-2xl shadow-sm border overflow-hidden"
                style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                }}
            >
                <table className="w-full text-left">
                    <thead style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Rank</th>
                            <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Book Title</th>
                            <th className="px-6 py-4 text-sm font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Total Borrows</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
                        {popularBooks.map((b, index) => (
                            <tr
                                key={index}
                                className="transition-colors"
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>#{index + 1}</td>
                                <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{b.title}</td>
                                <td className="px-6 py-4 text-right">
                                    <span
                                        className="px-3 py-1 rounded-full text-sm font-medium"
                                        style={{
                                            backgroundColor: 'rgba(139, 92, 246, 0.10)',
                                            color: 'var(--accent-purple)',
                                        }}
                                    >
                                        {b.borrows} times
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsPage;
