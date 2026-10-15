const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challenge.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { challengeSchema } = require('../validators/challenge.validator');

// Public / student endpoints
router.get('/categories', challengeController.getCategories);
router.get('/', optionalAuth, challengeController.getAllChallenges);
router.get('/:id', optionalAuth, challengeController.getChallengeById);

// Teacher & Admin endpoints
router.post(
  '/',
  authenticateToken,
  authorizeRoles('teacher', 'admin'),
  validate(challengeSchema),
  challengeController.createChallenge
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('teacher', 'admin'),
  validate(challengeSchema.partial()),
  challengeController.updateChallenge
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('teacher', 'admin'),
  challengeController.deleteChallenge
);

module.exports = router;
