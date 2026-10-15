import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './layouts/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import VerifyOtpPage from './pages/public/VerifyOtpPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';

// Shared & Student Pages
import ChallengeCatalog from './pages/student/ChallengeCatalog';
import ChallengeDetail from './pages/student/ChallengeDetail';
import MySubmissions from './pages/student/MySubmissions';
import QuizCatalog from './pages/student/QuizCatalog';
import QuizAttemptPage from './pages/student/QuizAttemptPage';
import LeaderboardPage from './pages/student/LeaderboardPage';
import BadgesPage from './pages/student/BadgesPage';
import ProfilePage from './pages/student/ProfilePage';
import LearningLibrary from './pages/student/LearningLibrary';
import StudentDashboard from './pages/student/StudentDashboard';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ManageChallenges from './pages/teacher/ManageChallenges';
import ChallengeSubmissionsReview from './pages/teacher/ChallengeSubmissionsReview';
import ManageQuizzes from './pages/teacher/ManageQuizzes';
import ManageResources from './pages/teacher/ManageResources';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ChallengeModeration from './pages/admin/ChallengeModeration';

function App() {
  return (
    <Routes>
      {/* Public Pages with Standard Header/Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/challenges" element={<ChallengeCatalog />} />
        <Route path="/challenges/:id" element={<ChallengeDetail />} />
        <Route path="/quizzes" element={<QuizCatalog />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/resources" element={<LearningLibrary />} />

        {/* Auth Flows */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Student Protected Portal */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/challenges" element={<ChallengeCatalog />} />
          <Route path="/student/submissions" element={<MySubmissions />} />
          <Route path="/student/quizzes" element={<QuizCatalog />} />
          <Route path="/student/badges" element={<BadgesPage />} />
          <Route path="/student/profile" element={<ProfilePage />} />
          <Route path="/quizzes/:id/attempt" element={<QuizAttemptPage />} />
        </Route>
      </Route>

      {/* Teacher Protected Portal */}
      <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/challenges" element={<ManageChallenges />} />
          <Route path="/teacher/submissions" element={<ChallengeSubmissionsReview />} />
          <Route path="/teacher/quizzes" element={<ManageQuizzes />} />
          <Route path="/teacher/resources" element={<ManageResources />} />
        </Route>
      </Route>

      {/* Admin Protected Portal */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/moderation" element={<ChallengeModeration />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
