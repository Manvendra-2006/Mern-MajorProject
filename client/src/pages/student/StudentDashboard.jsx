import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../services/resource.api';
import StatCard from '../../components/common/StatCard';
import { BadgePill } from '../../components/common/BadgePill';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import {
  Zap,
  Award,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await analyticsApi.getStudentDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Dashboard Unavailable"
        description={error || 'Could not load your student dashboard metrics.'}
      />
    );
  }

  const { profile, metrics, badges, weeklyActivity, recentActivities, recommendedChallenges } = data;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <span>Level {profile.level} Eco-Advocate</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile.name}!
          </h2>
          <p className="text-emerald-100 text-sm max-w-xl">
            {profile.schoolOrCollege ? `${profile.schoolOrCollege} — ` : ''}Keep driving environmental impact through weekly challenges and quizzes.
          </p>
        </div>

        {/* Level XP Progress Pill */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl w-full md:w-72 relative z-10">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span>Next Level: Lvl {profile.level + 1}</span>
            <span>{profile.levelProgress}%</span>
          </div>
          <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${profile.levelProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-200 mt-2 text-right">
            {profile.experiencePoints} / {profile.nextLevelXP} XP
          </p>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Points"
          value={metrics.totalPoints}
          subtitle="Auditable points ledger"
          icon={Zap}
          color="emerald"
        />
        <StatCard
          title="Current Level"
          value={`Lvl ${metrics.level}`}
          subtitle={`${metrics.experiencePoints} XP accumulated`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Challenges Done"
          value={`${metrics.challengesCompleted} / ${metrics.totalAvailableChallenges}`}
          subtitle="Approved physical actions"
          icon={CheckCircle2}
          color="amber"
        />
        <StatCard
          title="Quiz Average"
          value={`${metrics.avgQuizScore}%`}
          subtitle={`${metrics.totalQuizAttempts} total attempts`}
          icon={BookOpen}
          color="purple"
        />
      </div>

      {/* Middle Row: Weekly Activity Chart + Earned Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Points Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Environmental Points</h3>
              <p className="text-xs text-slate-500">Points earned over the last 7 calendar days</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              Live Aggregation
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value) => [`${value} Points`, 'Points Earned']}
                />
                <Bar dataKey="points" fill="#10b981" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Badges Showcase */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900">Earned Badges</h3>
              <Link to="/student/badges" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                View All
              </Link>
            </div>

            {badges.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Complete challenges and quizzes to unlock your first badge!
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {badges.map((badge) => (
                  <BadgePill key={badge._id} badge={badge} earned={true} size="sm" />
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Badges Unlocked:</span>
            <span className="font-extrabold text-slate-900 text-sm">{badges.length}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recommended Challenges & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Challenges */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recommended Next Quests</h3>
              <p className="text-xs text-slate-500">Uncompleted challenges to advance your impact</p>
            </div>
            <Link
              to="/student/challenges"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recommendedChallenges.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Great job! You have attempted or completed all available challenges.
            </p>
          ) : (
            <div className="space-y-3">
              {recommendedChallenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {challenge.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">• {challenge.difficulty}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{challenge.title}</h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-700">+{challenge.pointsReward} pts</span>
                    <Link
                      to={`/challenges/${challenge._id}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                    >
                      Start Quest
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Points Ledger Activity */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900">Points History</h3>
            <Link to="/student/profile" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
              Full Ledger
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No activity records yet.</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((tx) => (
                <div key={tx._id} className="flex items-start justify-between gap-3 text-xs border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 leading-snug">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex-shrink-0">
                    +{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
