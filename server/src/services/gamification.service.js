const User = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const QuizAttempt = require('../models/QuizAttempt');

/**
 * Calculates level from total experience points.
 * Level 1: 0 - 99 XP
 * Level 2: 100 - 399 XP
 * Level 3: 400 - 899 XP
 * Level 4: 900 - 1599 XP
 * Level 5: 1600 - 2499 XP
 */
const calculateLevel = (xp) => {
  if (!xp || xp < 100) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

/**
 * Calculate XP required to reach the next level
 */
const getNextLevelXP = (currentLevel) => {
  return currentLevel * currentLevel * 100;
};

/**
 * Calculate XP threshold for current level base
 */
const getCurrentLevelBaseXP = (currentLevel) => {
  if (currentLevel <= 1) return 0;
  const prevLevel = currentLevel - 1;
  return prevLevel * prevLevel * 100;
};

/**
 * Atomically awards points and XP with duplicate transaction safeguards.
 */
const awardPoints = async ({
  userId,
  amount,
  xpAmount,
  type,
  referenceModel,
  referenceId,
  description,
}) => {
  // 1. Idempotency check: verify if points have already been awarded for this transaction
  const existingTx = await PointsTransaction.findOne({
    user: userId,
    type,
    referenceId,
  });

  if (existingTx) {
    const currentUser = await User.findById(userId);
    return {
      awarded: false,
      reason: 'DUPLICATE_REWARD',
      message: 'Points have already been awarded for this activity.',
      points: currentUser.totalPoints,
      level: currentUser.level,
      xp: currentUser.experiencePoints,
      newBadges: [],
    };
  }

  // 2. Fetch user to calculate new level
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for point award');
  }

  const newTotalPoints = user.totalPoints + amount;
  const newXP = user.experiencePoints + (xpAmount || amount);
  const newLevel = calculateLevel(newXP);

  // 3. Create Points Transaction record
  const transaction = new PointsTransaction({
    user: userId,
    amount,
    type,
    referenceModel,
    referenceId,
    balanceAfter: newTotalPoints,
    description,
  });
  await transaction.save();

  // 4. Update user document
  user.totalPoints = newTotalPoints;
  user.experiencePoints = newXP;
  user.level = newLevel;
  await user.save();

  // 5. Evaluate and award badges
  const newBadges = await checkAndAwardBadges(userId);

  return {
    awarded: true,
    pointsAdded: amount,
    xpAdded: xpAmount || amount,
    totalPoints: newTotalPoints,
    experiencePoints: newXP,
    level: newLevel,
    newBadges,
  };
};

/**
 * Evaluates student progress against badge criteria and awards unearned badges.
 */
const checkAndAwardBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.role !== 'student') return [];

  // Get currently earned badges
  const earnedUserBadges = await UserBadge.find({ user: userId }).select('badge');
  const earnedBadgeIds = new Set(earnedUserBadges.map((ub) => ub.badge.toString()));

  // Get all active badges
  const allBadges = await Badge.find();
  const newlyAwardedBadges = [];

  // Pre-calculate user metrics
  const approvedSubmissions = await ChallengeSubmission.find({
    student: userId,
    status: 'approved',
  }).populate('challenge', 'category');

  const passedAttempts = await QuizAttempt.find({
    student: userId,
    passed: true,
  });

  const challengeCount = approvedSubmissions.length;
  const quizCount = passedAttempts.length;

  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge._id.toString())) {
      continue; // Already earned
    }

    let isEligible = false;

    switch (badge.code) {
      case 'FIRST_CHALLENGE':
        if (challengeCount >= 1) isEligible = true;
        break;

      case 'ECO_LEARNER':
        if (quizCount >= 1) isEligible = true;
        break;

      case 'WATER_SAVER': {
        const waterCount = approvedSubmissions.filter(
          (s) => s.challenge && s.challenge.category === 'Water Conservation'
        ).length;
        if (waterCount >= 1) isEligible = true;
        break;
      }

      case 'WASTE_WARRIOR': {
        const wasteCount = approvedSubmissions.filter(
          (s) => s.challenge && s.challenge.category === 'Waste Management'
        ).length;
        if (wasteCount >= 1) isEligible = true;
        break;
      }

      case 'QUIZ_MASTER':
        if (quizCount >= 3) isEligible = true;
        break;

      case 'CONSISTENCY_CHAMPION':
        if (challengeCount >= 3 || user.totalPoints >= 300) isEligible = true;
        break;

      default:
        // Generic criteria evaluation
        if (badge.criteria) {
          if (badge.criteria.type === 'CHALLENGE_COUNT' && challengeCount >= badge.criteria.threshold) {
            isEligible = true;
          } else if (badge.criteria.type === 'QUIZ_COUNT' && quizCount >= badge.criteria.threshold) {
            isEligible = true;
          } else if (badge.criteria.type === 'TOTAL_POINTS' && user.totalPoints >= badge.criteria.threshold) {
            isEligible = true;
          }
        }
        break;
    }

    if (isEligible) {
      try {
        const userBadge = new UserBadge({
          user: userId,
          badge: badge._id,
        });
        await userBadge.save();
        newlyAwardedBadges.push(badge);
      } catch (err) {
        // Unique constraint prevents duplicate awards in race conditions
        console.warn(`Badge ${badge.code} already awarded or concurrent award avoided.`);
      }
    }
  }

  return newlyAwardedBadges;
};

module.exports = {
  calculateLevel,
  getNextLevelXP,
  getCurrentLevelBaseXP,
  awardPoints,
  checkAndAwardBadges,
};
