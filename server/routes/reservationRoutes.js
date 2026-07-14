const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createReservation, getMyReservations, cancelReservation, claimReservation } = require('../controllers/reservationController');

router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.delete('/:id', protect, cancelReservation);
router.post('/:id/claim', protect, claimReservation);

module.exports = router;
