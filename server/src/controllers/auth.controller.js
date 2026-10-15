const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserBadge = require('../models/UserBadge');
const ActivityLog = require('../models/ActivityLog');
const {
  requestOtp,
  verifyOtp,
  generateToken,
  getAuthCookieOptions,
} = require('../services/auth.service');
const { getNextLevelXP, getCurrentLevelBaseXP } = require('../services/gamification.service');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, schoolOrCollege } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // User created earlier but didn't verify, trigger new OTP
        await requestOtp(normalizedEmail, 'verification');
        return sendSuccess(
          res,
          { email: normalizedEmail, isVerified: false },
          'Account already registered but not verified. A new verification code has been sent.',
          200
        );
      }
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    // Hash password securely with bcrypt
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: normalizedEmail,
      passwordHash,
      role: role || 'student',
      schoolOrCollege: schoolOrCollege || '',
      isVerified: false,
    });
    await newUser.save();

    // Send email OTP
    await requestOtp(normalizedEmail, 'verification');

    return sendSuccess(
      res,
      {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: false,
      },
      'Registration successful. Please enter the 6-digit verification code sent to your email.',
      201
    );
  } catch (error) {
    next(error);
  }
};

const sendVerificationOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Return generic success to avoid email enumeration
      return sendSuccess(res, null, 'If this email is registered, a verification code will be sent.');
    }

    const result = await requestOtp(normalizedEmail, purpose || 'verification');
    return sendSuccess(res, result, 'Verification code sent to your email.');
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return sendError(res, 'Account not found. Please register first.', 404);
    }

    // Verify OTP against hashed store
    await verifyOtp(normalizedEmail, otp);

    user.isVerified = true;
    await user.save();

    // Issue JWT in secure HttpOnly cookie
    const token = generateToken(user);
    res.cookie('token', token, getAuthCookieOptions());

    // Audit log
    await ActivityLog.create({
      user: user._id,
      action: 'EMAIL_VERIFIED',
      details: { email: user.email },
      ipAddress: req.ip || '',
    });

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          totalPoints: user.totalPoints,
          experiencePoints: user.experiencePoints,
          level: user.level,
        },
      },
      'Email verified successfully. You are now logged in.'
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Fetch user including hidden passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    if (!user.isVerified) {
      return sendError(res, 'Please verify your email address before logging in.', 403, {
        requiresVerification: true,
        email: user.email,
      });
    }

    // Set secure HttpOnly cookie
    const token = generateToken(user);
    res.cookie('token', token, getAuthCookieOptions());

    // Audit log
    await ActivityLog.create({
      user: user._id,
      action: 'USER_LOGIN',
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          totalPoints: user.totalPoints,
          experiencePoints: user.experiencePoints,
          level: user.level,
          schoolOrCollege: user.schoolOrCollege,
        },
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: getAuthCookieOptions().secure,
      sameSite: getAuthCookieOptions().sameSite,
      path: '/',
    });

    if (req.user) {
      await ActivityLog.create({
        user: req.user._id,
        action: 'USER_LOGOUT',
        ipAddress: req.ip || '',
      });
    }

    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 'User session invalid', 404);
    }

    // Fetch earned badges
    const userBadges = await UserBadge.find({ user: user._id }).populate('badge');
    const badges = userBadges.map((ub) => ub.badge);

    const nextLevelXP = getNextLevelXP(user.level);
    const currentBaseXP = getCurrentLevelBaseXP(user.level);

    return sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        totalPoints: user.totalPoints,
        experiencePoints: user.experiencePoints,
        level: user.level,
        schoolOrCollege: user.schoolOrCollege,
        badges,
        gamification: {
          currentXP: user.experiencePoints,
          currentLevel: user.level,
          currentBaseXP,
          nextLevelXP,
          progressPercentage: Math.min(
            100,
            Math.max(0, Math.round(((user.experiencePoints - currentBaseXP) / (nextLevelXP - currentBaseXP || 1)) * 100))
          ),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Don't disclose if account exists
      return sendSuccess(res, null, 'If this email is registered, a password reset code has been sent.');
    }

    await requestOtp(normalizedEmail, 'reset');

    return sendSuccess(res, null, 'If this email is registered, a password reset code has been sent.');
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return sendError(res, 'User with this email not found.', 404);
    }

    // Verify OTP against hashed store
    await verifyOtp(normalizedEmail, otp);

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await ActivityLog.create({
      user: user._id,
      action: 'PASSWORD_RESET',
      ipAddress: req.ip || '',
    });

    return sendSuccess(res, null, 'Password has been reset successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  sendVerificationOtp,
  verifyEmail,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};
