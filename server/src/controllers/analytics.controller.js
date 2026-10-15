const User = require('../models/User');
const { Challenge } = require('../models/Challenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const PointsTransaction = require('../models/PointsTransaction');
const UserBadge = require('../models/UserBadge');
const ActivityLog = require('../models/ActivityLog');
const { getNextLevelXP, getCurrentLevelBaseXP } = require('../services/gamification.service');
const { sendSuccess } = require('../utils/response');

/**
 * Real student metrics aggregated from database
 */
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const user = await User.findById(studentId);

    // 1. Challenges completed count
    const [challengesCompletedCount, totalAvailableChallenges] = await Promise.all([
      ChallengeSubmission.countDocuments({ student: studentId, status: 'approved' }),
      Challenge.countDocuments({ isActive: true, isApprovedByAdmin: true }),
    ]);

    // 2. Quiz attempts & average score
    const quizStats = await QuizAttempt.aggregate([
      { $match: { student: studentId } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' },
          totalAttempts: { $sum: 1 },
          passedAttempts: {
            $sum: { $cond: [{ $eq: ['$passed', true] }, 1, 0] },
          },
        },
      },
    ]);

    const avgQuizScore = quizStats.length > 0 ? Math.round(quizStats[0].avgScore) : 0;
    const totalQuizAttempts = quizStats.length > 0 ? quizStats[0].totalAttempts : 0;

    // 3. Earned badges
    const userBadges = await UserBadge.find({ user: studentId })
      .populate('badge')
      .sort({ earnedAt: -1 })
      .lean();

    // 4. Weekly environmental activity (last 7 days points)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyTransactions = await PointsTransaction.aggregate([
      {
        $match: {
          user: studentId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          pointsEarned: { $sum: '$amount' },
          actionsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format full 7-day array
    const weeklyActivity = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const found = weeklyTransactions.find((w) => w._id === dateStr);
      weeklyActivity.push({
        date: dateStr,
        day: dayName,
        points: found ? found.pointsEarned : 0,
        actions: found ? found.actionsCount : 0,
      });
    }

    // 5. Recent points ledger transactions & activity
    const recentActivities = await PointsTransaction.find({ user: studentId })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // 6. Level progress
    const nextLevelXP = getNextLevelXP(user.level);
    const currentBaseXP = getCurrentLevelBaseXP(user.level);
    const xpTowardsNext = Math.max(0, user.experiencePoints - currentBaseXP);
    const xpNeededForNext = Math.max(1, nextLevelXP - currentBaseXP);
    const levelProgress = Math.min(100, Math.round((xpTowardsNext / xpNeededForNext) * 100));

    // 7. Recommended challenges (active challenges student has not yet completed)
    const completedSubmissions = await ChallengeSubmission.find({
      student: studentId,
      status: { $in: ['approved', 'pending'] },
    }).select('challenge');
    const excludedIds = completedSubmissions.map((s) => s.challenge);

    const recommendedChallenges = await Challenge.find({
      _id: { $nin: excludedIds },
      isActive: true,
      isApprovedByAdmin: true,
    })
      .sort({ pointsReward: -1 })
      .limit(3)
      .lean();

    return sendSuccess(res, {
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        schoolOrCollege: user.schoolOrCollege,
        role: user.role,
        totalPoints: user.totalPoints,
        experiencePoints: user.experiencePoints,
        level: user.level,
        nextLevelXP,
        currentBaseXP,
        levelProgress,
      },
      metrics: {
        totalPoints: user.totalPoints,
        experiencePoints: user.experiencePoints,
        level: user.level,
        challengesCompleted: challengesCompletedCount,
        totalAvailableChallenges,
        avgQuizScore,
        totalQuizAttempts,
        badgesCount: userBadges.length,
      },
      badges: userBadges.map((ub) => ub.badge),
      weeklyActivity,
      recentActivities,
      recommendedChallenges,
    }, 'Student dashboard data retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Real teacher metrics aggregated from database
 */
const getTeacherDashboard = async (req, res, next) => {
  try {
    const teacherId = req.user._id;

    // Active challenges and quizzes created by teacher (or platform wide)
    const [
      totalStudents,
      activeChallengesCount,
      pendingSubmissionsCount,
      totalSubmissionsCount,
      approvedSubmissionsCount,
      quizCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      Challenge.countDocuments({ isActive: true }),
      ChallengeSubmission.countDocuments({ status: 'pending' }),
      ChallengeSubmission.countDocuments(),
      ChallengeSubmission.countDocuments({ status: 'approved' }),
      Quiz.countDocuments({ isActive: true }),
    ]);

    const completionRate = totalSubmissionsCount > 0
      ? Math.round((approvedSubmissionsCount / totalSubmissionsCount) * 100)
      : 0;

    // Submissions by Category
    const categoryBreakdown = await ChallengeSubmission.aggregate([
      {
        $lookup: {
          from: 'challenges',
          localField: 'challenge',
          foreignField: '_id',
          as: 'challengeInfo',
        },
      },
      { $unwind: '$challengeInfo' },
      {
        $group: {
          _id: '$challengeInfo.category',
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent submissions awaiting review
    const recentPendingSubmissions = await ChallengeSubmission.find({ status: 'pending' })
      .populate('challenge', 'title category pointsReward')
      .populate('student', 'name email schoolOrCollege')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Student performance snapshot
    const topStudents = await User.find({ role: 'student', isActive: true })
      .select('name email schoolOrCollege totalPoints level')
      .sort({ totalPoints: -1 })
      .limit(10)
      .lean();

    return sendSuccess(res, {
      metrics: {
        totalStudents,
        activeChallenges: activeChallengesCount,
        pendingSubmissions: pendingSubmissionsCount,
        totalSubmissions: totalSubmissionsCount,
        completionRate,
        totalQuizzes: quizCount,
      },
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c._id,
        totalSubmissions: c.count,
        approved: c.approved,
      })),
      recentPendingSubmissions,
      topStudents,
    }, 'Teacher dashboard data retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Real admin metrics aggregated across platform
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      activeUsers,
      totalChallenges,
      totalQuizzes,
      totalSubmissions,
      approvedSubmissions,
      pointsAggregate,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ isActive: true }),
      Challenge.countDocuments(),
      Quiz.countDocuments(),
      ChallengeSubmission.countDocuments(),
      ChallengeSubmission.countDocuments({ status: 'approved' }),
      PointsTransaction.aggregate([
        { $group: { _id: null, totalPointsDistributed: { $sum: '$amount' } } },
      ]),
      ActivityLog.find()
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Category distribution
    const categoryDistribution = await Challenge.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return sendSuccess(res, {
      metrics: {
        totalUsers,
        totalStudents,
        totalTeachers,
        activeUsers,
        totalChallenges,
        totalQuizzes,
        totalSubmissions,
        approvedSubmissions,
        totalPointsDistributed: pointsAggregate[0]?.totalPointsDistributed || 0,
      },
      categoryDistribution: categoryDistribution.map((c) => ({
        category: c._id,
        challengesCount: c.count,
      })),
      recentActivity,
    }, 'Admin dashboard metrics retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentDashboard,
  getTeacherDashboard,
  getAdminDashboard,
};
