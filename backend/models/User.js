const mongoose = require('./db');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: Date },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  community: { type: String },
  income: { type: Number },
  jobType: { type: String },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },
  state: { type: String },
  financialGoals: [{ type: String }],
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving (Mongoose 9.x — no next() callback)
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
