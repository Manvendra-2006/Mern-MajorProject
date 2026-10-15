const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');
const { authenticateToken } = require('../middleware/auth.middleware');
const { sendSuccess, sendError } = require('../utils/response');

router.use(authenticateToken);

router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const ledger = await PointsTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return sendSuccess(res, {
      user,
      pointsHistory: ledger,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    const { name, schoolOrCollege, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (schoolOrCollege !== undefined) user.schoolOrCollege = schoolOrCollege.trim();
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
