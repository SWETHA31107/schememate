const Scheme = require('../models/Scheme');
const User = require('../models/User');

// @desc    Get recommended schemes for a user
// @route   POST /api/recommend
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const schemes = await Scheme.find({});
    
    // Scoring Logic: score = (eligibility match * 40%) + (goal match * 30%) + (benefit relevance * 30%)
    const scoredSchemes = schemes.map(scheme => {
      let eligibilityScore = 0;
      let goalMatchScore = 0;
      let relevanceScore = 0;

      // 1. Eligibility Check (Max 40 points)
      let eligibleCriteriaCount = 0;
      let totalCriteria = 0;

      if (scheme.eligibility.minAge) {
        totalCriteria++;
        if (user.age >= scheme.eligibility.minAge) eligibleCriteriaCount++;
      }
      if (scheme.eligibility.maxAge) {
        totalCriteria++;
        if (user.age <= scheme.eligibility.maxAge) eligibleCriteriaCount++;
      }
      if (scheme.eligibility.minIncome) {
        totalCriteria++;
        if (user.income >= scheme.eligibility.minIncome) eligibleCriteriaCount++;
      }
      if (scheme.eligibility.jobType && scheme.eligibility.jobType.length > 0) {
        totalCriteria++;
        if (scheme.eligibility.jobType.includes(user.jobType)) eligibleCriteriaCount++;
      }

      const eligibilityPercentage = totalCriteria === 0 ? 1 : (eligibleCriteriaCount / totalCriteria);
      eligibilityScore = eligibilityPercentage * 40;

      // 2. Goal Match (Max 30 points)
      if (user.financialGoals && user.financialGoals.includes(scheme.category)) {
        goalMatchScore = 30; // Direct category match with user goal
      }

      // 3. Benefit Relevance (Max 30 points)
      // Simple keyword matching from goals to benefits/description
      const combinedText = `${scheme.benefits} ${scheme.description}`.toLowerCase();
      const matchedGoals = user.financialGoals.filter(goal => combinedText.includes(goal.toLowerCase()));
      
      if (user.financialGoals.length > 0) {
        relevanceScore = (matchedGoals.length / user.financialGoals.length) * 30;
      } else {
        relevanceScore = 15; // default if no goals
      }

      const totalScore = Math.round(eligibilityScore + goalMatchScore + relevanceScore);
      
      let reason = 'Based on your profile, this scheme matches well.';
      if (eligibilityPercentage === 1) reason = 'You meet all eligibility criteria for this scheme.';
      if (goalMatchScore === 30) reason = `This scheme directly aligns with your ${scheme.category} goals.`;

      return {
        scheme,
        score: totalScore,
        reason
      };
    });

    // Sort by score descending and return top 5
    const topSchemes = scoredSchemes
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json(topSchemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRecommendations
};
