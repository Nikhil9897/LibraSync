const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getMyFines, payFine } = require('../controllers/fineController');

router.get('/my', protect, getMyFines);
router.put('/:id/pay', protect, payFine);

module.exports = router;
