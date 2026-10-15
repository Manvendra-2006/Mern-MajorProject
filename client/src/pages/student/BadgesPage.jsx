import React, { useState, useEffect } from 'react';
import { badgeApi } from '../../services/leaderboard.api';
import { BadgeIcon } from '../../components/common/BadgePill';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Award, Lock, CheckCircle2, Sparkles } from 'lucide-react';

const BadgesPage = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await badgeApi.getAllBadges ? await badgeApi.getAllBadges() : await badgeApi.getBadges();
        if (res.success && res.data) {
          setBadges(res.data);
        }
      } catch (err) {
        console.error('Failed to load badges', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const earnedCount = badges.filter((b) => b.isEarned).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="w-8 h-8 text-emerald-600" />
            <span>Environmental Badges & Achievements</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Unlock distinguished badges by taking consistent physical climate action and mastering scientific quizzes.
          </p>
        </div>

        <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold text-xs flex items-center gap-2 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>
            {earnedCount} of {badges.length} Unlocked
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const isEarned = badge.isEarned;

            return (
              <div
                key={badge._id}
                className={`p-6 rounded-3xl border transition flex flex-col justify-between space-y-4 shadow-sm ${
                  isEarned
                    ? 'bg-white border-emerald-300 shadow-emerald-500/5'
                    : 'bg-slate-50/70 border-slate-200 opacity-70'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isEarned ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <BadgeIcon iconName={badge.icon} className="w-6 h-6" />
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                        isEarned
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isEarned ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Unlocked</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{badge.name}</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase mt-0.5">
                      {badge.category}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{badge.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                  {isEarned ? (
                    <span className="text-emerald-700 font-semibold">
                      Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>Criteria: Complete eligible challenges & quizzes</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BadgesPage;
