const User = require('../models/User');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const Fine = require('../models/Fine');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get top level KPIs
// @route   GET /api/v1/analytics/kpis
// @access  Private (Admin)
exports.getKPIs = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ isActive: true });
    
    const booksAggr = await Book.aggregate([
        { $group: { _id: null, totalCopies: { $sum: '$totalCopies' } } }
    ]);
    const totalBooks = booksAggr[0]?.totalCopies || 0;

    const activeBorrows = await Borrow.countDocuments({ status: 'active' });

    const finesAggr = await Fine.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, totalCollected: { $sum: '$amount' } } }
    ]);
    const totalFines = finesAggr[0]?.totalCollected || 0;

    res.json(new ApiResponse(200, 'KPIs retrieved', {
        kpis: {
            totalUsers,
            totalBooks,
            activeBorrows,
            totalFines
        }
    }));
});

// @desc    Get borrow trends (last 30 days)
// @route   GET /api/v1/analytics/borrow-trends
// @access  Private (Admin)
exports.getBorrowTrends = asyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await Borrow.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Format for recharts: { date: 'YYYY-MM-DD', borrows: 5 }
    const formattedTrends = trends.map(t => ({
        date: t._id,
        borrows: t.count
    }));

    res.json(new ApiResponse(200, 'Borrow trends retrieved', { trends: formattedTrends }));
});

// @desc    Get most popular books
// @route   GET /api/v1/analytics/popular-books
// @access  Private (Admin)
exports.getPopularBooks = asyncHandler(async (req, res) => {
    const popular = await Borrow.aggregate([
        { $group: { _id: "$book", borrowCount: { $sum: 1 } } },
        { $sort: { borrowCount: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'books',
                localField: '_id',
                foreignField: '_id',
                as: 'bookDetails'
            }
        },
        { $unwind: "$bookDetails" },
        {
            $project: {
                _id: 0,
                title: "$bookDetails.title",
                borrows: "$borrowCount"
            }
        }
    ]);

    res.json(new ApiResponse(200, 'Popular books retrieved', { popularBooks: popular }));
});
