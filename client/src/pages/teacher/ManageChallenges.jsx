import React, { useState, useEffect } from 'react';
import { challengeApi } from '../../services/challenge.api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/Modal';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  Award,
  CheckCircle2,
  Search,
} from 'lucide-react';

const CATEGORIES = [
  'Waste Management',
  'Water Conservation',
  'Energy Saving',
  'Tree Plantation',
  'Biodiversity',
  'Sustainable Transportation',
  'Plastic Reduction',
  'Climate Awareness',
];

const ManageChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState('Medium');
  const [pointsReward, setPointsReward] = useState(50);
  const [instructions, setInstructions] = useState('');
  const [submissionRequirements, setSubmissionRequirements] = useState(
    'Please describe the actions taken and lessons learned during this challenge.'
  );

  const { showToast } = useToast();

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await challengeApi.getChallenges({ limit: 50 });
      if (res.success && res.data) {
        setChallenges(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load challenges', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleOpenCreate = () => {
    setEditingChallenge(null);
    setTitle('');
    setDescription('');
    setCategory(CATEGORIES[0]);
    setDifficulty('Medium');
    setPointsReward(50);
    setInstructions('');
    setSubmissionRequirements(
      'Please describe the actions taken and lessons learned during this challenge.'
    );
    setModalOpen(true);
  };

  const handleOpenEdit = (ch) => {
    setEditingChallenge(ch);
    setTitle(ch.title);
    setDescription(ch.description);
    setCategory(ch.category);
    setDifficulty(ch.difficulty);
    setPointsReward(ch.pointsReward);
    setInstructions(ch.instructions);
    setSubmissionRequirements(ch.submissionRequirements);
    setModalOpen(true);
  };

  const handleSaveChallenge = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      description,
      category,
      difficulty,
      pointsReward: Number(pointsReward),
      xpReward: Number(pointsReward),
      instructions,
      submissionRequirements,
    };

    try {
      if (editingChallenge) {
        await challengeApi.updateChallenge(editingChallenge._id, payload);
        showToast('Challenge updated successfully.', 'success');
      } else {
        await challengeApi.createChallenge(payload);
        showToast('Challenge created and published successfully.', 'success');
      }
      setModalOpen(false);
      await fetchChallenges();
    } catch (err) {
      showToast(err.message || 'Failed to save challenge', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await challengeApi.deleteChallenge(deleteTargetId);
      showToast('Challenge deactivated.', 'info');
      await fetchChallenges();
    } catch (err) {
      showToast(err.message || 'Failed to deactivate challenge', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Compass className="w-8 h-8 text-emerald-600" />
            <span>Manage Environmental Challenges</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Author and publish hands-on climate challenges across your campus community.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Challenge</span>
        </button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : challenges.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No challenges found"
          description="Click above to create your first campus environmental challenge."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Challenge Title</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Difficulty</th>
                  <th className="py-3.5 px-6">Points</th>
                  <th className="py-3.5 px-6">Author</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challenges.map((ch) => (
                  <tr key={ch._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{ch.title}</td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-[10px] uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {ch.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-semibold">{ch.difficulty}</td>
                    <td className="py-4 px-6 font-extrabold text-emerald-700">+{ch.pointsReward} pts</td>
                    <td className="py-4 px-6 text-slate-500">{ch.creator?.name || 'Faculty'}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(ch)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(ch._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Deactivate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingChallenge ? 'Edit Environmental Challenge' : 'Create Environmental Challenge'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveChallenge} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Challenge Title (Min 5 chars)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Single-Use Plastic Elimination Sprint"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Points Reward
              </label>
              <input
                type="number"
                min={5}
                max={1000}
                required
                value={pointsReward}
                onChange={(e) => setPointsReward(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Short Description (Min 20 chars)
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the environmental rationale and scope of the challenge..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Action Instructions (Steps to complete)
            </label>
            <textarea
              required
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="1. Audit current consumption...&#10;2. Implement alternative method...&#10;3. Calculate savings..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Submission Requirements (Guidance for students)
            </label>
            <input
              type="text"
              required
              value={submissionRequirements}
              onChange={(e) => setSubmissionRequirements(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow"
            >
              {saving ? 'Saving...' : editingChallenge ? 'Update Challenge' : 'Publish Challenge'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Deactivate Environmental Challenge"
        message="Are you sure you want to deactivate this challenge? It will no longer appear in the student challenge catalog."
        danger={true}
        confirmText="Deactivate"
      />
    </div>
  );
};

export default ManageChallenges;
