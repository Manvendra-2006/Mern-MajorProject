import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { submissionApi } from '../../services/submission.api';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Award,
} from 'lucide-react';

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filterStatus !== 'all') params.status = filterStatus;
        const res = await submissionApi.getMySubmissions(params);
        if (res.success && res.data) {
          setSubmissions(res.data);
        }
      } catch (err) {
        console.error('Failed to load my submissions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [filterStatus]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileCheck className="w-8 h-8 text-emerald-600" />
            <span>My Challenge Submissions</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track teacher review status, feedback, and rewarded points across your submitted activities.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs font-semibold">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl capitalize transition ${
                filterStatus === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No submissions found"
          description={
            filterStatus === 'all'
              ? 'You have not submitted any challenge proofs yet. Explore available quests to get started!'
              : `No submissions with status "${filterStatus}".`
          }
          action={
            <Link
              to="/student/challenges"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Browse Challenges
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const challenge = sub.challenge;
            return (
              <div
                key={sub._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {challenge?.category || 'General'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{challenge?.title}</h3>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 uppercase ${
                      sub.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sub.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {sub.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {sub.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                    {sub.status === 'rejected' && <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{sub.status}</span>
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-500">Your Activity Report:</p>
                  <p className="whitespace-pre-line leading-relaxed">{sub.proofText}</p>
                </div>

                {sub.feedback && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-0.5">
                    <p className="font-bold flex items-center gap-1 text-emerald-800">
                      <span>Faculty Reviewer Feedback:</span>
                    </p>
                    <p className="italic">{sub.feedback}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                  {sub.status === 'approved' ? (
                    <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      +{sub.pointsAwarded} Points Earned
                    </span>
                  ) : (
                    <span className="text-slate-400">Potential Reward: +{challenge?.pointsReward} pts</span>
                  )}

                  <Link
                    to={`/challenges/${challenge?._id}`}
                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>View Challenge Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MySubmissions;
