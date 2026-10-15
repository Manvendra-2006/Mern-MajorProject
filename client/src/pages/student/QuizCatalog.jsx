import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizApi } from '../../services/quiz.api';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import {
  BookOpen,
  Search,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const QuizCatalog = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (difficulty) params.difficulty = difficulty;

        const res = await quizApi.getQuizzes(params);
        if (res.success && res.data) {
          setQuizzes(res.data);
        }
      } catch (err) {
        console.error('Failed to load quizzes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [search, difficulty]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-8 h-8 text-emerald-600" />
          <span>Environmental Science Quizzes</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Test your ecological literacy, reinforce climate science concepts, and earn points and badges.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search quizzes by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No quizzes found"
          description="Try clearing your search query or difficulty filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const stats = quiz.userStats;

            return (
              <div
                key={quiz._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {quiz.topic}
                    </span>
                    <span className="font-semibold text-slate-500 uppercase">{quiz.difficulty}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{quiz.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {quiz.description}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {quiz.timeLimitMinutes} mins
                    </span>
                    <span>•</span>
                    <span>Pass: {quiz.passingScore}%</span>
                    <span>•</span>
                    <span>{quiz.questionCount} Questions</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 font-extrabold text-emerald-700 text-sm">
                    <Award className="w-4 h-4" />
                    <span>+{quiz.pointsReward} pts</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {stats?.hasPassed && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Passed ({stats.highestScore}%)</span>
                      </span>
                    )}

                    <Link
                      to={`/quizzes/${quiz._id}/attempt`}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <span>{stats?.attemptsCount > 0 ? 'Retake' : 'Start Quiz'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizCatalog;
