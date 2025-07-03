const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Routes
router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/active-users', analyticsController.getMostActiveUsers);
router.get('/popular-tags', analyticsController.getMostUsedTags);
router.get('/notes-per-day', analyticsController.getNotesPerDay);

module.exports = router;