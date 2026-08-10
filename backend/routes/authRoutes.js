const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, verifyOTP, resendOTP, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
