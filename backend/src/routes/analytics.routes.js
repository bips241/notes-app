const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

const router = express.Router();

// Dashboard stats - admin only for admin stats, regular users get their own stats
router.get('/dashboard', authMiddleware, analyticsController.getDashboardStats);
router.get('/dashboard-stats', authMiddleware, adminOnly, analyticsController.getDashboardStats);

// Admin-only routes
router.get('/active-users', authMiddleware, adminOnly, analyticsController.getMostActiveUsers);
router.get('/most-active-users', authMiddleware, adminOnly, analyticsController.getMostActiveUsers);
router.get('/popular-tags', authMiddleware, adminOnly, analyticsController.getMostUsedTags);
router.get('/most-used-tags', authMiddleware, adminOnly, analyticsController.getMostUsedTags);
router.get('/notes-per-day', authMiddleware, adminOnly, analyticsController.getNotesPerDay);

module.exports = router;