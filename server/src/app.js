const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const config = require('./config/environment');
const errorHandler = require('./middleware/errorHandler.middleware');

// Route modules
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const challengeRoutes = require('./routes/challenge.routes');
const submissionRoutes = require('./routes/submission.routes');
const quizRoutes = require('./routes/quiz.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const badgeRoutes = require('./routes/badge.routes');
const resourceRoutes = require('./routes/resource.routes');
const teacherRoutes = require('./routes/teacher.routes');
const adminRoutes = require('./routes/admin.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

// Security HTTP Headers
app.use(helmet());

// Credentialed CORS with explicit allowlist for production and development
// Credentialed CORS with explicit allowlist for production and development
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same‑origin (no Origin header) or whitelisted origins
        if (!origin) return callback(null, true);
      const allowedOrigins = [
        config.frontendUrl,
        'https://mern-major-project-2ywetbacn-manvendra-bhardwajs-projects.vercel.app',
        'https://mern-major-project.vercel.app',
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const msg = 'CORS policy does not allow this origin.';
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body Parsing & Cookies
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Request logging in development
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Catch-all 404 for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
