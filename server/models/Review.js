const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, trim: true },
        comment: { type: String, trim: true },
        isVerifiedBorrower: { type: Boolean, default: false },
        helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

// One review per user per book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Performance indexes for faster retrieval
reviewSchema.index({ book: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

// After saving, update book's average rating
reviewSchema.statics.calcAverageRating = async function (bookId) {
    const stats = await this.aggregate([
        { $match: { book: bookId } },
        { $group: { _id: '$book', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const Book = mongoose.model('Book');
    if (stats.length > 0) {
        await Book.findByIdAndUpdate(bookId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
            numReviews: stats[0].count,
        });
    } else {
        await Book.findByIdAndUpdate(bookId, { averageRating: 0, numReviews: 0 });
    }
};

reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.book);
});

module.exports = mongoose.model('Review', reviewSchema);
