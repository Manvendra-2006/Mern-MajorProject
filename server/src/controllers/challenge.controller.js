const { Challenge, challengeCategories } = require('../models/Challenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess, sendError } = require('../utils/response');

const getCategories = (req, res) => {
  return sendSuccess(res, challengeCategories, 'Categories retrieved');
};

const getAllChallenges = async (req, res, next) => {
  try {
    const { category, difficulty, search, page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { isActive: true };

    // Unless user is admin, only show approved challenges
    if (!req.user || req.user.role !== 'admin') {
      filter.isApprovedByAdmin = true;
    }

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [challenges, total] = await Promise.all([
      Challenge.find(filter)
        .populate('creator', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Challenge.countDocuments(filter),
    ]);

    // If student is authenticated, attach their submission status to each challenge
    if (req.user && req.user.role === 'student') {
      const challengeIds = challenges.map((c) => c._id);
      const studentSubmissions = await ChallengeSubmission.find({
        student: req.user._id,
        challenge: { $in: challengeIds },
      }).lean();

      const subMap = new Map();
      studentSubmissions.forEach((s) => subMap.set(s.challenge.toString(), s));

      challenges.forEach((c) => {
        const sub = subMap.get(c._id.toString());
        c.userSubmission = sub
          ? {
              id: sub._id,
              status: sub.status,
              pointsAwarded: sub.pointsAwarded,
              reviewedAt: sub.reviewedAt,
              feedback: sub.feedback,
            }
          : null;
      });
    }

    return sendSuccess(res, challenges, 'Challenges retrieved successfully', 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

const getChallengeById = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creator', 'name email role schoolOrCollege')
      .lean();

    if (!challenge || !challenge.isActive) {
      return sendError(res, 'Challenge not found', 404);
    }

    // Attach user submission if student
    if (req.user && req.user.role === 'student') {
      const submission = await ChallengeSubmission.findOne({
        challenge: challenge._id,
        student: req.user._id,
      }).populate('reviewedBy', 'name');

      challenge.userSubmission = submission;
    }

    return sendSuccess(res, challenge, 'Challenge details retrieved');
  } catch (error) {
    next(error);
  }
};

const createChallenge = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      pointsReward,
      xpReward,
      instructions,
      startDate,
      endDate,
      imageUrl,
      submissionRequirements,
    } = req.body;

    const newChallenge = new Challenge({
      title,
      description,
      category,
      difficulty,
      pointsReward,
      xpReward: xpReward || pointsReward,
      instructions,
      startDate: startDate || null,
      endDate: endDate || null,
      imageUrl: imageUrl || '',
      submissionRequirements,
      isApprovedByAdmin: req.user.role === 'admin' ? true : true, // Auto-approve or flag
      creator: req.user._id,
    });

    await newChallenge.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'CHALLENGE_CREATED',
      details: { challengeId: newChallenge._id, title: newChallenge.title },
      ipAddress: req.ip || '',
    });

    return sendSuccess(res, newChallenge, 'Challenge created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return sendError(res, 'Challenge not found', 404);
    }

    // Check permission: only creator or admin
    if (req.user.role !== 'admin' && challenge.creator.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to update this challenge', 403);
    }

    Object.assign(challenge, req.body);
    await challenge.save();

    return sendSuccess(res, challenge, 'Challenge updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return sendError(res, 'Challenge not found', 404);
    }

    if (req.user.role !== 'admin' && challenge.creator.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to delete this challenge', 403);
    }

    challenge.isActive = false;
    await challenge.save();

    return sendSuccess(res, null, 'Challenge deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getAllChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
};
