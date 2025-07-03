const analyticsService = require('../services/analytics.service');

const analyticsController = {
  async getMostActiveUsers(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const users = await analyticsService.getMostActiveUsers(limit);
      res.json({ users });
    } catch (error) {
      next(error);
    }
  },

  async getMostUsedTags(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const tags = await analyticsService.getMostUsedTags(limit);
      res.json({ tags });
    } catch (error) {
      next(error);
    }
  },

  async getNotesPerDay(req, res, next) {
    try {
      const { days = 7 } = req.query;
      const data = await analyticsService.getNotesPerDay(days);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  },

  async getDashboardStats(req, res, next) {
    try {
      const stats = await analyticsService.getDashboardStats(req.user._id, req.user.role);
      res.json({ stats });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = analyticsController;