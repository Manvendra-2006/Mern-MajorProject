const User = require('../models/User');
const { Challenge } = require('../models/Challenge');
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess, sendError } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 15 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { schoolOrCollege: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, users, 'Users retrieved', 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Prevent deactivating own account
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'You cannot deactivate your own administrative account.', 400);
    }

    user.isActive = !user.isActive;
    await user.save();

    await ActivityLog.create({
      user: req.user._id,
      action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      details: { targetUserId: user._id, email: user.email },
      ipAddress: req.ip || '',
    });

    return sendSuccess(res, user, `User account ${user.isActive ? 'activated' : 'deactivated'} successfully.`);
  } catch (error) {
    next(error);
  }
};

const moderateChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return sendError(res, 'Challenge not found', 404);
    }

    challenge.isApprovedByAdmin = Boolean(isApproved);
    await challenge.save();

    await ActivityLog.create({
      user: req.user._id,
      action: isApproved ? 'CHALLENGE_APPROVED' : 'CHALLENGE_REJECTED',
      details: { challengeId: challenge._id, title: challenge.title },
      ipAddress: req.ip || '',
    });

    return sendSuccess(res, challenge, `Challenge ${isApproved ? 'approved' : 'moderated'} successfully.`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  toggleUserStatus,
  moderateChallenge,
};
