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
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
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
  },

  async updateProfile(userId, updateData) {
    // Check if email is being updated and if it already exists
    if (updateData.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    // Check if username is being updated and if it already exists
    if (updateData.username) {
      const existingUser = await User.findOne({ 
        username: updateData.username, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        throw new Error('Username already exists');
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
};

module.exports = authService;