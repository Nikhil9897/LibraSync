const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
    issueBook, returnBook, renewBook, getMyBorrows, getAllBorrows, selfCheckoutBook
} = require('../controllers/borrowController');

router.route('/')
    .post(protect, authorize('librarian', 'admin'), issueBook)
    .get(protect, authorize('librarian', 'admin'), getAllBorrows);

router.post('/self', protect, selfCheckoutBook);
router.get('/my', protect, getMyBorrows);
router.put('/:id/return', protect, authorize('librarian', 'admin'), returnBook);
router.put('/:id/renew', protect, renewBook);

module.exports = router;
