const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { name, email, mobile, password, dob, gender, community, income, jobType, maritalStatus, state, age, financialGoals } = req.body;

  const emailRegex = /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,63}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  const isPasswordValid = 
    password.length >= 8 && 
    password.length <= 64 &&
    /[A-Z]/.test(password) && 
    /[a-z]/.test(password) && 
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
    !/\s/.test(password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Password does not meet complexity requirements.' });
  }

  try {
    let userExists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists using this email or mobile. Please login.' });
    }

    const user = await User.create({
      name,
      email,
      mobile,
      password,
      dob,
      gender,
      community,
      income,
      jobType,
      maritalStatus,
      state,
      age,
      financialGoals,
      isVerified: true
    });

    if (user) {
      res.status(201).json({ 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        mobile: user.mobile, 
        token: generateToken(user._id),
        message: 'Registration successful' 
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        age: user.age,
        dob: user.dob,
        gender: user.gender,
        community: user.community,
        income: user.income,
        jobType: user.jobType,
        maritalStatus: user.maritalStatus,
        state: user.state,
        financialGoals: user.financialGoals,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials. Please check your spelling and try again.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.mobile = req.body.mobile || user.mobile;
      user.gender = req.body.gender || user.gender;
      user.community = req.body.community || user.community;
      user.income = req.body.income || user.income;
      user.jobType = req.body.jobType || user.jobType;
      user.maritalStatus = req.body.maritalStatus || user.maritalStatus;
      user.state = req.body.state || user.state;
      user.age = req.body.age !== undefined && req.body.age !== '' ? req.body.age : user.age;
      user.dob = req.body.dob || user.dob;
      user.financialGoals = req.body.financialGoals || user.financialGoals;

      if (req.body.email) {
        const emailRegex = /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,63}$/;
        if (!emailRegex.test(req.body.email)) {
          return res.status(400).json({ message: 'Invalid email format.' });
        }
        user.email = req.body.email;
      }

      if (req.body.password) {
        const password = req.body.password;
        const isPasswordValid = 
          password.length >= 8 && 
          password.length <= 64 &&
          /[A-Z]/.test(password) && 
          /[a-z]/.test(password) && 
          /[0-9]/.test(password) &&
          /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
          !/\s/.test(password);

        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Password does not meet complexity requirements.' });
        }
        user.password = password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        gender: updatedUser.gender,
        community: updatedUser.community,
        income: updatedUser.income,
        jobType: updatedUser.jobType,
        maritalStatus: updatedUser.maritalStatus,
        state: updatedUser.state,
        age: updatedUser.age,
        dob: updatedUser.dob,
        financialGoals: updatedUser.financialGoals,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deprecated OTP routes retained temporarily as empty to prevent immediate endpoint crashing if referenced.
const verifyOTP = async (req, res) => { res.status(400).json({ message: 'OTP flow is deprecated.' }); };
const resendOTP = async (req, res) => { res.status(400).json({ message: 'OTP flow is deprecated.' }); };

const resetPassword = async (req, res) => {
  const { identifier, newPassword } = req.body;
  try {
    const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });
    if (!user) {
      return res.status(404).json({ message: 'Account not found with provided information.' });
    }
    const isPasswordValid = 
      newPassword.length >= 8 && 
      newPassword.length <= 64 &&
      /[A-Z]/.test(newPassword) && 
      /[a-z]/.test(newPassword) && 
      /[0-9]/.test(newPassword) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) &&
      !/\s/.test(newPassword);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Password does not meet complexity rules.' });
    }
    
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password has been efficiently reset.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, verifyOTP, loginUser, resendOTP, getUserProfile, updateUserProfile, resetPassword };
