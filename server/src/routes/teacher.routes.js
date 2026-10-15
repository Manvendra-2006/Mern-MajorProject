const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

router.use(authenticateToken);
router.use(authorizeRoles('teacher', 'admin'));

router.get('/dashboard', analyticsController.getTeacherDashboard);

module.exports = router;
