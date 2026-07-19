const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllBooks, getBookById, createBook,
    updateBook, deleteBook, getRelatedBooks, toggleWishlist, getCategoryCounts, getCategories
} = require('../controllers/bookController');

router.route('/category-counts')
    .get(getCategoryCounts);

router.route('/categories/all')
    .get(getCategories);

router.route('/')
    .get(getAllBooks)
    .post(protect, authorize('admin', 'librarian'), createBook);

router.route('/:id/related')
    .get(getRelatedBooks);
    
router.route('/:id/wishlist')
    .post(protect, toggleWishlist);

router.route('/:id')
    .get(getBookById)
    .put(protect, authorize('admin', 'librarian'), updateBook)
    .delete(protect, authorize('admin'), deleteBook);

module.exports = router;
