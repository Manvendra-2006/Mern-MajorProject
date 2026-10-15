const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

router.get('/', optionalAuth, leaderboardController.getLeaderboard);

module.exports = router;
