const ChallengeSubmission = require('../models/ChallengeSubmission');
const { Challenge } = require('../models/Challenge');
const ActivityLog = require('../models/ActivityLog');
const { awardPoints } = require('../services/gamification.service');
const { sendSuccess, sendError } = require('../utils/response');

const submitChallenge = async (req, res, next) => {
  try {
    const { challengeId, proofText, proofFileUrl } = req.body;
    const studentId = req.user._id;

    // Verify challenge exists and is active
    const challenge = await Challenge.findById(challengeId);
    if (!challenge || !challenge.isActive) {
      return sendError(res, 'Challenge not found or no longer active', 404);
    }

    // Check existing submission
    let submission = await ChallengeSubmission.findOne({
      challenge: challengeId,
      student: studentId,
    });

    if (submission) {
      if (submission.status === 'approved') {
        return sendError(res, 'You have already completed and received rewards for this challenge.', 400);
      }
      if (submission.status === 'pending') {
        // Update existing pending submission
        submission.proofText = proofText;
        submission.proofFileUrl = proofFileUrl || '';
        await submission.save();
        return sendSuccess(res, submission, 'Submission updated successfully. Awaiting review.');
      }
      if (submission.status === 'rejected') {
        // Resubmit
        submission.proofText = proofText;
        submission.proofFileUrl = proofFileUrl || '';
        submission.status = 'pending';
        submission.feedback = '';
        submission.reviewedBy = null;
        submission.reviewedAt = null;
        await submission.save();
        return sendSuccess(res, submission, 'Resubmission received. Awaiting review.');
      }
    }

    // Create new submission
    submission = new ChallengeSubmission({
      challenge: challengeId,
      student: studentId,
      proofText,
      proofFileUrl: proofFileUrl || '',
      status: 'pending',
    });
    await submission.save();

    await ActivityLog.create({
      user: studentId,
      action: 'CHALLENGE_SUBMITTED',
      details: { challengeId, title: challenge.title },
      ipAddress: req.ip || '',
    });

    return sendSuccess(res, submission, 'Challenge submitted successfully! Awaiting teacher review.', 201);
  } catch (error) {
    next(error);
  }
};

const getMySubmissions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { student: req.user._id };
    if (status) filter.status = status;

    const [submissions, total] = await Promise.all([
      ChallengeSubmission.find(filter)
        .populate('challenge', 'title category difficulty pointsReward imageUrl')
        .populate('reviewedBy', 'name')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ChallengeSubmission.countDocuments(filter),
    ]);

    return sendSuccess(res, submissions, 'Submissions retrieved', 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

const getSubmissionsForReview = async (req, res, next) => {
  try {
    const { status = 'pending', category, page = 1, limit = 15 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    let submissionsQuery = ChallengeSubmission.find(filter)
      .populate('challenge', 'title category difficulty pointsReward xpReward')
      .populate('student', 'name email schoolOrCollege totalPoints level')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    const submissions = await submissionsQuery.skip(skip).limit(limitNum).lean();
    const total = await ChallengeSubmission.countDocuments(filter);

    return sendSuccess(res, submissions, 'Submissions for review retrieved', 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

const reviewSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;
    const reviewerId = req.user._id;

    const submission = await ChallengeSubmission.findById(id).populate('challenge');
    if (!submission) {
      return sendError(res, 'Submission not found', 404);
    }

    if (submission.status === 'approved') {
      return sendError(res, 'This submission has already been approved and rewarded.', 400);
    }

    submission.status = status;
    submission.feedback = feedback || '';
    submission.reviewedBy = reviewerId;
    submission.reviewedAt = new Date();

    let gamificationResult = null;

    if (status === 'approved') {
      const challenge = submission.challenge;
      submission.pointsAwarded = challenge.pointsReward;

      // Award points & XP with idempotency transaction
      gamificationResult = await awardPoints({
        userId: submission.student,
        amount: challenge.pointsReward,
        xpAmount: challenge.xpReward || challenge.pointsReward,
        type: 'CHALLENGE_REWARD',
        referenceModel: 'Challenge',
        referenceId: challenge._id,
        description: `Completed challenge: ${challenge.title}`,
      });
    }

    await submission.save();

    await ActivityLog.create({
      user: reviewerId,
      action: `CHALLENGE_SUBMISSION_${status.toUpperCase()}`,
      details: {
        submissionId: submission._id,
        studentId: submission.student,
        challengeId: submission.challenge._id,
        status,
      },
      ipAddress: req.ip || '',
    });

    return sendSuccess(res, {
      submission,
      gamification: gamificationResult,
    }, `Submission ${status} successfully.`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitChallenge,
  getMySubmissions,
  getSubmissionsForReview,
  reviewSubmission,
};
