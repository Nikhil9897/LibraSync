const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { clearUserCache } = require('../middleware/auth');

// @desc    Update user profile
// @route   PUT /api/v1/users/me
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, address, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) throw new ApiError(404, 'User not found');

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    clearUserCache(user._id); // Invalidate cache after profile update

    res.json(new ApiResponse(200, 'Profile updated successfully', {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, avatar: user.avatar }
    }));
});

// @desc    Get user wishlist
// @route   GET /api/v1/users/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate('wishlist');
    if (!user) throw new ApiError(404, 'User not found');
    // Deduplicate in case of legacy duplicate entries
    const seen = new Set();
    const wishlist = user.wishlist.filter(book => {
        if (!book || seen.has(book._id.toString())) return false;
        seen.add(book._id.toString());
        return true;
    });
    res.json(new ApiResponse(200, 'Wishlist retrieved', { wishlist }));
});

// @desc    Update password
// @route   PUT /api/v1/users/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, 'Please provide both current and new password');
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) throw new ApiError(404, 'User not found');

    if (!(await user.matchPassword(currentPassword))) {
        throw new ApiError(401, 'Incorrect current password');
    }

    user.password = newPassword;
    await user.save();

    res.json(new ApiResponse(200, 'Password updated successfully'));
});

// @desc    Delete user account (self)
// @route   DELETE /api/v1/users/me
// @access  Private
exports.deleteMe = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json(new ApiResponse(200, 'Account deleted successfully'));
});

// @desc    Get all users (for admin/librarian)
// @route   GET /api/v1/users
// @access  Private (Admin/Librarian)
exports.getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ isActive: true })
        .select('name email role isActive membershipDate')
        .sort('name');
    res.json(new ApiResponse(200, 'Users retrieved', { users }));
});

// @desc    Update user role
// @route   PUT /api/v1/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    
    if (req.params.id === req.user.id.toString()) {
        throw new ApiError(403, 'You cannot change your own role to prevent locking yourself out.');
    }

    if (!['member', 'librarian', 'admin'].includes(role)) {
        throw new ApiError(400, 'Invalid role');
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    if (!user) throw new ApiError(404, 'User not found');

    res.json(new ApiResponse(200, 'User role updated', { user }));
});

// @desc    Deactivate user account
// @route   DELETE /api/v1/users/:id
// @access  Private (Admin)
exports.deactivateUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) throw new ApiError(404, 'User not found');

    res.json(new ApiResponse(200, 'User account deactivated'));
});
