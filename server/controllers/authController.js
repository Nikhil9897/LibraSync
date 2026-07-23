const User = require('../models/User');
const passport = require('passport');
const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { sendEmail } = require('../services/emailService');
const { getWelcomeEmailTemplate, getResetPasswordEmailTemplate } = require('../utils/emailTemplates');

// @desc    Register a new user
// @route   POST /api/v1/auth/register
exports.register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, 'Email already registered');
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json(
        new ApiResponse(201, 'Registration successful', {
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            accessToken,
            refreshToken,
        })
    );

    // Send welcome email in background (non-blocking)
    sendEmail({
        to: user.email,
        subject: 'Welcome to LibraSync! 📚',
        html: getWelcomeEmailTemplate(user.name),
    }).catch(err => console.error('Background welcome email failed:', err.message));
});

// @desc    Login user
// @route   POST /api/v1/auth/login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    // Account was created via Google OAuth — no password set
    if (!user.password) {
        throw new ApiError(401, 'This account uses Google Sign-In. Please click "Continue with Google" to log in.');
    }

    if (!(await user.matchPassword(password))) {
        throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
        throw new ApiError(403, 'Account has been deactivated');
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.json(
        new ApiResponse(200, 'Login successful', {
            user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
            accessToken,
            refreshToken,
        })
    );
});

// @desc    Google OAuth callback
// @route   GET /api/v1/auth/google/callback
exports.googleCallback = asyncHandler(async (req, res) => {
    const user = req.user;
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Redirect to frontend with tokens as query params
    res.redirect(
        `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`
    );
});

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    
    // --- Streak Logic ---
    let needsSave = false;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    if (user.lastLoginDate) {
        const lastLoginStr = user.lastLoginDate.toISOString().split('T')[0];
        
        if (todayStr !== lastLoginStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (lastLoginStr === yesterdayStr) {
                user.currentStreak += 1; // Kept the streak alive
            } else {
                user.currentStreak = 1; // Streak broken
            }
            user.lastLoginDate = now;
            needsSave = true;
        }
    } else {
        // First login since streak feature was added
        user.currentStreak = 1;
        user.lastLoginDate = now;
        needsSave = true;
    }
    
    if (needsSave) {
        await user.save({ validateBeforeSave: false });
    }
    
    res.json(new ApiResponse(200, 'User profile', { user }));
});

// @desc    Forgot password — send reset email
// @route   POST /api/v1/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    // Always return a generic message to prevent email enumeration attacks
    if (!user) {
        return res.json(new ApiResponse(200, 'If an account with that email exists, a reset link has been sent.'));
    }

    // Block password reset for OAuth-only accounts (no password set)
    if (!user.password && user.googleId) {
        return res.json(new ApiResponse(200, 'If an account with that email exists, a reset link has been sent.'));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Return response immediately so UI never hangs waiting for SMTP TCP handshake
    res.json(new ApiResponse(200, 'If an account with that email exists, a reset link has been sent.'));

    // Trigger email send in background (non-blocking)
    sendEmail({
        to: user.email,
        subject: 'LibraSync — Password Reset',
        html: getResetPasswordEmailTemplate(resetUrl, user.name),
    }).catch(async (err) => {
        console.error('Background reset email failed:', err.message);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
    });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:token
exports.resetPassword = asyncHandler(async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, 'Invalid or expired reset token');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    // validateBeforeSave: false prevents Mongoose from rejecting the save
    // due to unrelated required fields that weren't changed
    await user.save({ validateBeforeSave: false });

    res.json(new ApiResponse(200, 'Password reset successful'));
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
exports.refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
    }

    try {
        const decoded = require('jsonwebtoken').verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.id);
        if (!user) {
            throw new ApiError(401, 'User not found');
        }

        if (!user.isActive) {
            throw new ApiError(403, 'Account has been deactivated');
        }

        const newAccessToken = generateAccessToken(user._id, user.role);

        res.json(
            new ApiResponse(200, 'Token refreshed', {
                accessToken: newAccessToken,
            })
        );
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Invalid or expired refresh token');
        }
        throw err;
    }
});
