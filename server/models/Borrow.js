const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
        borrowDate: { type: Date, default: Date.now },
        dueDate: { type: Date, required: true },
        returnDate: Date,
        status: {
            type: String,
            enum: ['active', 'returned', 'overdue'],
            default: 'active',
        },
        renewalsCount: { type: Number, default: 0 },
        maxRenewals: { type: Number, default: 2 },
        fine: { type: mongoose.Schema.Types.ObjectId, ref: 'Fine' },
        issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        returnedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

// Indexes for common queries
borrowSchema.index({ user: 1, status: 1 });
borrowSchema.index({ book: 1, status: 1 });
borrowSchema.index({ dueDate: 1 });
borrowSchema.index({ user: 1, borrowDate: -1 });

module.exports = mongoose.model('Borrow', borrowSchema);
