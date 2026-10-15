const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badge.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

router.get('/', optionalAuth, badgeController.getAllBadges);
router.get('/my', authenticateToken, authorizeRoles('student'), badgeController.getMyBadges);

module.exports = router;
