const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Metrics
router.get('/dashboard', analyticsController.getAdminDashboard);

// User management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.toggleUserStatus);

// Moderation
router.patch('/challenges/:id/moderate', adminController.moderateChallenge);

module.exports = router;
