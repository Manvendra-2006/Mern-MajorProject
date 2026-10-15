const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { quizSchema, quizSubmissionSchema } = require('../validators/quiz.validator');

// Catalog
router.get('/', optionalAuth, quizController.getAllQuizzes);

// Student Quiz Attempt Routes
router.get('/:id/attempt', authenticateToken, authorizeRoles('student'), quizController.getQuizForAttempt);
router.post(
  '/:id/attempt',
  authenticateToken,
  authorizeRoles('student'),
  validate(quizSubmissionSchema),
  quizController.submitQuizAttempt
);
router.get('/attempts/my', authenticateToken, authorizeRoles('student'), quizController.getStudentAttempts);

// Teacher & Admin Management
router.post(
  '/',
  authenticateToken,
  authorizeRoles('teacher', 'admin'),
  validate(quizSchema),
  quizController.createQuiz
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('teacher', 'admin'),
  validate(quizSchema.partial()),
  quizController.updateQuiz
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('teacher', 'admin'),
  quizController.deleteQuiz
);

module.exports = router;
