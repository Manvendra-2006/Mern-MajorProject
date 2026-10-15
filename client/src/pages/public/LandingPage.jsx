import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { challengeApi } from '../../services/challenge.api';
import {
  Leaf,
  Compass,
  BookOpen,
  Trophy,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Award,
  Users,
  CheckCircle2,
} from 'lucide-react';

const LandingPage = () => {
  const [featuredChallenges, setFeaturedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await challengeApi.getChallenges({ limit: 3 });
        if (res.success && res.data) {
          setFeaturedChallenges(res.data);
        }
      } catch (err) {
        console.error('Could not load featured challenges', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold tracking-wide uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Next-Gen Climate Action for Schools & Colleges</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Turn Environmental Awareness Into{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                Measurable Action
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              EcoQuest empowers students, teachers, and institutions with verified practical challenges, structured environmental quizzes, auditable points ledgers, and competitive campus leaderboards.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/challenges"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-sm transition flex items-center justify-center gap-2"
              >
                <Compass className="w-5 h-5 text-emerald-600" />
                <span>Explore Challenges</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center border-t border-slate-200/80 mt-12">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">8+</p>
                <p className="text-xs font-medium text-slate-500 uppercase mt-0.5">Ecological Categories</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">100%</p>
                <p className="text-xs font-medium text-slate-500 uppercase mt-0.5">Auditable Ledger</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">3 Roles</p>
                <p className="text-xs font-medium text-slate-500 uppercase mt-0.5">Student, Teacher, Admin</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">Zero AI</p>
                <p className="text-xs font-medium text-slate-500 uppercase mt-0.5">Strict Logic & Rules</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Decorative Blurs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      </section>

      {/* Core Platform Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Educational Architecture
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How EcoQuest Makes An Impact
          </h3>
          <p className="text-slate-600 text-sm">
            Designed for educational sustainability curricula, pairing rigorous classroom understanding with tangible physical initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Real-World Environmental Challenges</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Students conduct household water audits, lead zero-waste lunches, plant native flora, and submit proof that is verified by teachers.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Scientific Climate Quizzes</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Explore ocean plastics, renewable energy grids, and watershed ecosystems with time-bounded, server-evaluated quizzes and detailed explanations.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Trophy className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Auditable Gamification</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every point is stored in an immutable ledger with unique compound indexing, preventing duplicate claims while calculating XP levels and badges.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Challenges Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Active Quests</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sample Environmental Challenges
            </h3>
          </div>
          <Link
            to="/challenges"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>View All Challenges</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredChallenges.map((challenge) => (
              <div
                key={challenge._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {challenge.category}
                    </span>
                    <span className="font-semibold text-slate-500 uppercase tracking-wider">
                      {challenge.difficulty}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 leading-snug">{challenge.title}</h4>
                  <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 font-extrabold text-emerald-700 text-sm">
                    <span>⚡</span>
                    <span>+{challenge.pointsReward} pts</span>
                  </div>
                  <Link
                    to={`/challenges/${challenge._id}`}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold text-slate-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Gamification Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>Transparent Gamification System</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Earn Points, Level Up Your Eco-Impact, and Unlock Prestigious Badges
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every action you perform is validated with integrity. Complete challenges in Waste Management, Water Conservation, and Tree Plantation to earn badges like <strong>Water Saver</strong>, <strong>Waste Warrior</strong>, and <strong>Consistency Champion</strong>.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
              >
                Join Your School Today
              </Link>
              <Link
                to="/leaderboard"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
