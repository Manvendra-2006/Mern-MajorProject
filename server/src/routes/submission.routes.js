const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  submitChallengeSchema,
  reviewSubmissionSchema,
} = require('../validators/submission.validator');

// All submission routes require authentication
router.use(authenticateToken);

// Student endpoints
router.post(
  '/',
  authorizeRoles('student'),
  validate(submitChallengeSchema),
  submissionController.submitChallenge
);

router.get('/my', authorizeRoles('student'), submissionController.getMySubmissions);

// Teacher & Admin review endpoints
router.get(
  '/review',
  authorizeRoles('teacher', 'admin'),
  submissionController.getSubmissionsForReview
);

router.put(
  '/:id/review',
  authorizeRoles('teacher', 'admin'),
  validate(reviewSubmissionSchema),
  submissionController.reviewSubmission
);

module.exports = router;
