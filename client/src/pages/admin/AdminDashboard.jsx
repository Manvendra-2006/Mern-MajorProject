import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../services/resource.api';
import StatCard from '../../components/common/StatCard';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import {
  Users,
  Compass,
  BookOpen,
  Award,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
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

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await analyticsApi.getAdminDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load administrator metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <CardSkeleton />;
  if (error || !data) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admin Metrics Unavailable"
        description={error || 'Could not aggregate platform telemetry.'}
      />
    );
  }

  const { metrics, categoryDistribution, recentActivity } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Platform Security & Institutional Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            EcoQuest Administrator Console
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Real-time platform telemetry, user access control, and challenge moderation oversight.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/users"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/moderation"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition"
          >
            Moderation Queue
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={metrics.totalUsers}
          subtitle={`${metrics.totalStudents} Students • ${metrics.totalTeachers} Teachers`}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Active Challenges"
          value={metrics.totalChallenges}
          subtitle="Curated physical quests"
          icon={Compass}
          color="emerald"
        />
        <StatCard
          title="Total Points Issued"
          value={metrics.totalPointsDistributed}
          subtitle="All ledger transactions"
          icon={Award}
          color="amber"
        />
        <StatCard
          title="Activity Submissions"
          value={metrics.totalSubmissions}
          subtitle={`${metrics.approvedSubmissions} approved & verified`}
          icon={CheckCircle2}
          color="blue"
        />
      </div>

      {/* Middle Row: Category Distribution Chart + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Challenges by Category</h3>
              <p className="text-xs text-slate-500">Distribution of available challenges across environmental fields</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg border border-purple-200">
              Live Breakdown
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
                  formatter={(value) => [`${value} Challenges`, 'Count']}
                />
                <Bar dataKey="challengesCount" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Log Feed */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>Live Platform Audit</span>
            </h3>
            <span className="text-xs text-slate-400">Recent</span>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No platform actions logged yet.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((log) => (
                <div key={log._id} className="text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{log.user?.name || 'System'}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-purple-700">{log.action}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
