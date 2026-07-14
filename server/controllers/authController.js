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

    try {
        await sendEmail({
            to: user.email,
            subject: 'Welcome to LibraSync! 📚',
            html: getWelcomeEmailTemplate(user.name),
        });
    } catch (err) {
        console.error('Welcome email failed:', err);
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json(
        new ApiResponse(201, 'Registration successful', {
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            accessToken,
            refreshToken,
        })
    );
});

// @desc    Login user
// @route   POST /api/v1/auth/login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
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
    res.json(new ApiResponse(200, 'User profile', { user }));
});

// @desc    Forgot password — send reset email
// @route   POST /api/v1/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        throw new ApiError(404, 'No account with that email');
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
        await sendEmail({
            to: user.email,
            subject: 'LibraSync — Password Reset',
            html: getResetPasswordEmailTemplate(resetUrl, user.name),
        });
        res.json(new ApiResponse(200, 'Reset email sent'));
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(500, 'Email could not be sent');
    }
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
    await user.save();

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
