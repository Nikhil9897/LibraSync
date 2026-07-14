const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: [true, 'Title is required'], trim: true },
        author: { type: String, required: [true, 'Author is required'], trim: true },
        isbn: { type: String, required: true, unique: true, trim: true },
        description: { type: String, default: '' },
        publisher: { type: String, trim: true },
        publishedDate: Date,
        pageCount: { type: Number, min: 1 },
        coverImage: { type: String, default: '' },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        genres: [String],
        language: { type: String, default: 'English' },
        totalCopies: { type: Number, required: true, min: 0 },
        availableCopies: { type: Number, required: true, min: 0 },
        location: {
            shelf: String, row: String, section: String,
        },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        numReviews: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        edition: { type: String, trim: true },
        views: { type: Number, default: 0 },
        borrowsCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Text index for full-text search
bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

// Performance Indexes for sorting and filtering
bookSchema.index({ category: 1 });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ availableCopies: 1 });

module.exports = mongoose.model('Book', bookSchema);
