const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  authRateLimiter,
  otpRequestRateLimiter,
  otpVerifyRateLimiter,
} = require('../middleware/rateLimiter.middleware');
const {
  registerSchema,
  loginSchema,
  otpRequestSchema,
  otpVerifySchema,
  resetPasswordSchema,
} = require('../validators/auth.validator');

// Registration & Login
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/logout', authenticateToken, authController.logout);

// OTP Request & Email Verification
router.post('/request-otp', otpRequestRateLimiter, validate(otpRequestSchema), authController.sendVerificationOtp);
router.post('/verify-email', otpVerifyRateLimiter, validate(otpVerifySchema), authController.verifyEmail);

// Password Reset Flow
router.post('/forgot-password', otpRequestRateLimiter, authController.forgotPassword);
router.post('/reset-password', otpVerifyRateLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Current Session Info
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
