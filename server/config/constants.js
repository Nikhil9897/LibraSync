module.exports = {
    ROLES: {
        MEMBER: 'member',
        LIBRARIAN: 'librarian',
        ADMIN: 'admin',
    },
    BORROW_STATUS: {
        ACTIVE: 'active',
        RETURNED: 'returned',
        OVERDUE: 'overdue',
    },
    RESERVATION_STATUS: {
        PENDING: 'pending',
        FULFILLED: 'fulfilled',
        CANCELLED: 'cancelled',
        EXPIRED: 'expired',
    },
    FINE_STATUS: {
        PENDING: 'pending',
        PAID: 'paid',
        WAIVED: 'waived',
    },
    NOTIFICATION_TYPES: [
        'due_reminder', 'overdue',
        'reservation', 'fine', 'announcement'
    ],
};
