const express = require('express');
const router = express.Router();
const { compareSchemes } = require('../controllers/comparisonController');

router.post('/', compareSchemes);

module.exports = router;
