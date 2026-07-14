const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        slug: { type: String, unique: true, lowercase: true },
        description: { type: String, default: '' },
        icon: { type: String, default: '📚' },
        bookCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Auto-generate slug before saving
categorySchema.pre('save', function () {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
});

module.exports = mongoose.model('Category', categorySchema);
