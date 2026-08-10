const User = require('../models/User');
const Scheme = require('../models/Scheme');
const Feedback = require('../models/Feedback');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const verifiedUsers = await User.countDocuments({ role: 'user', isVerified: true });
    
    // Total schemes
    const totalSchemes = await Scheme.countDocuments();
    const totalFeedback = await Feedback.countDocuments();
    
    // Schemes by category
    const categoryStats = await Scheme.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalUsers,
      verifiedUsers,
      totalSchemes,
      totalFeedback,
      categoryStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password -otp');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    await feedback.deleteOne();
    res.json({ message: 'Feedback removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllFeedback,
  deleteFeedback
};
