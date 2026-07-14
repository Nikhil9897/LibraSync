const Fine = require('../models/Fine');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get my fines
// @route   GET /api/v1/fines/my
// @access  Private
exports.getMyFines = asyncHandler(async (req, res) => {
    const fines = await Fine.find({ user: req.user.id })
        .populate({
            path: 'borrow',
            populate: { path: 'book', select: 'title' }
        })
        .sort('-createdAt');

    res.json(new ApiResponse(200, 'Fines retrieved', { fines }));
});

// @desc    Pay a fine
// @route   PUT /api/v1/fines/:id/pay
// @access  Private
exports.payFine = asyncHandler(async (req, res) => {
    const fine = await Fine.findOne({ _id: req.params.id, user: req.user.id, status: 'pending' });

    if (!fine) {
        throw new ApiError(404, 'Pending fine not found');
    }

    // In a real application, you would integrate Stripe/PayPal here.
    // We will just mock the successful payment.

    fine.status = 'paid';
    fine.paidDate = new Date();
    await fine.save();

    res.json(new ApiResponse(200, 'Fine paid successfully', { fine }));
});
