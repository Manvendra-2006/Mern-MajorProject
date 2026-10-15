# 🌿 EcoQuest — Gamified Environmental Education Platform

A full-stack, production-ready MERN platform engineered for schools, universities, and environmental clubs. EcoQuest bridges ecological curriculum with hands-on physical challenges, scientific quizzes, auditable gamification (points ledger, XP levels, badges, leaderboards), and role-based portals for **Students**, **Teachers**, and **Administrators**.

Built with **Zero Generative AI / LLM APIs** — all features run on deterministic programming logic, database constraints, cryptographic hashing, and verified educational literature.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, React Router DOM v6, Axios, Recharts, Lucide React icons.
- **Backend**: Node.js, Express.js, MongoDB with Mongoose, Redis (with resilient in-memory fallback), Nodemailer (SMTP), JWT in HttpOnly cookies, bcryptjs, Zod validation.
- **Security**: Helmet security headers, credentialed CORS, Redis rate limiting, SHA-256 hashed OTPs with cooldowns, auditable idempotent points ledger.

---

## 🏗️ System Architecture & Database Models

```
ecoquest/
├── client/                      # React + Vite Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI (Navbar, Sidebar, Modals, StatCards, Badges)
│   │   ├── context/             # AuthContext, ToastContext
│   │   ├── layouts/             # PublicLayout, DashboardLayout, ProtectedRoute
│   │   ├── pages/
│   │   │   ├── public/          # Landing, About, Login, Register, VerifyOtp, ResetPassword
│   │   │   ├── student/         # StudentDashboard, Challenges, Quizzes, Badges, Profile
│   │   │   ├── teacher/         # TeacherDashboard, SubmissionsReview, ManageQuizzes
│   │   │   └── admin/           # AdminDashboard, UserManagement, ChallengeModeration
│   │   └── services/            # Axios API domain modules
│   └── package.json
│
├── server/                      # Node.js + Express API Backend
│   ├── src/
│   │   ├── config/              # db.js, redis.js (with memory fallback), mailer.js, environment.js
│   │   ├── controllers/         # auth, challenge, submission, quiz, analytics, admin
│   │   ├── middleware/          # auth (HttpOnly cookie), role RBAC, rateLimiter, Zod validation
│   │   ├── models/              # User, Challenge, Submission, Quiz, Attempt, Badge, Ledger, etc.
│   │   ├── routes/              # Modular route bindings
│   │   ├── services/            # gamification.service.js, auth.service.js
│   │   ├── seeds/               # seed.js (initial badges, users, quests, quizzes)
│   │   └── tests/               # Vitest API integration tests
│   ├── server.js
│   └── package.json
└── README.md
```

### Database Models & Safeguards
1. **User**: Name, unique lowercase email, bcrypt `passwordHash` (`select: false`), role (`student`, `teacher`, `admin`), points, XP, level.
2. **Challenge**: Title, description, category (Waste, Water, Energy, etc.), difficulty, instructions, rewards.
3. **ChallengeSubmission**: Unique compound index `{ challenge: 1, student: 1 }` prevents duplicate submissions.
4. **Quiz**: Question text, 4 options, `correctOptionIndex`, explanations. Stripped before student attempts.
5. **QuizAttempt**: Score calculation on the backend, time spent, pass/fail status.
6. **PointsTransaction**: Auditable ledger. Unique compound index `{ user: 1, type: 1, referenceId: 1 }` enforces strict database-level idempotency to prevent duplicate reward exploits.
7. **Badge & UserBadge**: Compound index `{ user: 1, badge: 1 }` ensures badges are awarded only once.
8. **LearningResource**: Searchable environmental library with audience difficulty tags.
9. **ActivityLog**: Security audit logging.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v22 LTS)
- MongoDB running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI
- Redis running on `127.0.0.1:6379` (optional; built-in graceful in-memory cache activates automatically if Redis is unavailable)

### 1. Starting MongoDB & Redis
**MongoDB**:
- If using local Windows service: Verify with `Get-Service MongoDB` (starts automatically).
- Or via Docker:
  ```bash
  docker run -d -p 27017:27017 --name ecoquest-mongo mongo:latest
  ```

**Redis**:
- If using Docker:
  ```bash
  docker run -d -p 6379:6379 --name ecoquest-redis redis:alpine
  ```
- *Note*: If Redis is not running, EcoQuest displays an informational notice and gracefully falls back to an in-memory cache so all OTP and rate-limiting features remain 100% operational.

---

### 2. Backend Setup
1. Navigate to `server`:
   ```bash
   cd server
   ```
2. Create environment file:
   ```bash
   copy .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed demo badges, accounts, challenges, and quizzes:
   ```bash
   npm run seed
   ```
5. Run the test suite:
   ```bash
   npm test
   ```
6. Start development server:
   ```bash
   npm run dev
   # Server listens on http://localhost:5000
   ```

---

### 3. Frontend Setup
1. Open a new terminal and navigate to `client`:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite dev server:
   ```bash
   npm run dev
   # Accessible at http://localhost:5173
   ```

---

## 🔑 Demo Seed Accounts

The database seeder automatically configures three verified accounts:

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Student** | `student@ecoquest.edu` | `Student@123` | Dashboard, Quests, Quizzes, Badges, Leaderboard, Points Ledger |
| **Teacher** | `teacher@ecoquest.edu` | `Teacher@123` | Classroom Analytics, Quest Authoring, Submission Evaluation Queue, Quiz Builder |
| **Administrator** | `admin@ecoquest.edu` | `Admin@123` | Platform Telemetry, User Access Control, Challenge Moderation |

---

## 🔐 Authentication & Email OTP Workflow

1. User submits registration details (`POST /api/auth/register`).
2. Backend generates a 6-digit cryptographically random code (`crypto.randomInt`).
3. SHA-256 hash stored in Redis/Memory with a **5-minute TTL** (`setex(..., 300, ...)`).
4. Cooldown key prevents spam requests within **60 seconds**.
5. Dispatched via Nodemailer. In development without custom SMTP credentials, Ethereal test mailer initializes and outputs safe inbox preview URLs to console without logging secret codes.
6. User enters 6-digit OTP (`POST /api/auth/verify-email`).
7. Backend validates hash, enforces maximum 5 attempts, invalidates code upon success, and sets a secure `HttpOnly` JWT cookie.

---

## 🚢 Production Deployment Guide

1. **Environment Variables**:
   - Set `NODE_ENV=production`.
   - Set `JWT_SECRET` to a 64+ character random string.
   - Set `MONGODB_URI` to a replica-set Atlas connection string.
   - Configure real SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`).
   - Set `FRONTEND_URL` to your production domain (e.g., `https://ecoquest.yourcollege.edu`).
2. **Cookies & CORS**:
   - In production, cookies are automatically flagged with `secure: true` and `sameSite: 'none'` (or `'lax'` when same-origin).
3. **Build Frontend**:
   ```bash
   cd client && npm run build
   ```
4. **Serve Static or Proxy with Nginx / Reverse Proxy**:
   Proxy `/api` to Node.js on port 5000 and serve `client/dist` statically.
