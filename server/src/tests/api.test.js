const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const config = require('../config/environment');
const { connectDB, disconnectDB } = require('../config/db');
const cacheClient = require('../config/redis');
const User = require('../models/User');
const { Challenge } = require('../models/Challenge');
const Quiz = require('../models/Quiz');
const PointsTransaction = require('../models/PointsTransaction');
const { awardPoints } = require('../services/gamification.service');

describe('EcoQuest API Integration & Security Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
    await cacheClient.quit();
  });

  describe('Health & Service Status', () => {
    it('GET /api/health should report online status and service connectivity', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.services.database.status).toBe('connected');
    });
  });

  describe('Authentication & Security', () => {
    it('should reject login with invalid password with generic 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student@ecoquest.edu', password: 'WrongPassword999!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should successfully log in verified student and return HttpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student@ecoquest.edu', password: 'Student@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('student');

      // Verify HttpOnly cookie header
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
      expect(cookies[0].toLowerCase()).toMatch(/httponly/);
    });

    it('should block unauthenticated access to protected route /api/users/profile', async () => {
      const res = await request(app).get('/api/users/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should enforce role-based access: block student from teacher dashboard', async () => {
      // 1. Login as student
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student@ecoquest.edu', password: 'Student@123' });
      const cookie = loginRes.headers['set-cookie'];

      // 2. Attempt to access teacher dashboard
      const res = await request(app)
        .get('/api/teacher/dashboard')
        .set('Cookie', cookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });
  });

  describe('Challenges & Gamification Engine', () => {
    it('GET /api/challenges should return active challenges and categories', async () => {
      const res = await request(app).get('/api/challenges');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Gamification: should award points and strictly prevent duplicate rewards for same referenceId', async () => {
      const student = await User.findOne({ email: 'student@ecoquest.edu' });
      const testChallengeId = new mongoose.Types.ObjectId();

      // First point award
      const firstResult = await awardPoints({
        userId: student._id,
        amount: 50,
        xpAmount: 50,
        type: 'CHALLENGE_REWARD',
        referenceModel: 'Challenge',
        referenceId: testChallengeId,
        description: 'Test Challenge Reward',
      });

      expect(firstResult.awarded).toBe(true);
      expect(firstResult.pointsAdded).toBe(50);

      // Attempt duplicate award with identical parameters
      const duplicateResult = await awardPoints({
        userId: student._id,
        amount: 50,
        xpAmount: 50,
        type: 'CHALLENGE_REWARD',
        referenceModel: 'Challenge',
        referenceId: testChallengeId,
        description: 'Test Duplicate Challenge Reward',
      });

      expect(duplicateResult.awarded).toBe(false);
      expect(duplicateResult.reason).toBe('DUPLICATE_REWARD');
    });
  });

  describe('Quizzes & Server-side Security', () => {
    it('GET /api/quizzes should hide correct answers and explanations from public view', async () => {
      const res = await request(app).get('/api/quizzes');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const quizzes = res.body.data;
      expect(quizzes.length).toBeGreaterThan(0);

      // Ensure questions don't expose answer keys
      quizzes.forEach(quiz => {
        expect(quiz.correctOptionIndex).toBeUndefined();
      });
    });

    it('GET /api/leaderboard should return sorted rankings with hidden credentials', async () => {
      const res = await request(app).get('/api/leaderboard?period=all_time');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const leaderboard = res.body.data;
      expect(leaderboard.length).toBeGreaterThan(0);

      // Verify rank 1 has highest or equal points
      if (leaderboard.length > 1) {
        expect(leaderboard[0].points).toBeGreaterThanOrEqual(leaderboard[1].points);
      }

      // Verify no password or sensitive hash exposed
      leaderboard.forEach(entry => {
        expect(entry.passwordHash).toBeUndefined();
        expect(entry.rank).toBeDefined();
        expect(entry.name).toBeDefined();
      });
    });
  });
});
