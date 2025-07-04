const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminOnly);

// Routes
router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/dashboard-stats', analyticsController.getDashboardStats);
router.get('/active-users', analyticsController.getMostActiveUsers);
router.get('/most-active-users', analyticsController.getMostActiveUsers);
router.get('/popular-tags', analyticsController.getMostUsedTags);
router.get('/most-used-tags', analyticsController.getMostUsedTags);
router.get('/notes-per-day', analyticsController.getNotesPerDay);

module.exports = router;