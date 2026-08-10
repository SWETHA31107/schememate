const Scheme = require('../models/Scheme');

// @desc    Check eligibility for a specific scheme manually
// @route   POST /api/check-eligibility
// @access  Public
const checkEligibility = async (req, res) => {
  try {
    const { schemeId, age, income, jobType } = req.body;

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    let isEligible = true;
    let missingConditions = [];

    if (scheme.eligibility.minAge && age < scheme.eligibility.minAge) {
      isEligible = false;
      missingConditions.push(`Age not matching: Minimum age required is ${scheme.eligibility.minAge}. Your age is ${age}.`);
    }

    if (scheme.eligibility.maxAge && age > scheme.eligibility.maxAge) {
      isEligible = false;
      missingConditions.push(`Age not matching: Maximum age allowed is ${scheme.eligibility.maxAge}. Your age is ${age}.`);
    }

    if (scheme.eligibility.minIncome && income < scheme.eligibility.minIncome) {
      isEligible = false;
      missingConditions.push(`Income criteria not met: Minimum income required is ₹${scheme.eligibility.minIncome.toLocaleString()}. Your income is ₹${income.toLocaleString()}.`);
    }

    if (scheme.eligibility.maxIncome && income > scheme.eligibility.maxIncome) {
      isEligible = false;
      missingConditions.push(`Income criteria not met: Maximum annual income allowed is ₹${scheme.eligibility.maxIncome.toLocaleString()}. Your income is ₹${income.toLocaleString()}.`);
    }

    if (scheme.eligibility.jobType && scheme.eligibility.jobType.length > 0 && !scheme.eligibility.jobType.includes(jobType)) {
      isEligible = false;
      missingConditions.push(`Job type mismatch: You are a '${jobType}', but this requires ${scheme.eligibility.jobType.join(' or ')}.`);
    }

    // Suggested alternatives could involve querying other schemes in same category
    let alternatives = [];
    if (!isEligible) {
        alternatives = await Scheme.find({ 
            category: scheme.category, 
            _id: { $ne: scheme._id } 
        }).limit(2);
    }

    res.json({
      eligible: isEligible,
      missingConditions,
      alternatives
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkEligibility
};
