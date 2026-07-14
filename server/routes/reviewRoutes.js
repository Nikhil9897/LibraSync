const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { addReview, getBookReviews, getMyReviews, deleteReview, updateReview, toggleHelpfulVote } = require('../controllers/reviewController');

router.get('/user/me', protect, getMyReviews);

router.route('/:bookId')
    .post(protect, addReview)
    .get(getBookReviews);

router.route('/:id')
    .put(protect, updateReview)
    .delete(protect, deleteReview);

router.put('/:id/vote', protect, toggleHelpfulVote);

module.exports = router;
