import React, { useState, useEffect } from 'react';
import { challengeApi } from '../../services/challenge.api';
import  adminApi  from '../../services/auth.api';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import { ShieldCheck, CheckCircle2, XCircle, Search } from 'lucide-react';

const ChallengeModeration = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await challengeApi.getChallenges({ limit: 50 });
      if (res.success && res.data) {
        setChallenges(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load challenges', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleToggleModeration = async (challengeId, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      await adminApi.moderateChallenge(challengeId, nextStatus);
      showToast(
        `Challenge ${nextStatus ? 'approved and published' : 'unapproved and hidden from students'}.`,
        'success'
      );
      await fetchChallenges();
    } catch (err) {
      showToast(err.message || 'Moderation action failed', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-8 h-8 text-purple-600" />
          <span>Challenge Moderation Oversight</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Review, approve, or hide faculty-created environmental challenges before or after they reach student catalogs.
        </p>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : challenges.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No challenges for moderation"
          description="All challenges have been reviewed."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Challenge</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Author</th>
                  <th className="py-3.5 px-6">Reward</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challenges.map((ch) => {
                  const isApproved = ch.isApprovedByAdmin !== false;
                  return (
                    <tr key={ch._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{ch.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{ch.description}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-[10px] uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {ch.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600">{ch.creator?.name || 'Faculty'}</td>
                      <td className="py-4 px-6 font-extrabold text-emerald-700">+{ch.pointsReward} pts</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isApproved ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{isApproved ? 'Approved' : 'Needs Review'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleModeration(ch._id, isApproved)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                            isApproved
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {isApproved ? 'Unpublish' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeModeration;
