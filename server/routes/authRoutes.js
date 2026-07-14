const router = require('express').Router();
const passport = require('passport');
const { protect } = require('../middleware/auth');
const {
    register, login, googleCallback,
    getMe, forgotPassword, resetPassword, refreshToken,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

// Google OAuth
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/?error=auth_failed' }),
    googleCallback
);

router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshToken);

module.exports = router;
