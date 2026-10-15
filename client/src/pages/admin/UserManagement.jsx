import React, { useState, useEffect } from 'react';
import  adminApi  from '../../services/auth.api';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../../components/common/Modal';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import { Users, Search, Shield, UserX, UserCheck, AlertTriangle } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await adminApi.getUsers(params);
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load user directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    try {
      const res = await adminApi.toggleUserStatus(selectedUser._id);
      showToast(res.message || 'User status updated successfully.', 'success');
      await fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to change user account status', 'error');
    } finally {
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Users className="w-8 h-8 text-purple-600" />
          <span>User Directory & Access Control</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Inspect registered platform users, monitor institutional affiliations, and manage account authorization status.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by name, email, or institution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <CardSkeleton />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try clearing your search query or role filters."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">School / Institution</th>
                  <th className="py-3.5 px-6">Points / Level</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'teacher'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {u.schoolOrCollege || '—'}
                    </td>
                    <td className="py-4 px-6">
                      {u.role === 'student' ? (
                        <div className="font-semibold text-slate-800">
                          ⚡ {u.totalPoints || 0} pts <span className="text-slate-400 text-[10px]">(Lvl {u.level || 1})</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                          u.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        onConfirm={handleToggleStatus}
        title={selectedUser?.isActive ? 'Deactivate Account' : 'Reactivate Account'}
        message={
          selectedUser?.isActive
            ? `Are you sure you want to deactivate ${selectedUser?.name}'s account? They will be unable to log in until reactivated.`
            : `Reactivate ${selectedUser?.name}'s account? They will regain access to EcoQuest.`
        }
        danger={selectedUser?.isActive}
        confirmText={selectedUser?.isActive ? 'Deactivate User' : 'Activate User'}
      />
    </div>
  );
};

export default UserManagement;
