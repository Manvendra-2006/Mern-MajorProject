# EcoQuest: Complete API Documentation & Testing Guide

## 1. Authentication & Security Model
All requests require credentialed CORS. Sessions use **HttpOnly** cookies containing JSON Web Tokens (JWT). In production environments, `Secure` and strict `SameSite` flags are enforced.

- **Base URL**: `http://localhost:5000/api`
- **Response Format**:
```json
{
  "success": true,
  "message": "Human readable message",
  "data": {},
  "pagination": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 }
}
```

---

## 2. Authentication Endpoints (`/api/auth`)

### 1. Register User
- **POST** `/auth/register`
- **Rate Limit**: 10 requests / minute
- **Body**:
```json
{
  "name": "Alex Johnson",
  "email": "alex@institution.edu",
  "password": "Password123!",
  "role": "student",
  "schoolOrCollege": "Greenwood High School"
}
```
- **Response**: `201 Created` — Dispatches 6-digit OTP to user email.

### 2. Verify Email OTP
- **POST** `/auth/verify-email`
- **Rate Limit**: 8 attempts / 5 minutes
- **Body**:
```json
{
  "email": "alex@institution.edu",
  "otp": "492817"
}
```
- **Response**: `200 OK` — Sets `token` in `HttpOnly` cookie.

### 3. Login
- **POST** `/auth/login`
- **Rate Limit**: 10 requests / minute
- **Body**:
```json
{
  "email": "student@ecoquest.edu",
  "password": "Student@123"
}
```
- **Response**: `200 OK` — Sets `token` cookie and returns user profile.

### 4. Logout
- **POST** `/auth/logout`
- **Headers**: Cookie session
- **Response**: `200 OK` — Clears `token` cookie.

### 5. Forgot Password & Reset
- **POST** `/auth/forgot-password` (Body: `{ "email": "user@edu.com" }`)
- **POST** `/auth/reset-password` (Body: `{ "email": "user@edu.com", "otp": "123456", "newPassword": "NewPassword123!" }`)

---

## 3. Environmental Challenges (`/api/challenges`)

### 1. List Challenges
- **GET** `/challenges?category=Water%20Conservation&difficulty=Medium&search=leak`
- **Access**: Public / Authenticated

### 2. Challenge Details
- **GET** `/challenges/:id`

### 3. Create Challenge (Teacher / Admin)
- **POST** `/challenges`
- **Body**:
```json
{
  "title": "Household Water Audit & Leak Detection",
  "description": "Inspect faucets and cisterna at home...",
  "category": "Water Conservation",
  "difficulty": "Easy",
  "pointsReward": 40,
  "xpReward": 40,
  "instructions": "1. Test taps...\n2. Calculate liters per minute...",
  "submissionRequirements": "Detail fixtures checked and any leaks found."
}
```

---

## 4. Submissions & Faculty Evaluation (`/api/submissions`)

### 1. Submit Challenge Proof (Student)
- **POST** `/submissions`
- **Body**:
```json
{
  "challengeId": "65fc0a1b2c3d4e5f6a7b8c9d",
  "proofText": "Conducted dye test on bathroom cisterna. Identified dripping flapper valve and replaced seal, saving ~20 gallons daily.",
  "proofFileUrl": "https://drive.google.com/..."
}
```

### 2. Review Submissions (Teacher / Admin)
- **PUT** `/submissions/:id/review`
- **Body**:
```json
{
  "status": "approved",
  "feedback": "Outstanding documentation on water savings!"
}
```
- **Behavior**: Automatically creates an immutable `PointsTransaction` and updates student points and XP atomically.

---

## 5. Environmental Quizzes (`/api/quizzes`)

### 1. Catalog
- **GET** `/quizzes` (Correct answers are strictly hidden)

### 2. Load Questions for Attempt
- **GET** `/quizzes/:id/attempt` (Correct answers and explanations stripped)

### 3. Submit Answers
- **POST** `/quizzes/:id/attempt`
- **Body**:
```json
{
  "answers": [
    { "questionId": "65fc11...", "selectedOptionIndex": 1 },
    { "questionId": "65fc12...", "selectedOptionIndex": 2 }
  ],
  "timeSpentSeconds": 140
}
```
- **Response**: Server calculates score %, checks passing threshold, awards points (idempotent), and returns explanations for every question.

---

## 6. Leaderboard & Badges (`/api/leaderboard`, `/api/badges`)
- **GET** `/leaderboard?period=weekly`
- **GET** `/leaderboard?period=monthly`
- **GET** `/leaderboard?period=all_time`
- **GET** `/badges` (Lists all system badges with unlock criteria and student earned status)

---

## 7. Analytics (`/api/analytics`)
- **GET** `/analytics/student/dashboard`
- **GET** `/analytics/teacher/dashboard`
- **GET** `/analytics/admin/dashboard`
