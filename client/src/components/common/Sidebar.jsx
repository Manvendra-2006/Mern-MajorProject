import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  FileCheck,
  BookOpen,
  Trophy,
  Award,
  BookMarked,
  User,
  Users,
  ShieldCheck,
  CheckSquare,
  PlusCircle,
  BarChart3,
} from 'lucide-react';

const Sidebar = ({ onCloseMobile }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { to: '/student/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/student/challenges', label: 'Browse Challenges', icon: Compass },
    { to: '/student/submissions', label: 'My Submissions', icon: FileCheck },
    { to: '/student/quizzes', label: 'Environmental Quizzes', icon: BookOpen },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/student/badges', label: 'Badges & Achievements', icon: Award },
    { to: '/resources', label: 'Learning Library', icon: BookMarked },
    { to: '/student/profile', label: 'Profile & Ledger', icon: User },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard },
    { to: '/teacher/submissions', label: 'Review Submissions', icon: CheckSquare },
    { to: '/teacher/challenges', label: 'Manage Challenges', icon: Compass },
    { to: '/teacher/quizzes', label: 'Manage Quizzes', icon: BookOpen },
    { to: '/teacher/resources', label: 'Learning Resources', icon: BookMarked },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/moderation', label: 'Challenge Moderation', icon: ShieldCheck },
    { to: '/teacher/challenges', label: 'All Challenges', icon: Compass },
    { to: '/teacher/quizzes', label: 'All Quizzes', icon: BookOpen },
    { to: '/teacher/resources', label: 'Learning Resources', icon: BookMarked },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const links = role === 'admin' ? adminLinks : role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* User Mini Card */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-sm">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-slate-800 truncate">{user.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                role === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : role === 'teacher'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {role}
              </span>
              {role === 'student' && (
                <span className="text-[11px] font-semibold text-slate-500">
                  Lvl {user.level || 1}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Level XP Bar for Student */}
        {role === 'student' && user.gamification && (
          <div className="mt-3 pt-3 border-t border-slate-200/60">
            <div className="flex justify-between items-center text-[11px] font-medium text-slate-600 mb-1">
              <span>Level {user.gamification.currentLevel} Progress</span>
              <span className="text-emerald-700 font-bold">{user.gamification.progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${user.gamification.progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
        EcoQuest Platform v1.0
      </div>
    </aside>
  );
};

export default Sidebar;
