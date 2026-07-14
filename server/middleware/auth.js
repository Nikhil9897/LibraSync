const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('./asyncHandler');

// In-memory user cache with 60-second TTL
const userCache = new Map();
const CACHE_TTL = 60 * 1000;

const getCachedUser = async (id) => {
    const cached = userCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.user;
    }
    // Use lean() for speed, then manually add .id string so controllers work
    const user = await User.findById(id)
        .select('_id name email role avatar isActive')
        .lean();
    if (user) {
        user.id = user._id.toString(); // normalise so req.user.id always works
        userCache.set(id, { user, timestamp: Date.now() });
    }
    return user;
};

// Call after profile/role changes so stale data is never served
const clearUserCache = (id) => userCache.delete(id?.toString());

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new ApiError(401, 'Not authorized — no token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getCachedUser(decoded.id);

    if (!user) {
        throw new ApiError(401, 'User not found');
    }

    if (user.isActive === false) {
        throw new ApiError(403, 'Account has been deactivated');
    }

    req.user = user;
    next();
});

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, `Role '${req.user.role}' is not authorized`);
        }
        next();
    };
};

module.exports = { protect, authorize, clearUserCache };
