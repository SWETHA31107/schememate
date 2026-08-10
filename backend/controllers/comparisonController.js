const Scheme = require('../models/Scheme');

// @desc    Compare multiple schemes
// @route   POST /api/compare
// @access  Public
const compareSchemes = async (req, res) => {
  try {
    const { schemeIds } = req.body; // array of scheme IDs (2-4)

    if (!schemeIds || schemeIds.length < 2 || schemeIds.length > 4) {
      return res.status(400).json({ message: 'Please provide between 2 to 4 scheme IDs for comparison' });
    }

    const schemes = await Scheme.find({ _id: { $in: schemeIds } });
    
    // Sort or format data if needed for the frontend table
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  compareSchemes
};
