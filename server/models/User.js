const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true },
        email: {
            type: String, required: [true, 'Email is required'],
            unique: true, lowercase: true, trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String, minlength: 6,
            select: false, // Don't return password by default
        },
        avatar: { type: String, default: '' },
        role: {
            type: String, enum: ['member', 'librarian', 'admin'],
            default: 'member',
        },
        googleId: { type: String, sparse: true },
        phone: { type: String, trim: true },
        address: {
            street: String, city: String,
            state: String, zip: String,
        },
        membershipDate: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
        borrowLimit: { type: Number, default: 5 },
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
        recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
        currentStreak: { type: Number, default: 0 },
        lastLoginDate: { type: Date },
        monthlyReadingGoal: { type: Number, default: 5 },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
