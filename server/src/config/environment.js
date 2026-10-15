const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const smtpPort = Number.parseInt(process.env.SMTP_PORT, 10);

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecoquest',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  jwtSecret: process.env.JWT_SECRET || 'ecoquest_jwt_secret_key_minimum_32_characters_for_security_123',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mailMode: (process.env.MAIL_MODE || 'smtp').trim().toLowerCase(),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number.isNaN(smtpPort) ? 587 : smtpPort,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || process.env.SMTP_USER || '"EcoQuest" <noreply@ecoquest.edu>',
  },
};

module.exports = config;
