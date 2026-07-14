const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Increased for dev
    message: { success: false, message: 'Too many requests, please try again later' },
});

module.exports = limiter;
