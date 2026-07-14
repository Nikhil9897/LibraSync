const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getKPIs, getBorrowTrends, getPopularBooks } = require('../controllers/analyticsController');

// All routes here are restricted to admin
router.use(protect, authorize('admin'));

router.get('/kpis', getKPIs);
router.get('/borrow-trends', getBorrowTrends);
router.get('/popular-books', getPopularBooks);

module.exports = router;
