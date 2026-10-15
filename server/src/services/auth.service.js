const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cacheClient = require('../config/redis');
const { sendOtpEmail } = require('../config/mailer');
const config = require('../config/environment');
const User = require('../models/User');

const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const OTP_COOLDOWN_SECONDS = 60; // 60 seconds
const MAX_OTP_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure 6-digit OTP
 */
const generateSecureOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Generate SHA-256 hash of the OTP
 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Request and dispatch an email OTP with cooldown and secure hashing
 */
const requestOtp = async (email, purpose = 'verification') => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check 60-second resend cooldown
  const cooldownKey = `otp_cooldown:${normalizedEmail}`;
  const cooldownTTL = await cacheClient.ttl(cooldownKey);
  if (cooldownTTL > 0) {
    const error = new Error(`Please wait ${cooldownTTL} seconds before requesting another code.`);
    error.statusCode = 429;
    throw error;
  }

  // 2. Generate secure OTP and calculate SHA-256 hash
  const otp = generateSecureOtp();
  const hashedOtp = hashOtp(otp);

  // 3. Store hashed OTP in Redis with 5-minute TTL
  const otpKey = `otp:${normalizedEmail}`;
  await cacheClient.setex(otpKey, OTP_EXPIRY_SECONDS, hashedOtp);

  // 4. Set cooldown key for 60 seconds
  await cacheClient.setex(cooldownKey, OTP_COOLDOWN_SECONDS, 'active');

  // 5. Reset attempt counter for this email
  const attemptsKey = `otp_attempts:${normalizedEmail}`;
  await cacheClient.del(attemptsKey);

  // 6. Deliver OTP via Nodemailer without logging the plaintext code
  await sendOtpEmail(normalizedEmail, otp, purpose);

  return {
    success: true,
    message: 'Verification code sent to your email address.',
    cooldownSeconds: OTP_COOLDOWN_SECONDS,
    expiresInSeconds: OTP_EXPIRY_SECONDS,
  };
};

/**
 * Verify submitted OTP against stored hash with attempt limits and invalidation
 */
const verifyOtp = async (email, submittedOtp) => {
  const normalizedEmail = email.toLowerCase().trim();
  const otpKey = `otp:${normalizedEmail}`;
  const attemptsKey = `otp_attempts:${normalizedEmail}`;

  // 1. Check attempt count
  const attempts = await cacheClient.incr(attemptsKey);
  if (attempts === 1) {
    await cacheClient.expire(attemptsKey, OTP_EXPIRY_SECONDS);
  }

  if (attempts > MAX_OTP_ATTEMPTS) {
    // Invalidate the OTP to prevent further brute-force
    await cacheClient.del(otpKey);
    const error = new Error('Too many invalid attempts. This verification code has been revoked. Please request a new one.');
    error.statusCode = 429;
    throw error;
  }

  // 2. Retrieve hashed OTP from store
  const storedHashedOtp = await cacheClient.get(otpKey);
  if (!storedHashedOtp) {
    const error = new Error('Verification code has expired or does not exist. Please request a new one.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Compare hash
  const submittedHash = hashOtp(submittedOtp);
  if (submittedHash !== storedHashedOtp) {
    const remainingAttempts = Math.max(0, MAX_OTP_ATTEMPTS - attempts);
    const error = new Error(
      remainingAttempts > 0
        ? `Invalid verification code. ${remainingAttempts} attempts remaining.`
        : 'Invalid verification code. Maximum attempts reached. Please request a new code.'
    );
    error.statusCode = 400;
    throw error;
  }

  // 4. Invalidate OTP and attempts immediately upon success
  await cacheClient.del(otpKey);
  await cacheClient.del(attemptsKey);

  return { success: true };
};

/**
 * Issue JWT token with standardized payload
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    }
  );
};

/**
 * Cookie options for HttpOnly security
 */
const getAuthCookieOptions = () => {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge: config.cookieMaxAge,
    path: '/',
  };
};

module.exports = {
  requestOtp,
  verifyOtp,
  generateToken,
  getAuthCookieOptions,
  hashOtp,
};
