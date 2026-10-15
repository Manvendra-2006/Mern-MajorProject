import React from 'react';
import { Leaf, Shield, Award, Users, CheckCircle, GraduationCap } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
          <Leaf className="w-6 h-6 fill-current" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">About EcoQuest</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          An institutional-grade environmental learning platform that transforms climate awareness into verified, student-led physical stewardship.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Pedagogical Rigor</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Quizzes and learning modules adhere to foundational environmental science principles, explaining the biogeochemical mechanisms behind environmental challenges.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Transparent Accountability</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Challenge proofs are verified by faculty reviewers before points are awarded. The transactional points ledger ensures idempotency and zero duplicate incentives.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Motivating Gamification</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Experience points (XP), progressive levels, and badge awards keep students consistently engaged across weeks and academic semesters.
          </p>
        </div>
      </div>

      {/* Architecture Ethos */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-6">
        <h3 className="text-2xl font-bold text-white">Rule-Based Integrity: Zero Generative AI Dependence</h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Unlike modern apps that hallucinate facts through paid LLM integrations, EcoQuest runs entirely on deterministic programming logic, robust database constraints, cryptographic hashing, and verified educational literature.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300 pt-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Server-side quiz score calculations</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Redis-powered OTP rate limiting & cooldowns</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Strict Role-Based Access Control (RBAC)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Zero secrets stored in frontend code</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
