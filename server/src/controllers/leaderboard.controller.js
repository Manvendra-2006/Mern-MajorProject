const User = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');
const UserBadge = require('../models/UserBadge');
const { sendSuccess } = require('../utils/response');

const getLeaderboard = async (req, res, next) => {
  try {
    const { period = 'all_time', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    if (period === 'weekly' || period === 'monthly') {
      const days = period === 'weekly' ? 7 : 30;
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);

      const pipeline = [
        {
          $match: {
            createdAt: { $gte: sinceDate },
          },
        },
        {
          $group: {
            _id: '$user',
            periodPoints: { $sum: '$amount' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $match: {
            'user.role': 'student',
            'user.isActive': true,
          },
        },
        { $sort: { periodPoints: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $project: {
            _id: '$user._id',
            name: '$user.name',
            schoolOrCollege: '$user.schoolOrCollege',
            level: '$user.level',
            avatar: '$user.avatar',
            points: '$periodPoints',
            allTimePoints: '$user.totalPoints',
          },
        },
      ];

      const results = await PointsTransaction.aggregate(pipeline);

      // Total distinct users in this period
      const countPipeline = [
        { $match: { createdAt: { $gte: sinceDate } } },
        { $group: { _id: '$user' } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: { 'user.role': 'student', 'user.isActive': true } },
        { $count: 'total' },
      ];
      const countRes = await PointsTransaction.aggregate(countPipeline);
      const total = countRes[0]?.total || 0;

      // Attach badges and rank
      const userIds = results.map((r) => r._id);
      const userBadges = await UserBadge.find({ user: { $in: userIds } }).populate('badge', 'name icon');

      const badgeMap = new Map();
      userBadges.forEach((ub) => {
        const uId = ub.user.toString();
        if (!badgeMap.has(uId)) badgeMap.set(uId, []);
        badgeMap.get(uId).push(ub.badge);
      });

      const formatted = results.map((r, idx) => ({
        rank: skip + idx + 1,
        id: r._id,
        name: r.name,
        schoolOrCollege: r.schoolOrCollege,
        level: r.level,
        avatar: r.avatar,
        points: r.points,
        allTimePoints: r.allTimePoints,
        badges: badgeMap.get(r._id.toString()) || [],
      }));

      return sendSuccess(res, formatted, `${period} leaderboard retrieved`, 200, {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum,
        period,
      });
    }

    // Default: All-Time Leaderboard
    const filter = { role: 'student', isActive: true };
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name schoolOrCollege totalPoints level avatar')
        .sort({ totalPoints: -1, experiencePoints: -1, createdAt: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    const userIds = users.map((u) => u._id);
    const userBadges = await UserBadge.find({ user: { $in: userIds } }).populate('badge', 'name icon');

    const badgeMap = new Map();
    userBadges.forEach((ub) => {
      const uId = ub.user.toString();
      if (!badgeMap.has(uId)) badgeMap.set(uId, []);
      badgeMap.get(uId).push(ub.badge);
    });

    const formatted = users.map((u, idx) => ({
      rank: skip + idx + 1,
      id: u._id,
      name: u.name,
      schoolOrCollege: u.schoolOrCollege,
      level: u.level,
      avatar: u.avatar,
      points: u.totalPoints,
      allTimePoints: u.totalPoints,
      badges: badgeMap.get(u._id.toString()) || [],
    }));

    return sendSuccess(res, formatted, 'All-time leaderboard retrieved', 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
      period: 'all_time',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard };
