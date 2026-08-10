const express = require('express');
const router = express.Router();
const {
  getSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
  resetSchemes
} = require('../controllers/schemeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getSchemes)
  .post(protect, admin, createScheme);

// Reset must be before /:id to avoid being treated as an ID
router.post('/reset', protect, admin, resetSchemes);

router.route('/:id')
  .get(getSchemeById)
  .put(protect, admin, updateScheme)
  .delete(protect, admin, deleteScheme);

module.exports = router;
