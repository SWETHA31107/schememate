const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, getRecommendations);

module.exports = router;
