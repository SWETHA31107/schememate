const mongoose = require('./db');

const feedbackSchema = new mongoose.Schema({
  email: { type: String, required: true },
  message: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
