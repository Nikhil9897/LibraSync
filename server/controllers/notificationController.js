const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get my notifications
// @route   GET /api/v1/notifications/my
// @access  Private
exports.getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user.id })
        .sort('-createdAt')
        .limit(50);

    res.json(new ApiResponse(200, 'Notifications retrieved', { notifications }));
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user.id });

    if (!notification) {
        throw new ApiError(404, 'Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    res.json(new ApiResponse(200, 'Notification marked as read', { notification }));
});

// @desc    Mark ALL notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user.id, isRead: false },
        { $set: { isRead: true } }
    );
    res.json(new ApiResponse(200, 'All notifications marked as read'));
});
