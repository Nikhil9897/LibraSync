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
            case 'due_reminder': return <FiClock size={24} style={{ color: 'var(--warning)' }} />;
            case 'overdue': return <FiAlertTriangle size={24} style={{ color: 'var(--danger)' }} />;
            case 'reservation': return <FiBookmark size={24} style={{ color: 'var(--secondary)' }} />;
            case 'fine': return <FiDollarSign size={24} style={{ color: 'var(--danger)' }} />;
            case 'announcement': return <FiInfo size={24} style={{ color: 'var(--primary)' }} />;
            default: return <FiBell size={24} style={{ color: 'var(--primary)' }} />;
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary)' }}></div>
        </div>
    );

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h1>
                    <p className="font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>Stay updated on your library activity</p>
                </div>
                {unreadCount > 0 && (
                    <div
                        className="text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md"
                        style={{ backgroundColor: 'var(--primary)' }}
                    >
                        {unreadCount} Unread
                    </div>
                )}
            </div>

            {notifications.length === 0 ? (
                <div
                    className="rounded-3xl p-16 text-center shadow-sm border"
                    style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                    }}
                >
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{
                            backgroundColor: 'var(--primary-muted)',
                            color: 'var(--primary)',
                        }}
                    >
                        <FiBell size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>All Caught Up!</h2>
                    <p className="text-lg mb-8 max-w-md mx-auto font-medium" style={{ color: 'var(--text-secondary)' }}>
                        You have no notifications right now. We'll let you know when something needs your attention.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {notifications.map((notification) => (
                        <div 
                            key={notification._id} 
                            onClick={() => markAsRead(notification._id, notification.isRead)}
                            className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 cursor-pointer transition-all shadow-sm border"
                            style={{
                                backgroundColor: 'var(--surface)',
                                borderColor: !notification.isRead ? 'var(--primary)' : 'var(--border)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = !notification.isRead ? 'var(--primary)' : 'var(--border)'; }}
                        >
                            <div
                                className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center border"
                                style={{
                                    backgroundColor: !notification.isRead ? 'var(--primary-muted)' : 'var(--surface-hover)',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                {getIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1 gap-4">
                                    <h3
                                        className="font-bold text-lg"
                                        style={{ color: !notification.isRead ? 'var(--primary)' : 'var(--text-primary)' }}
                                    >
                                        {notification.title}
                                    </h3>
                                    <span
                                        className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap border"
                                        style={{
                                            backgroundColor: 'var(--surface-2)',
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p
                                    className="text-base"
                                    style={{
                                        color: !notification.isRead ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        fontWeight: !notification.isRead ? 600 : 400,
                                    }}
                                >
                                    {notification.message}
                                </p>
                            </div>

                            {!notification.isRead && (
                                <div
                                    className="w-3 h-3 rounded-full self-start sm:self-center shrink-0 shadow-md"
                                    style={{ backgroundColor: 'var(--primary)' }}
                                ></div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
