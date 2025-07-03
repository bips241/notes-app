const User = require('../models/user.model');
const { generateToken } = require('../utils/generateToken');
const { validationResult } = require('express-validator');

const authService = {
  async register(userData) {
    const { username, email, password, firstName, lastName, role = 'user' } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role
    });

    await user.save();
    
    // Generate token
    const token = generateToken({ userId: user._id, role: user.role });
    
    return { user, token };
  },

  async login(email, password) {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials or account deactivated');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken({ userId: user._id, role: user.role });
    
    return { user, token };
  },

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
};

module.exports = authService;