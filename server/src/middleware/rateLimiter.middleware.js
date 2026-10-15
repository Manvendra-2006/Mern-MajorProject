const cacheClient = require('../config/redis');
const { sendError } = require('../utils/response');

/**
 * Distributed rate limiter powered by Redis / Memory fallback.
 * @param {string} prefix - Key prefix for tracking
 * @param {number} maxRequests - Max permitted requests in window
 * @param {number} windowSeconds - Window duration in seconds
 * @param {string} message - Error message on limit exceeded
 */
const rateLimiter = (prefix, maxRequests, windowSeconds, message = 'Too many requests. Please try again later.') => {
  return async (req, res, next) => {
    try {
      const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      // If user submits email in body (e.g. OTP/login), combine IP with email for granular rate limiting
      const identifier = req.body?.email ? `${clientIp}:${req.body.email.toLowerCase().trim()}` : clientIp;
      const key = `ratelimit:${prefix}:${identifier}`;

      const count = await cacheClient.incr(key);
      if (count === 1) {
        await cacheClient.expire(key, windowSeconds);
      }

      const ttl = await cacheClient.ttl(key);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
      res.setHeader('X-RateLimit-Reset', ttl > 0 ? ttl : windowSeconds);

      if (count > maxRequests) {
        return sendError(res, message, 429, {
          retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
        });
      }

      next();
    } catch (err) {
      console.error('[RateLimiter Error]', err.message);
      // In case of rate limiter glitch, fail open so user is not blocked
      next();
    }
  };
};

// Specific rate limiters as requested
const authRateLimiter = rateLimiter('auth', 10, 60, 'Too many login attempts. Please wait a minute before trying again.');
const otpRequestRateLimiter = rateLimiter('otp_req', 5, 300, 'Too many OTP requests. Please wait a few minutes before trying again.');
const otpVerifyRateLimiter = rateLimiter('otp_ver', 8, 300, 'Too many verification attempts. Please try again later.');

module.exports = {
  rateLimiter,
  authRateLimiter,
  otpRequestRateLimiter,
  otpVerifyRateLimiter,
};
