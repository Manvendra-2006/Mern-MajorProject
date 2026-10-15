import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../services/resource.api';
import StatCard from '../../components/common/StatCard';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import {
  Users,
  Compass,
  CheckSquare,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Clock,
  Award,
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

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await analyticsApi.getTeacherDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load teacher analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <CardSkeleton />;
  if (error || !data) {
    return (
      <EmptyState
        title="Teacher Dashboard Unavailable"
        description={error || 'Could not load classroom metrics.'}
      />
    );
  }

  const { metrics, categoryBreakdown, recentPendingSubmissions, topStudents } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Faculty & Classroom Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Teacher Analytics Dashboard
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Review student environmental submissions, track participation rates, and author curricular quests.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/teacher/submissions"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow transition"
          >
            Review Submissions ({metrics.pendingSubmissions})
          </Link>
          <Link
            to="/teacher/challenges"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition"
          >
            Manage Quests
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Students"
          value={metrics.totalStudents}
          subtitle="Enrolled environmental learners"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Quests"
          value={metrics.activeChallenges}
          subtitle="Curated physical challenges"
          icon={Compass}
          color="emerald"
        />
        <StatCard
          title="Pending Reviews"
          value={metrics.pendingSubmissions}
          subtitle="Submissions awaiting review"
          icon={CheckSquare}
          color="amber"
        />
        <StatCard
          title="Completion Rate"
          value={`${metrics.completionRate}%`}
          subtitle={`${metrics.totalSubmissions} submissions total`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Middle Row: Category Breakdown Chart + Top Participating Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Submissions by Category</h3>
              <p className="text-xs text-slate-500">Student participation volume across environmental disciplines</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
              Aggregated
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                  formatter={(value, name) => [
                    `${value} Submissions`,
                    name === 'totalSubmissions' ? 'Total Submitted' : 'Approved',
                  ]}
                />
                <Bar dataKey="totalSubmissions" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Participating Students */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Student Standouts</h3>
            <span className="text-xs text-slate-400">By Points</span>
          </div>

          {topStudents.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No student activity logged yet.</p>
          ) : (
            <div className="space-y-3">
              {topStudents.slice(0, 6).map((st, idx) => (
                <div key={st._id} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{st.name}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{st.schoolOrCollege || 'Member'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-700">⚡ {st.totalPoints}</span>
                    <p className="text-[10px] text-slate-400">Lvl {st.level}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submissions Pending Review Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Submissions Awaiting Faculty Review</h3>
            <p className="text-xs text-slate-500">Inspect student proof, evaluate results, and allocate ledger points</p>
          </div>
          <Link
            to="/teacher/submissions"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPendingSubmissions.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">
            🎉 All pending challenge submissions have been reviewed!
          </p>
        ) : (
          <div className="space-y-3">
            {recentPendingSubmissions.map((sub) => (
              <div
                key={sub._id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] uppercase">
                      {sub.challenge?.category}
                    </span>
                    <span className="text-slate-500 font-semibold">{sub.student?.name}</span>
                    <span className="text-slate-400">({sub.student?.schoolOrCollege || 'School'})</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mt-1">{sub.challenge?.title}</h4>
                  <p className="text-slate-600 line-clamp-1 italic mt-0.5">"{sub.proofText}"</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-700">+{sub.challenge?.pointsReward} pts</span>
                  <Link
                    to="/teacher/submissions"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm text-xs"
                  >
                    Evaluate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
