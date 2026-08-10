const Feedback = require('../models/Feedback');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Public
const submitFeedback = async (req, res) => {
  try {
    const { email, message, rating } = req.body;
    
    if (!email || !message || !rating) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const feedback = await Feedback.create({
      email,
      message,
      rating: Number(rating)
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Admin
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Admin
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json({ message: 'Feedback removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
    submitFeedback,
    getFeedbacks,
    deleteFeedback
};
