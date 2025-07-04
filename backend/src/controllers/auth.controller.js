const authService = require('../services/auth.service');
const { validationResult } = require('express-validator');

const authController = {
  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { user, token } = await authService.register(req.body);
      
      res.status(201).json({
        message: 'User created successfully',
        user,
        token
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      
      res.json({
        message: 'Login successful',
        user,
        token
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user._id);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user._id, req.body);
      res.json({ 
        message: 'Profile updated successfully',
        user 
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
