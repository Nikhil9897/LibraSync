const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const Fine = require('../models/Fine');
const Notification = require('../models/Notification');
const Reservation = require('../models/Reservation');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// POST /api/v1/borrows — Issue a book [librarian]
exports.issueBook = asyncHandler(async (req, res) => {
    const { userId, bookId } = req.body;
    const borrowDays = parseInt(process.env.BORROW_DAYS) || 14;

    // Check if book is available
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies < 1) {
        throw new ApiError(400, 'Book not available');
    }

    // Check borrow limit
    const activeBorrows = await Borrow.countDocuments({
        user: userId, status: 'active',
    });
    if (activeBorrows >= (process.env.BORROW_LIMIT || 5)) {
        throw new ApiError(400, 'Borrow limit reached');
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + borrowDays);

    const borrow = await Borrow.create({
        user: userId,
        book: bookId,
        dueDate,
        issuedBy: req.user.id,
    });

    // Decrement available copies
    book.availableCopies -= 1;
    await book.save();

    // Create Notification
    await Notification.create({
        user: userId,
        title: 'Book Borrowed',
        message: `You have successfully borrowed "${book.title}". It is due on ${dueDate.toLocaleDateString()}.`,
        type: 'borrow'
    });

    res.status(201).json(new ApiResponse(201, 'Book issued', { borrow }));
});

// POST /api/v1/borrows/self — User self-checkouts a book [member]
exports.selfCheckoutBook = asyncHandler(async (req, res) => {
    const { bookId } = req.body;
    const userId = req.user.id;
    const borrowDays = parseInt(process.env.BORROW_DAYS) || 14;

    const book = await Book.findById(bookId);
    if (!book || book.availableCopies < 1) {
        throw new ApiError(400, 'Book not available');
    }

    const activeBorrows = await Borrow.countDocuments({
        user: userId, status: 'active',
    });
    if (activeBorrows >= (process.env.BORROW_LIMIT || 5)) {
        throw new ApiError(400, 'Borrow limit reached');
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + borrowDays);

    const borrow = await Borrow.create({
        user: userId,
        book: bookId,
        dueDate,
        issuedBy: userId,
    });

    book.availableCopies -= 1;
    book.borrowsCount = (book.borrowsCount || 0) + 1;
    await book.save();

    // Create Notification
    await Notification.create({
        user: userId,
        title: 'Book Borrowed',
        message: `You have successfully borrowed "${book.title}". It is due on ${dueDate.toLocaleDateString()}.`,
        type: 'borrow'
    });

    res.status(201).json(new ApiResponse(201, 'Book borrowed successfully', { borrow }));
});

// PUT /api/v1/borrows/:id/return — [librarian]
exports.returnBook = asyncHandler(async (req, res) => {
    const borrow = await Borrow.findById(req.params.id).populate('book');
    if (!borrow || borrow.status === 'returned') {
        throw new ApiError(400, 'Invalid borrow');
    }

    borrow.status = 'returned';
    borrow.returnDate = new Date();
    borrow.returnedTo = req.user.id;

    // Calculate fine if overdue
    if (new Date() > borrow.dueDate) {
        const daysOverdue = Math.ceil(
            (new Date() - borrow.dueDate) / (1000 * 60 * 60 * 24)
        );
        const fineAmount = daysOverdue * parseFloat(process.env.FINE_PER_DAY || 0.50);
        const fine = await Fine.create({
            user: borrow.user,
            borrow: borrow._id,
            amount: fineAmount,
            reason: `Overdue by ${daysOverdue} day(s)`,
        });
        borrow.fine = fine._id;

        // Generate a notification for the user
        await Notification.create({
            user: borrow.user,
            type: 'fine',
            title: 'Fine Issued',
            message: `A fine of $${fineAmount.toFixed(2)} has been issued for returning "${borrow.book.title}" ${daysOverdue} days late.`
        });
    }

    await borrow.save();

    // Notify user that the book has been returned
    await Notification.create({
        user: borrow.user,
        type: 'borrow',
        title: 'Book Returned',
        message: `"${borrow.book.title}" has been successfully returned. Thank you!`
    });

    // Check for pending reservations
    const pendingReservation = await Reservation.findOne({ book: borrow.book._id, status: 'pending' }).sort({ position: 1 });
    
    if (pendingReservation) {
        pendingReservation.status = 'fulfilled';
        pendingReservation.position = null;
        await pendingReservation.save();

        // Update positions of remaining reservations
        await Reservation.updateMany(
            { book: borrow.book._id, status: 'pending' },
            { $inc: { position: -1 } }
        );

        // Notify user
        await Notification.create({
            user: pendingReservation.user,
            type: 'system',
            title: 'Reservation Fulfilled!',
            message: `Your reserved book "${borrow.book.title}" is now available. Please claim it from your reservations page.`
        });
        // Do not increment availableCopies, since it is held for this user
    } else {
        // Increment available copies if no reservations
        await Book.findByIdAndUpdate(borrow.book._id, {
            $inc: { availableCopies: 1 },
        });
    }

    res.json(new ApiResponse(200, 'Book returned', { borrow }));
});

// PUT /api/v1/borrows/:id/renew — [member]
exports.renewBook = asyncHandler(async (req, res) => {
    const borrow = await Borrow.findOne({
        _id: req.params.id,
        user: req.user.id,
        status: 'active',
    });

    if (!borrow) throw new ApiError(404, 'Active borrow not found');
    if (borrow.renewalsCount >= borrow.maxRenewals) {
        throw new ApiError(400, 'Maximum renewals reached');
    }

    const borrowDays = parseInt(process.env.BORROW_DAYS) || 14;
    borrow.dueDate = new Date(borrow.dueDate.getTime() + borrowDays * 86400000);
    borrow.renewalsCount += 1;
    await borrow.save();

    res.json(new ApiResponse(200, 'Book renewed', { borrow }));
});

// GET /api/v1/borrows/my — User's borrows
exports.getMyBorrows = asyncHandler(async (req, res) => {
    const borrows = await Borrow.find({ user: req.user.id })
        .populate('book', 'title author coverImage isbn')
        .sort({ createdAt: -1 });
    res.json(new ApiResponse(200, 'Your borrows', { borrows }));
});

// GET /api/v1/borrows — All borrows (for admin/librarian)
exports.getAllBorrows = asyncHandler(async (req, res) => {
    const borrows = await Borrow.find()
        .populate('book', 'title author coverImage isbn')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    res.json(new ApiResponse(200, 'All borrows retrieved', { borrows }));
});
