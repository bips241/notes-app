const userService = require('../services/user.service');
const { validationResult } = require('express-validator');

const userController = {
  async getAllUsers(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const options = { page, limit, search };
      
      const result = await userService.getAllUsers(options);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const user = await userService.updateUser(req.params.id, req.body);
      
      res.json({
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  },

  async deactivateUser(req, res, next) {
    try {
      const result = await userService.deactivateUser(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async activateUser(req, res, next) {
    try {
      const result = await userService.activateUser(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUserByEmail(req, res, next) {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({
          message: 'Email parameter is required'
        });
      }
      
      const user = await userService.getUserByEmail(email);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  async addSharingRestriction(req, res, next) {
    try {
      const { userId } = req.params;
      const { restrictedUserId } = req.body;

      if (!restrictedUserId) {
        return res.status(400).json({
          message: 'Restricted user ID is required'
        });
      }

      const result = await userService.addSharingRestriction(userId, restrictedUserId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async removeSharingRestriction(req, res, next) {
    try {
      const { userId, restrictedUserId } = req.params;
      const result = await userService.removeSharingRestriction(userId, restrictedUserId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getSharingRestrictions(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await userService.getSharingRestrictions(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;