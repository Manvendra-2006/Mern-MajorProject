import React, { useState, useEffect } from 'react';
import { leaderboardApi } from '../../services/leaderboard.api';
import { BadgePill } from '../../components/common/BadgePill';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import { Trophy, Medal, Award, Flame, Calendar, Sparkles } from 'lucide-react';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [period, setPeriod] = useState('all_time');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await leaderboardApi.getLeaderboard({ period, limit: 25 });
        if (res.success && res.data) {
          setLeaderboard(res.data);
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Trophy className="w-8 h-8 text-amber-500" />
            <span>Campus Sustainability Leaderboard</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Recognizing top environmental stewards across schools and universities.
          </p>
        </div>

        {/* Period Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 rounded-xl transition ${
              period === 'weekly'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 rounded-xl transition ${
              period === 'monthly'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod('all_time')}
            className={`px-3 py-1.5 rounded-xl transition ${
              period === 'all_time'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : leaderboard.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No leaderboard data available"
          description={`There are currently no recorded points for the ${period} period.`}
        />
      ) : (
        <div className="space-y-8">
          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {topThree.map((user, idx) => {
                const medalColors = [
                  'from-amber-400 to-yellow-500 text-amber-950 border-amber-300', // 1st Gold
                  'from-slate-300 to-slate-400 text-slate-900 border-slate-300',  // 2nd Silver
                  'from-amber-700/60 to-amber-800 text-amber-100 border-amber-600', // 3rd Bronze
                ];
                const podiumRank = idx + 1;

                return (
                  <div
                    key={user.id}
                    className={`bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden ${
                      podiumRank === 1 ? 'md:-translate-y-2 border-amber-300 shadow-amber-500/10' : ''
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${medalColors[idx]} flex items-center justify-center font-extrabold text-lg shadow-md mb-3`}
                    >
                      {podiumRank === 1 ? '🥇' : podiumRank === 2 ? '🥈' : '🥉'}
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 truncate max-w-[200px]">
                      {user.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate max-w-[200px] mt-0.5">
                      {user.schoolOrCollege || 'Institution Member'}
                    </p>

                    <div className="my-3 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full font-extrabold text-sm border border-emerald-200">
                      ⚡ {user.points} pts
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Level {user.level}</span>
                      <span>•</span>
                      <span>{user.badges?.length || 0} Badges</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">Complete Leaderboard Rankings</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Rank</th>
                    <th className="py-3.5 px-6">Student</th>
                    <th className="py-3.5 px-6">School / Institution</th>
                    <th className="py-3.5 px-6">Level</th>
                    <th className="py-3.5 px-6 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-extrabold text-slate-700">
                        {entry.rank <= 3 ? (
                          <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <span className="text-slate-500 pl-2">#{entry.rank}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{entry.name}</div>
                        <div className="flex gap-1 mt-1">
                          {entry.badges?.slice(0, 3).map((b, i) => (
                            <span key={i} className="text-xs" title={b.name}>
                              {b.icon === 'Droplets' ? '💧' : b.icon === 'Trash2' ? '♻️' : '🏅'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        {entry.schoolOrCollege || '—'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700">
                        Lvl {entry.level}
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-emerald-700 text-sm">
                        ⚡ {entry.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
