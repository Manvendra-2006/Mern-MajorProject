const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

router.use(authenticateToken);

router.get('/student/dashboard', authorizeRoles('student'), analyticsController.getStudentDashboard);
router.get('/teacher/dashboard', authorizeRoles('teacher', 'admin'), analyticsController.getTeacherDashboard);
router.get('/admin/dashboard', authorizeRoles('admin'), analyticsController.getAdminDashboard);

module.exports = router;
