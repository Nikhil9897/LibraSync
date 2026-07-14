const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Create a reservation
// @route   POST /api/v1/reservations
// @access  Private
exports.createReservation = asyncHandler(async (req, res) => {
    const { bookId } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) throw new ApiError(404, 'Book not found');

    if (book.availableCopies > 0) {
        throw new ApiError(400, 'Book is currently available. You can borrow it directly.');
    }

    // Check if user already has an active reservation for this book
    const existingReservation = await Reservation.findOne({
        user: userId,
        book: bookId,
        status: 'pending'
    });

    if (existingReservation) {
        throw new ApiError(400, 'You already have a pending reservation for this book');
    }

    // Determine position in queue
    const position = await Reservation.countDocuments({ book: bookId, status: 'pending' }) + 1;

    const reservation = await Reservation.create({
        user: userId,
        book: bookId,
        position
    });

    // Notify User
    await Notification.create({
        user: userId,
        title: 'Reservation Confirmed',
        message: `You are now #${position} in line for "${book.title}". We'll notify you when it's available.`,
        type: 'reservation'
    });

    res.status(201).json(new ApiResponse(201, 'Reservation created successfully', { reservation }));
});

// @desc    Get my reservations
// @route   GET /api/v1/reservations/my
// @access  Private
exports.getMyReservations = asyncHandler(async (req, res) => {
    const reservations = await Reservation.find({ user: req.user.id })
        .populate('book', 'title author coverImage')
        .sort('-createdAt');

    res.json(new ApiResponse(200, 'Reservations retrieved', { reservations }));
});

// @desc    Cancel reservation
// @route   DELETE /api/v1/reservations/:id
// @access  Private
exports.cancelReservation = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findOne({
        _id: req.params.id,
        user: req.user.id,
        status: 'pending'
    });

    if (!reservation) {
        throw new ApiError(404, 'Pending reservation not found');
    }

    reservation.status = 'cancelled';
    await reservation.save();

    // Re-adjust positions for others (optional but good practice)
    await Reservation.updateMany(
        { book: reservation.book, status: 'pending', position: { $gt: reservation.position } },
        { $inc: { position: -1 } }
    );

    res.json(new ApiResponse(200, 'Reservation cancelled successfully'));
});

// @desc    Claim a fulfilled reservation
// @route   POST /api/v1/reservations/:id/claim
// @access  Private
exports.claimReservation = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findOne({
        _id: req.params.id,
        user: req.user.id,
        status: 'fulfilled'
    });

    if (!reservation) {
        throw new ApiError(404, 'Reservation not found or not ready to be claimed');
    }

    // Create Borrow
    const borrowDays = parseInt(process.env.BORROW_DAYS) || 14;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + borrowDays);

    const borrow = await Borrow.create({
        user: req.user.id,
        book: reservation.book,
        dueDate,
        issuedBy: req.user.id, // self-issued for demo purposes
    });

    // Update Book stats
    await Book.findByIdAndUpdate(reservation.book, {
        $inc: { borrowsCount: 1 }
        // Do not decrement availableCopies since it was already held (not incremented on return)
    });

    // Remove the reservation since it's now a borrow
    await Reservation.findByIdAndDelete(reservation._id);

    // Notify user about the successful claim
    const claimedBook = await Book.findById(reservation.book);
    await Notification.create({
        user: req.user.id,
        type: 'borrow',
        title: 'Reservation Claimed',
        message: `You've claimed "${claimedBook?.title || 'your reserved book'}". It is due on ${dueDate.toLocaleDateString()}.`
    });

    res.json(new ApiResponse(200, 'Book claimed and borrowed successfully!', { borrow }));
});

