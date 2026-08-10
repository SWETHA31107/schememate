const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, getAllFeedback, deleteFeedback } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getAllUsers);
router.get('/feedback', protect, admin, getAllFeedback);
router.delete('/feedback/:id', protect, admin, deleteFeedback);

module.exports = router;
