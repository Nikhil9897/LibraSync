const router = require('express').Router();

// Mount auth routes
router.use('/auth', require('./authRoutes'));

// Mount more routes as you build them:
router.use('/books', require('./bookRoutes'));
router.use('/borrows', require('./borrowRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/reviews', require('./reviewRoutes'));
router.use('/reservations', require('./reservationRoutes'));
router.use('/fines', require('./fineRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/chat', require('./chatRoutes'));

module.exports = router;
