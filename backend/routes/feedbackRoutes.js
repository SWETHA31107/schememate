const express = require('express');
const router = express.Router();
const { 
  submitFeedback,
  getFeedbacks,
  deleteFeedback
} = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to submit
router.post('/', submitFeedback);

// Admin only routes
router.get('/', protect, admin, getFeedbacks);
router.delete('/:id', protect, admin, deleteFeedback);

module.exports = router;
