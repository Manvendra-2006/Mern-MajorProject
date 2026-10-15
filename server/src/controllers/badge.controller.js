const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const { sendSuccess } = require('../utils/response');

const getAllBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find().sort({ createdAt: 1 }).lean();

    if (req.user && req.user.role === 'student') {
      const userBadges = await UserBadge.find({ user: req.user._id }).lean();
      const earnedMap = new Map();
      userBadges.forEach((ub) => earnedMap.set(ub.badge.toString(), ub.earnedAt));

      badges.forEach((b) => {
        const earnedAt = earnedMap.get(b._id.toString());
        b.isEarned = Boolean(earnedAt);
        b.earnedAt = earnedAt || null;
      });
    }

    return sendSuccess(res, badges, 'Badges retrieved');
  } catch (error) {
    next(error);
  }
};

const getMyBadges = async (req, res, next) => {
  try {
    const userBadges = await UserBadge.find({ user: req.user._id })
      .populate('badge')
      .sort({ earnedAt: -1 })
      .lean();

    return sendSuccess(res, userBadges, 'User badges retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBadges,
  getMyBadges,
};
