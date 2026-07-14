const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { updateProfile, updatePassword, getAllUsers, updateUserRole, deactivateUser, deleteMe, getWishlist } = require('../controllers/userController');

router.get('/wishlist', protect, getWishlist);
router.get('/', protect, authorize('admin', 'librarian'), getAllUsers);
router.put('/me', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.delete('/me', protect, deleteMe);

// Admin only routes
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/:id', protect, authorize('admin'), deactivateUser);

module.exports = router;
