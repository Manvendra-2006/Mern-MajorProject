import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { challengeApi } from '../../services/challenge.api';
import { submissionApi } from '../../services/submission.api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import {
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Send,
  Award,
  Calendar,
  FileText,
  Link2,
} from 'lucide-react';

const ChallengeDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Submission Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [proofText, setProofText] = useState('');
  const [proofFileUrl, setProofFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchChallenge = async () => {
    setLoading(true);
    try {
      const res = await challengeApi.getChallengeById(id);
      if (res.success && res.data) {
        setChallenge(res.data);
        if (res.data.userSubmission) {
          setProofText(res.data.userSubmission.proofText || '');
          setProofFileUrl(res.data.userSubmission.proofFileUrl || '');
        }
      }
    } catch (e) {
      setError(e.message || 'Failed to load challenge details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (proofText.trim().length < 20) {
      showToast('Please provide at least 20 characters describing your activity.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submissionApi.submitChallenge({
        challengeId: id,
        proofText,
        proofFileUrl,
      });

      showToast(res.message || 'Challenge submitted successfully! Awaiting review.', 'success');
      setModalOpen(false);
      await fetchChallenge();
      await refreshUser();
    } catch (err) {
      showToast(err.message || 'Failed to submit challenge proof', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <CardSkeleton />;
  }

  if (error || !challenge) {
    return (
      <EmptyState
        icon={Compass}
        title="Challenge Not Found"
        description={error || 'The requested environmental challenge does not exist.'}
      />
    );
  }

  const submission = challenge.userSubmission;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        to="/challenges"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Challenges Catalog</span>
      </Link>

      {/* Main Challenge Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Header badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              {challenge.category}
            </span>
            <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-xl">
              {challenge.difficulty} Difficulty
            </span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-extrabold text-sm">
            <span>⚡ +{challenge.pointsReward} Points</span>
            <span className="text-amber-400">|</span>
            <span>+{challenge.xpReward || challenge.pointsReward} XP</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {challenge.title}
          </h1>
          <p className="text-slate-600 leading-relaxed text-base whitespace-pre-line">
            {challenge.description}
          </p>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
          <h3 className="text-sm font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>Action Instructions</span>
          </h3>
          <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed font-normal">
            {challenge.instructions}
          </p>
        </div>

        {/* Submission Requirements Guidance */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
            Submission Requirements
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {challenge.submissionRequirements}
          </p>
        </div>

        {/* Current Submission State / CTA */}
        <div className="pt-6 border-t border-slate-100">
          {submission ? (
            <div className="p-6 rounded-2xl border space-y-3 bg-slate-50 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Your Submission Status</span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 uppercase ${
                    submission.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : submission.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {submission.status === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                  {submission.status === 'pending' && <Clock className="w-4 h-4" />}
                  {submission.status === 'rejected' && <AlertTriangle className="w-4 h-4" />}
                  <span>{submission.status}</span>
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">Submitted Proof:</p>
                <p className="text-sm text-slate-800 mt-1 whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200">
                  {submission.proofText}
                </p>
              </div>

              {submission.feedback && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-emerald-800">Teacher Feedback:</p>
                  <p className="text-xs text-slate-700 italic mt-0.5">{submission.feedback}</p>
                </div>
              )}

              {submission.status === 'approved' && (
                <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>+{submission.pointsAwarded} Points Awarded to your ledger!</span>
                </div>
              )}

              {submission.status === 'rejected' && (
                <div className="pt-2">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Resubmit with Corrections
                  </button>
                </div>
              )}
            </div>
          ) : isAuthenticated && user.role === 'student' ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/70 border border-emerald-200 p-6 rounded-2xl">
              <div>
                <h4 className="text-sm font-bold text-emerald-950">Ready to complete this quest?</h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Submit your activity description and receive teacher review to earn {challenge.pointsReward} points.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Activity Proof</span>
              </button>
            </div>
          ) : (
            <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-sm text-slate-600 font-medium">
                Log in as a student to participate and submit proof for this challenge.
              </p>
              <Link
                to="/login"
                className="inline-block px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
              >
                Sign In to Participate
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Submission Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Submit Proof: ${challenge.title}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitProof} className="space-y-4">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
            <strong>Requirements:</strong> {challenge.submissionRequirements}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Activity Description & Results (Min 20 characters)
            </label>
            <textarea
              required
              rows={5}
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              placeholder="Detail what steps you took, where and when the activity occurred, and your estimated impact..."
              className="w-full p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Characters: {proofText.length} / 20 required
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Proof Link / Photo URL (Optional)
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                value={proofFileUrl}
                onChange={(e) => setProofFileUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://imgur.com/..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || proofText.trim().length < 20}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              {submitting ? 'Submitting...' : 'Submit Proof'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChallengeDetail;
