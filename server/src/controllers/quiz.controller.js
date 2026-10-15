const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');
const PointsTransaction = require('../models/PointsTransaction');
const { awardPoints } = require('../services/gamification.service');
const { sendSuccess, sendError } = require('../utils/response');

const getAllQuizzes = async (req, res, next) => {
  try {
    const { topic, difficulty, search, page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { isActive: true };
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Do NOT project questions.correctOptionIndex or questions.explanation in catalog listing
    const [quizzes, total] = await Promise.all([
      Quiz.find(filter)
        .select('-questions.correctOptionIndex -questions.explanation')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Quiz.countDocuments(filter),
    ]);

    // If student, attach attempt summary
    if (req.user && req.user.role === 'student') {
      const quizIds = quizzes.map((q) => q._id);
      const studentAttempts = await QuizAttempt.find({
        student: req.user._id,
        quiz: { $in: quizIds },
      }).lean();

      const attemptMap = new Map();
      studentAttempts.forEach((att) => {
        const qId = att.quiz.toString();
        const existing = attemptMap.get(qId) || {
          attemptsCount: 0,
          hasPassed: false,
          highestScore: 0,
        };
        existing.attemptsCount += 1;
        if (att.passed) existing.hasPassed = true;
        if (att.score > existing.highestScore) existing.highestScore = att.score;
        attemptMap.set(qId, existing);
      });

      quizzes.forEach((q) => {
        q.questionCount = q.questions?.length || 0;
        q.userStats = attemptMap.get(q._id.toString()) || {
          attemptsCount: 0,
          hasPassed: false,
          highestScore: 0,
        };
        // Remove question bodies from list view for lightweight transfer
        delete q.questions;
      });
    } else {
      quizzes.forEach((q) => {
        q.questionCount = q.questions?.length || 0;
        delete q.questions;
      });
    }

    return sendSuccess(res, quizzes, 'Quizzes retrieved successfully', 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

const getQuizForAttempt = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .select('-questions.correctOptionIndex -questions.explanation')
      .populate('createdBy', 'name')
      .lean();

    if (!quiz || !quiz.isActive) {
      return sendError(res, 'Quiz not found or is currently unavailable', 404);
    }

    return sendSuccess(res, quiz, 'Quiz loaded for attempt');
  } catch (error) {
    next(error);
  }
};

const submitQuizAttempt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers, timeSpentSeconds = 0 } = req.body;
    const studentId = req.user._id;

    const quiz = await Quiz.findById(id);
    if (!quiz || !quiz.isActive) {
      return sendError(res, 'Quiz not found', 404);
    }

    const questionMap = new Map();
    quiz.questions.forEach((q) => questionMap.set(q._id.toString(), q));

    let correctCount = 0;
    const gradedAnswers = [];
    const explanations = [];

    answers.forEach((ans) => {
      const question = questionMap.get(ans.questionId);
      if (question) {
        const isCorrect = question.correctOptionIndex === ans.selectedOptionIndex;
        if (isCorrect) correctCount += 1;

        gradedAnswers.push({
          questionId: question._id,
          selectedOptionIndex: ans.selectedOptionIndex,
          isCorrect,
        });

        explanations.push({
          questionId: question._id,
          questionText: question.questionText,
          options: question.options,
          selectedOptionIndex: ans.selectedOptionIndex,
          correctOptionIndex: question.correctOptionIndex,
          isCorrect,
          explanation: question.explanation,
        });
      }
    });

    const totalQuestions = quiz.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= quiz.passingScore;

    // Check if user has already claimed rewards for passing this quiz earlier
    const previousPassedReward = await PointsTransaction.findOne({
      user: studentId,
      type: 'QUIZ_REWARD',
      referenceId: quiz._id,
    });

    let pointsAwarded = 0;
    let gamificationResult = null;

    if (passed && !previousPassedReward) {
      pointsAwarded = quiz.pointsReward;
      gamificationResult = await awardPoints({
        userId: studentId,
        amount: quiz.pointsReward,
        xpAmount: quiz.xpReward || quiz.pointsReward,
        type: 'QUIZ_REWARD',
        referenceModel: 'Quiz',
        referenceId: quiz._id,
        description: `Passed quiz: ${quiz.title} (${scorePercentage}%)`,
      });
    }

    // Save attempt in MongoDB
    const attempt = new QuizAttempt({
      quiz: quiz._id,
      student: studentId,
      answers: gradedAnswers,
      score: scorePercentage,
      correctCount,
      totalQuestions,
      passed,
      pointsAwarded,
      timeSpentSeconds,
    });
    await attempt.save();

    await ActivityLog.create({
      user: studentId,
      action: 'QUIZ_ATTEMPTED',
      details: {
        quizId: quiz._id,
        title: quiz.title,
        score: scorePercentage,
        passed,
        pointsAwarded,
      },
      ipAddress: req.ip || '',
    });

    return sendSuccess(res, {
      attemptId: attempt._id,
      quizTitle: quiz.title,
      score: scorePercentage,
      correctCount,
      totalQuestions,
      passingScore: quiz.passingScore,
      passed,
      pointsAwarded,
      alreadyRewarded: Boolean(previousPassedReward),
      explanations,
      gamification: gamificationResult,
    }, passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Keep learning and try again!');
  } catch (error) {
    next(error);
  }
};

const getStudentAttempts = async (req, res, next) => {
  try {
    const { quizId, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { student: req.user._id };
    if (quizId) filter.quiz = quizId;

    const [attempts, total] = await Promise.all([
      QuizAttempt.find(filter)
        .populate('quiz', 'title topic difficulty passingScore pointsReward')
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      QuizAttempt.countDocuments(filter),
    ]);

    return sendSuccess(res, attempts, 'Quiz attempts retrieved', 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const {
      title,
      description,
      topic,
      difficulty,
      timeLimitMinutes,
      passingScore,
      pointsReward,
      xpReward,
      questions,
    } = req.body;

    const newQuiz = new Quiz({
      title,
      description,
      topic,
      difficulty,
      timeLimitMinutes,
      passingScore,
      pointsReward,
      xpReward: xpReward || pointsReward,
      questions,
      createdBy: req.user._id,
    });

    await newQuiz.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'QUIZ_CREATED',
      details: { quizId: newQuiz._id, title: newQuiz.title },
      ipAddress: req.ip || '',
    });

    return sendSuccess(res, newQuiz, 'Quiz created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    if (req.user.role !== 'admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to update this quiz', 403);
    }

    Object.assign(quiz, req.body);
    await quiz.save();

    return sendSuccess(res, quiz, 'Quiz updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    if (req.user.role !== 'admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to delete this quiz', 403);
    }

    quiz.isActive = false;
    await quiz.save();

    return sendSuccess(res, null, 'Quiz deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllQuizzes,
  getQuizForAttempt,
  submitQuizAttempt,
  getStudentAttempts,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};
