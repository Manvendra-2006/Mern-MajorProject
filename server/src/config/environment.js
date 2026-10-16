
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

const config = {
  port: Number.parseInt(process.env.PORT, 10) || 5000,

  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  mongodbUri:
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/ecoquest',

  redisUrl:
    process.env.REDIS_URL ||
    'redis://127.0.0.1:6379',

  jwtSecret:
    process.env.JWT_SECRET ||
    'ecoquest_jwt_secret_key_minimum_32_characters_for_security_123',

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  cookieMaxAge: 7 * 24 * 60 * 60 * 1000,

  frontendUrl:
    process.env.FRONTEND_URL ||
    'http://localhost:5173',

  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from:
      process.env.RESEND_FROM ||
      'EcoQuest <onboarding@resend.dev>',
  },
};

module.exports = config;
