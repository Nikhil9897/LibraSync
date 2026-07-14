import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiBell, FiClock, FiAlertTriangle, FiBookmark, FiDollarSign, FiInfo } from 'react-icons/fi';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications/my');
            setNotifications(res.data.data.notifications);
        } catch (err) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id, isRead) => {
        if (isRead) return; // Already read
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'due_reminder': return <FiClock size={24} className="text-yellow-500" />;
            case 'overdue': return <FiAlertTriangle size={24} className="text-red-500" />;
            case 'reservation': return <FiBookmark size={24} className="text-[#0d5959] dark:text-teal-500" />;
            case 'fine': return <FiDollarSign size={24} className="text-red-600 dark:text-red-400" />;
            case 'announcement': return <FiInfo size={24} className="text-[#0d5959]" />;
            default: return <FiBell size={24} className="text-[#d4a853]" />;
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-[#0d5959] dark:border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="max-w-4xl mx-auto py-8" style={{  }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl  font-bold text-[#1a1f36] dark:text-white">Notifications</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Stay updated on your library activity</p>
                </div>
                {unreadCount > 0 && (
                    <div className="bg-[#0d5959] dark:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-[#0d5959]/20 dark:shadow-teal-900/20">
                        {unreadCount} Unread
                    </div>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-16 text-center shadow-sm">
                    <div className="w-24 h-24 bg-[#0d5959]/10 dark:bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0d5959] dark:text-teal-400">
                        <FiBell size={40} />
                    </div>
                    <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white mb-3">All Caught Up!</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto font-medium">
                        You have no notifications right now. We'll let you know when something needs your attention.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {notifications.map((notification) => (
                        <div 
                            key={notification._id} 
                            onClick={() => markAsRead(notification._id, notification.isRead)}
                            className={`bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 cursor-pointer transition-all shadow-sm ${
                                !notification.isRead ? 'border-[#0d5959]/30 dark:border-teal-500/30 bg-[#0d5959]/5 dark:bg-teal-500/10' : 'border-slate-200/60 dark:border-slate-700 hover:border-[#0d5959]/20 dark:hover:border-teal-500/30 hover:shadow-md dark:shadow-none'
                            }`}
                        >
                            <div className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-white dark:bg-slate-800 dark:bg-slate-700 shadow-sm border dark:border-slate-700 border-slate-100 dark:border-slate-600' : 'bg-slate-50 dark:bg-slate-900 dark:bg-slate-700/50'}`}>
                                {getIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1 gap-4">
                                    <h3 className={`font-bold text-lg ${!notification.isRead ? 'text-[#0d5959] dark:text-teal-400' : 'text-[#1a1f36] dark:text-white'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full whitespace-nowrap">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className={`text-base ${!notification.isRead ? 'text-[#1a1f36] dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {notification.message}
                                </p>
                            </div>

                            {!notification.isRead && (
                                <div className="w-3 h-3 bg-[#0d5959] dark:bg-teal-500 rounded-full shadow-[0_0_8px_rgba(13,89,89,0.5)] dark:shadow-[0_0_8px_rgba(20,184,166,0.5)] self-start sm:self-center shrink-0"></div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
