import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton } from '../../components/common/Skeleton';
import { User, School, Mail, Shield, Zap, Clock, Award, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [schoolOrCollege, setSchoolOrCollege] = useState(user?.schoolOrCollege || '');
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfileAndLedger = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users/profile');
        if (res.success && res.data) {
          setName(res.data.user.name || '');
          setSchoolOrCollege(res.data.user.schoolOrCollege || '');
          setPointsHistory(res.data.pointsHistory || []);
        }
      } catch (err) {
        console.error('Failed to load profile ledger', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndLedger();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/profile', {
        name,
        schoolOrCollege,
      });
      if (res.success) {
        showToast('Profile information updated successfully.', 'success');
        await refreshUser();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <User className="w-8 h-8 text-emerald-600" />
          <span>My Profile & Points Ledger</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Review your institutional affiliation and inspect your permanent, auditable points transaction history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Account Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-xl shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <span className="text-xs uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address (Verified)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                School or College
              </label>
              <input
                type="text"
                value={schoolOrCollege}
                onChange={(e) => setSchoolOrCollege(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center justify-center gap-2 text-xs shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Update Details'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Ledger Audit Trail */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Auditable Points Ledger</span>
              </h3>
              <p className="text-xs text-slate-500">Every rewarded action is recorded with cryptographic uniqueness</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Current Balance:</span>
              <p className="font-extrabold text-emerald-700 text-base">⚡ {user?.totalPoints || 0} pts</p>
            </div>
          </div>

          {pointsHistory.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No transactions recorded in your points ledger yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Activity Description</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3 text-right">Points</th>
                    <th className="py-3 px-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pointsHistory.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {tx.description}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-emerald-600">
                        +{tx.amount}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-700">
                        {tx.balanceAfter}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
