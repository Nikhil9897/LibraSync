import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const ReportsPage = () => {
    const { isDark } = useTheme();
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

        // CSV Header
        let csvContent = 'data:text/csv;charset=utf-8,Book Title,Total Borrows\n';

        // CSV Rows
        popularBooks.forEach(b => {
            // Escape titles containing commas
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

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400">Loading reports...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">Analytics & Reports</h1>
                    <p className="text-slate-500 dark:text-slate-400">View detailed insights and export system data.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#0d5959] text-white font-medium rounded-xl hover:bg-[#0a4747] transition-colors shadow-sm"
                >
                    <span>📥</span> Export CSV
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 p-8 mb-8">
                <h2 className="text-xl font-bold mb-6">Top 5 Most Popular Books</h2>
                {popularBooks.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-slate-400 py-12">No borrowing data available yet.</div>
                ) : (
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={popularBooks} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E5E7EB'} />
                                <XAxis 
                                    dataKey="title" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                    angle={-45}
                                    textAnchor="end"
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dx={-10}
                                    allowDecimals={false}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '8px', 
                                        border: isDark ? '1px solid #334155' : 'none', 
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        backgroundColor: isDark ? '#1E293B' : '#ffffff',
                                        color: isDark ? '#F8FAFC' : '#0F172A'
                                    }}
                                    cursor={{ fill: isDark ? '#334155' : '#F3F4F6' }}
                                />
                                <Bar 
                                    dataKey="borrows" 
                                    fill="#8B5CF6" 
                                    radius={[4, 4, 0, 0]}
                                    barSize={60}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
            
            {/* Table View of the Same Data */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-700 border-b dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Rank</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Book Title</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400 text-right">Total Borrows</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-700">
                        {popularBooks.map((b, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                <td className="px-6 py-4 text-gray-500 dark:text-slate-400 font-medium">#{index + 1}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{b.title}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
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
