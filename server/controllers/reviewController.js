const Review = require('../models/Review');
const Borrow = require('../models/Borrow');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Add a review
// @route   POST /api/v1/reviews/:bookId
// @access  Private
exports.addReview = asyncHandler(async (req, res) => {
    const { rating, title, comment } = req.body;
    const bookId = req.params.bookId;
    const userId = req.user.id;

    // Check if user already reviewed
    const existingReview = await Review.findOne({ user: userId, book: bookId });
    if (existingReview) {
        throw new ApiError(400, 'You have already reviewed this book');
    }

    // Check if user has actually borrowed the book
    const hasBorrowed = await Borrow.findOne({ user: userId, book: bookId });
    const isVerifiedBorrower = !!hasBorrowed;

    const review = await Review.create({
        user: userId,
        book: bookId,
        rating,
        title,
        comment,
        isVerifiedBorrower
    });

    res.status(201).json(new ApiResponse(201, 'Review added successfully', { review }));
});

// @desc    Get all reviews for a book
// @route   GET /api/v1/reviews/:bookId
// @access  Public
exports.getBookReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ book: req.params.bookId })
        .populate('user', 'name avatar')
        .sort('-createdAt');

    res.json(new ApiResponse(200, 'Reviews retrieved', { reviews }));
});

// @desc    Get logged in user's reviews
// @route   GET /api/v1/reviews/user/me
// @access  Private
exports.getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ user: req.user.id })
        .populate('book', 'title author coverImage')
        .sort('-createdAt');

    res.json(new ApiResponse(200, 'My reviews retrieved', { reviews }));
});

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    
    if (!review) throw new ApiError(404, 'Review not found');
    
    // Make sure user owns review
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to delete this review');
    }
    
    await review.deleteOne();
    
    res.json(new ApiResponse(200, 'Review deleted successfully'));
});

// @desc    Update a review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res) => {
    let review = await Review.findById(req.params.id);
    
    if (!review) throw new ApiError(404, 'Review not found');
    
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to update this review');
    }
    
    const { rating, title, comment } = req.body;
    
    review.rating = rating || review.rating;
    review.title = title !== undefined ? title : review.title;
    review.comment = comment !== undefined ? comment : review.comment;
    
    await review.save();
    
    res.json(new ApiResponse(200, 'Review updated successfully', { review }));
});

// @desc    Toggle helpful vote on review
// @route   PUT /api/v1/reviews/:id/vote
// @access  Private
exports.toggleHelpfulVote = asyncHandler(async (req, res) => {
    let review = await Review.findById(req.params.id);
    if (!review) throw new ApiError(404, 'Review not found');
    
    const userId = req.user.id;
    const isVoted = review.helpfulVotes.includes(userId);
    
    if (isVoted) {
        review.helpfulVotes.pull(userId);
    } else {
        review.helpfulVotes.push(userId);
    }
    
    await review.save();
    
    res.json(new ApiResponse(200, isVoted ? 'Vote removed' : 'Vote added', { isVoted: !isVoted }));
});
