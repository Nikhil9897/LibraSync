const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        borrow: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrow', required: true },
        amount: { type: Number, required: true, min: 0 },
        reason: { type: String, default: 'Overdue return' },
        status: {
            type: String,
            enum: ['pending', 'paid', 'waived'],
            default: 'pending',
        },
        paidDate: Date,
        waivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

fineSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Fine', fineSchema);
