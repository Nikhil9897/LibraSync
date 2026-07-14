const Book = require('../models/Book');
require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { parsePagination } = require('../utils/paginate');
const User = require('../models/User');
const { uploadBase64Image } = require('../utils/cloudinary');

// GET /api/v1/books — List, search, filter, paginate
exports.getAllBooks = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { category, genre, available, sort, search } = req.query;

    let query = { isActive: true };

    if (search) {
        query.$text = { $search: search };
    }
    
    if (category && category !== 'All') {
        const mongoose = require('mongoose');
        if (mongoose.isValidObjectId(category)) {
            query.category = category;
        } else {
            const cat = await mongoose.model('Category').findOne({ name: category });
            if (cat) {
                query.category = cat._id;
            } else {
                query.category = null; // Force empty result if category name not found
            }
        }
    }

    if (genre) query.genres = { $in: [genre] };
    if (available === 'true') query.availableCopies = { $gt: 0 };

    let sortOption = { createdAt: -1 };
    if (sort === 'title') sortOption = { title: 1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const [books, total] = await Promise.all([
        Book.find(query).populate('category', 'name slug').sort(sortOption).skip(skip).limit(limit),
        Book.countDocuments(query),
    ]);

    res.json(new ApiResponse(200, 'Books retrieved', {
        books, total, page, pages: Math.ceil(total / limit),
    }));
});

// GET /api/v1/books/:id
exports.getBookById = asyncHandler(async (req, res) => {
    const book = await Book.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('category', 'name slug icon');
    if (!book) throw new ApiError(404, 'Book not found');
    res.json(new ApiResponse(200, 'Book found', { book }));
});

// GET /api/v1/books/:id/related
exports.getRelatedBooks = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) throw new ApiError(404, 'Book not found');

    const relatedBooks = await Book.find({
        _id: { $ne: book._id },
        $or: [
            { category: book.category },
            { author: book.author },
            { genres: { $in: book.genres } }
        ]
    })
    .limit(10)
    .sort('-averageRating');

    res.json(new ApiResponse(200, 'Related books retrieved', { books: relatedBooks }));
});

// POST /api/v1/books/:id/wishlist
exports.toggleWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new ApiError(404, 'User not found');
    
    const bookId = req.params.id;
    // Use .toString() to correctly compare ObjectId with string
    const isWishlisted = user.wishlist.some(id => id.toString() === bookId);
    
    if (isWishlisted) {
        user.wishlist = user.wishlist.filter(id => id.toString() !== bookId);
    } else {
        // Only add if not already present (prevent duplicates)
        user.wishlist.push(bookId);
    }
    
    await user.save({ validateBeforeSave: false });
    
    res.json(new ApiResponse(200, isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', { isWishlisted: !isWishlisted }));
});

// POST /api/v1/books — [admin/librarian]
exports.createBook = asyncHandler(async (req, res) => {
    let bookData = { ...req.body };
    if (bookData.coverImage && typeof bookData.coverImage === 'string' && bookData.coverImage.startsWith('data:image/')) {
        try {
            bookData.coverImage = await uploadBase64Image(bookData.coverImage, 'librasync/books');
        } catch (err) {
            throw new ApiError(400, 'Cover image upload failed');
        }
    }
    const book = await Book.create(bookData);
    res.status(201).json(new ApiResponse(201, 'Book created', { book }));
});

// PUT /api/v1/books/:id — [admin/librarian]
exports.updateBook = asyncHandler(async (req, res) => {
    let bookData = { ...req.body };
    if (bookData.coverImage && typeof bookData.coverImage === 'string' && bookData.coverImage.startsWith('data:image/')) {
        try {
            bookData.coverImage = await uploadBase64Image(bookData.coverImage, 'librasync/books');
        } catch (err) {
            throw new ApiError(400, 'Cover image upload failed');
        }
    }
    const book = await Book.findByIdAndUpdate(req.params.id, bookData, {
        new: true, runValidators: true,
    });
    if (!book) throw new ApiError(404, 'Book not found');
    res.json(new ApiResponse(200, 'Book updated', { book }));
});

// DELETE /api/v1/books/:id — [admin]
exports.deleteBook = asyncHandler(async (req, res) => {
    const book = await Book.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!book) throw new ApiError(404, 'Book not found');
    res.json(new ApiResponse(200, 'Book deleted'));
});
