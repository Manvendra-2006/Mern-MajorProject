import React, { useState, useEffect } from 'react';
import { submissionApi } from '../../services/submission.api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Award,
} from 'lucide-react';

const ChallengeSubmissionsReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [feedback, setFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { showToast } = useToast();

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await submissionApi.getSubmissionsForReview({ status: statusFilter });
      if (res.success && res.data) {
        setSubmissions(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load submissions queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const handleOpenReview = (submission) => {
    setActiveSubmission(submission);
    setReviewStatus('approved');
    setFeedback(submission.feedback || '');
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!activeSubmission) return;
    setSubmittingReview(true);

    try {
      const res = await submissionApi.reviewSubmission(activeSubmission._id, {
        status: reviewStatus,
        feedback,
      });

      if (res.success) {
        showToast(
          `Submission ${reviewStatus} successfully! ${
            reviewStatus === 'approved' ? `Awarded points to student ledger.` : ''
          }`,
          'success'
        );
        setActiveSubmission(null);
        await fetchQueue();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-8 h-8 text-emerald-600" />
            <span>Faculty Submissions Review Queue</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Validate student environmental activity reports, provide educational feedback, and authorize points rewards.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
          {['pending', 'approved', 'rejected', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl capitalize transition ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Review Queue Clear"
          description={`No submissions found matching status "${statusFilter}".`}
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isPending = sub.status === 'pending';

            return (
              <div
                key={sub._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        {sub.challenge?.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Submitted by <strong className="text-slate-700">{sub.student?.name}</strong> (
                        {sub.student?.schoolOrCollege || 'School'}) on{' '}
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{sub.challenge?.title}</h3>
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
                    {sub.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                    <span>{sub.status}</span>
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Student Proof Report:</p>
                  <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-normal">
                    {sub.proofText}
                  </p>

                  {sub.proofFileUrl && (
                    <div className="pt-2">
                      <a
                        href={sub.proofFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Inspect Attached Evidence Link / Photo</span>
                      </a>
                    </div>
                  )}
                </div>

                {sub.feedback && (
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-slate-700">
                    <p className="font-bold text-emerald-900">Recorded Feedback:</p>
                    <p className="italic">{sub.feedback}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <Award className="w-4 h-4" />
                    <span>Reward Value: +{sub.challenge?.pointsReward} Points</span>
                  </div>

                  {isPending && (
                    <button
                      onClick={() => handleOpenReview(sub)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition"
                    >
                      Evaluate Submission
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={Boolean(activeSubmission)}
        onClose={() => setActiveSubmission(null)}
        title="Review & Verify Student Activity"
        maxWidth="max-w-xl"
      >
        {activeSubmission && (
          <form onSubmit={handleSaveReview} className="space-y-5">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <p>
                <strong>Student:</strong> {activeSubmission.student?.name} (
                {activeSubmission.student?.email})
              </p>
              <p>
                <strong>Challenge:</strong> {activeSubmission.challenge?.title}
              </p>
              <p>
                <strong>Points on Approval:</strong> +{activeSubmission.challenge?.pointsReward} pts
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Evaluation Decision
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewStatus('approved')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    reviewStatus === 'approved'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Approve & Award Points</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatus('rejected')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    reviewStatus === 'rejected'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Reject & Request Changes</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Feedback for Student (Optional)
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share encouraging remarks or explain what details were missing..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveSubmission(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm disabled:opacity-60"
              >
                {submittingReview ? 'Recording Decision...' : 'Confirm Decision'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ChallengeSubmissionsReview;
