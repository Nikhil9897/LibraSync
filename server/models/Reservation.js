const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
        reservationDate: { type: Date, default: Date.now },
        expiryDate: Date,
        status: {
            type: String,
            enum: ['pending', 'fulfilled', 'cancelled', 'expired'],
            default: 'pending',
        },
        position: { type: Number },
    },
    { timestamps: true }
);

reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ book: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
