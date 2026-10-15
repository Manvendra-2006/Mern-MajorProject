import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart, Shield, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Leaf className="w-4 h-4 fill-current" />
              </div>
              <span className="font-bold text-lg text-white">EcoQuest</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering students and schools to take measurable climate action through interactive challenges and gamified environmental learning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/challenges" className="hover:text-emerald-400 transition">Challenges Catalog</Link></li>
              <li><Link to="/quizzes" className="hover:text-emerald-400 transition">Environmental Quizzes</Link></li>
              <li><Link to="/leaderboard" className="hover:text-emerald-400 transition">Campus Leaderboards</Link></li>
              <li><Link to="/resources" className="hover:text-emerald-400 transition">Learning Library</Link></li>
            </ul>
          </div>

          {/* Educational Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-emerald-400 transition">Student Login</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition">Teacher Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition">Institution Admin</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition">Our Impact Methodology</Link></li>
            </ul>
          </div>

          {/* Security & Reliability */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Trust & Ethics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Auditable Points Ledger</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>Zero AI / Rule-based System</span>
              </div>
              <p className="text-xs text-slate-500 pt-2">
                Built strictly with open web standards for schools, colleges, and sustainability clubs.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EcoQuest. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with care for a greener planet <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
