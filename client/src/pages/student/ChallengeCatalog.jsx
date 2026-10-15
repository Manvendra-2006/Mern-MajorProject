import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { challengeApi } from '../../services/challenge.api';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import {
  Compass,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

const ChallengeCatalog = () => {
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await challengeApi.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (selectedDifficulty) params.difficulty = selectedDifficulty;
        if (search) params.search = search;

        const res = await challengeApi.getChallenges(params);
        if (res.success && res.data) {
          setChallenges(res.data);
        }
      } catch (e) {
        console.error('Failed to load challenges', e);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, [selectedCategory, selectedDifficulty, search]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Compass className="w-8 h-8 text-emerald-600" />
            <span>Environmental Challenges</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Undertake verified practical actions in waste, energy, water, biodiversity, and climate stewardship.
          </p>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search challenges by title or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No challenges found"
          description="Try broadening your category or search filters to find available challenges."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => {
            const submission = challenge.userSubmission;

            return (
              <div
                key={challenge._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {challenge.category}
                    </span>
                    <span className="font-semibold text-slate-500 uppercase tracking-wider">
                      {challenge.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{challenge.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 font-extrabold text-emerald-700 text-sm">
                    <span>⚡</span>
                    <span>+{challenge.pointsReward} pts</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* User Submission status tag if applicable */}
                    {submission && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                          submission.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : submission.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {submission.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {submission.status === 'pending' && <Clock className="w-3 h-3" />}
                        {submission.status === 'rejected' && <AlertTriangle className="w-3 h-3" />}
                        <span className="capitalize">{submission.status}</span>
                      </span>
                    )}

                    <Link
                      to={`/challenges/${challenge._id}`}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>{submission?.status === 'approved' ? 'Review' : 'View Quest'}</span>
                      <ArrowRight className="w-3 h-3" />
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

export default ChallengeCatalog;
