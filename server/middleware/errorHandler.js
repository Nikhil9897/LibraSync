const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error(err.message, { stack: err.stack, url: req.originalUrl });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = { statusCode: 404, message: 'Resource not found' };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = { statusCode: 409, message: `Duplicate value for ${field}` };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        error = { statusCode: 400, message: messages.join(', ') };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = { statusCode: 401, message: 'Invalid token' };
    }
    if (err.name === 'TokenExpiredError') {
        error = { statusCode: 401, message: 'Token expired' };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
