import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizApi } from '../../services/quiz.api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

const QuizAttemptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Attempt State
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Load Quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const res = await quizApi.getQuizForAttempt(id);
        if (res.success && res.data) {
          setQuiz(res.data);
          setTimeLeftSeconds(res.data.timeLimitMinutes * 60);
        }
      } catch (err) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!quiz || result || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, result, timeLeftSeconds]);

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleAutoSubmit = () => {
    showToast('Time has expired! Submitting your answers automatically.', 'warning');
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);

    try {
      const answersPayload = quiz.questions.map((q) => ({
        questionId: q._id,
        selectedOptionIndex: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : 0,
      }));

      const timeSpent = quiz.timeLimitMinutes * 60 - timeLeftSeconds;

      const res = await quizApi.submitQuizAttempt(id, {
        answers: answersPayload,
        timeSpentSeconds: Math.max(0, timeSpent),
      });

      if (res.success && res.data) {
        setResult(res.data);
        await refreshUser();
        if (res.data.passed) {
          showToast(`Passed! Scored ${res.data.score}%.`, 'success');
        } else {
          showToast(`Completed with ${res.data.score}%. Passing score is ${res.data.passingScore}%.`, 'info');
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit quiz attempt', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CardSkeleton />;
  if (error || !quiz) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Quiz Not Available"
        description={error || 'Could not load the requested quiz.'}
      />
    );
  }

  // Format Timer mm:ss
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // If Quiz is completed, show comprehensive Result View
  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Results Banner */}
        <div
          className={`p-8 rounded-3xl text-white shadow-lg space-y-4 text-center ${
            result.passed
              ? 'bg-gradient-to-tr from-emerald-800 to-green-600'
              : 'bg-gradient-to-tr from-slate-800 to-slate-700'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto text-3xl">
            {result.passed ? '🎉' : '📚'}
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight">
            {result.passed ? 'Quiz Passed Successfully!' : 'Keep Learning & Try Again!'}
          </h2>

          <div className="flex items-center justify-center gap-6 text-sm">
            <div>
              <p className="text-xs font-semibold text-emerald-100 uppercase">Your Score</p>
              <p className="text-2xl font-extrabold">{result.score}%</p>
            </div>
            <div className="border-r border-white/20 h-8" />
            <div>
              <p className="text-xs font-semibold text-emerald-100 uppercase">Correct Answers</p>
              <p className="text-2xl font-extrabold">
                {result.correctCount} / {result.totalQuestions}
              </p>
            </div>
            <div className="border-r border-white/20 h-8" />
            <div>
              <p className="text-xs font-semibold text-emerald-100 uppercase">Points Awarded</p>
              <p className="text-2xl font-extrabold">+{result.pointsAwarded}</p>
            </div>
          </div>

          {result.alreadyRewarded && (
            <p className="text-xs text-amber-200 font-medium">
              Note: You had already earned the completion reward for this quiz on a previous passing attempt.
            </p>
          )}

          <div className="pt-4 flex justify-center gap-3">
            <Link
              to="/student/quizzes"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow hover:bg-slate-50 transition"
            >
              Browse More Quizzes
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setSelectedAnswers({});
                setCurrentQuestionIndex(0);
                setTimeLeftSeconds(quiz.timeLimitMinutes * 60);
              }}
              className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>

        {/* Detailed Per-Question Explanations */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
            Detailed Answers & Environmental Explanations
          </h3>

          <div className="space-y-6">
            {result.explanations.map((exp, idx) => (
              <div
                key={exp.questionId}
                className={`p-5 rounded-2xl border space-y-3 ${
                  exp.isCorrect
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-bold text-xs text-slate-500">Question {idx + 1}</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${
                      exp.isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {exp.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{exp.isCorrect ? 'Correct' : 'Incorrect'}</span>
                  </span>
                </div>

                <p className="font-bold text-sm text-slate-900">{exp.questionText}</p>

                <div className="space-y-1.5 text-xs">
                  {exp.options.map((opt, oIdx) => {
                    const isSelected = exp.selectedOptionIndex === oIdx;
                    const isCorrect = exp.correctOptionIndex === oIdx;

                    let optStyle = 'border-slate-200 bg-white text-slate-700';
                    if (isCorrect) optStyle = 'border-emerald-500 bg-emerald-100/60 text-emerald-900 font-bold';
                    else if (isSelected && !isCorrect) optStyle = 'border-rose-400 bg-rose-100/60 text-rose-900 font-bold';

                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${optStyle}`}
                      >
                        <span>{opt}</span>
                        {isCorrect && <span className="text-[10px] text-emerald-700 font-bold">✓ Correct Answer</span>}
                        {isSelected && !isCorrect && (
                          <span className="text-[10px] text-rose-600 font-bold">✕ Your Answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pedagogical Explanation */}
                <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-emerald-800">💡 Science Behind The Answer:</p>
                  <p className="leading-relaxed">{exp.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz Attempt Flow
  const currentQ = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
  const allAnswered = quiz.questions.every((q) => selectedAnswers[q._id] !== undefined);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Top bar: Title + Timer */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {quiz.topic}
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-1">{quiz.title}</h2>
        </div>

        {/* Live Timer */}
        <div
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-mono font-bold text-sm ${
            timeLeftSeconds < 120
              ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{timeDisplay}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
          <span>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Active Question Card */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <p className="text-lg font-bold text-slate-900 leading-snug">{currentQ.questionText}</p>

        {/* 4 Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQ._id] === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(currentQ._id, idx)}
                className={`w-full text-left p-4 rounded-2xl border transition flex items-center gap-3.5 text-sm font-medium ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 font-bold'
                    : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white text-slate-500'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {/* Pagination & Submit Navigation */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-60"
            >
              {submitting ? 'Grading Answers...' : 'Submit Final Answers'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizAttemptPage;
