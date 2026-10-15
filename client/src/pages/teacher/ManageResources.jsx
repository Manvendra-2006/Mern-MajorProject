import React, { useState, useEffect } from 'react';
import { resourceApi } from '../../services/resource.api';
import { useToast } from '../../context/ToastContext';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import { BookMarked, Plus, Trash2, Clock, Users } from 'lucide-react';

const ManageResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Climate Awareness');
  const [shortDescription, setShortDescription] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Levels');
  const [estimatedMinutes, setEstimatedMinutes] = useState(5);

  const { showToast } = useToast();

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await resourceApi.getResources({ limit: 50 });
      if (res.success && res.data) {
        setResources(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleOpenCreate = () => {
    setTitle('');
    setTopic('Climate Awareness');
    setShortDescription('');
    setContent('');
    setTargetAudience('All Levels');
    setEstimatedMinutes(5);
    setModalOpen(true);
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await resourceApi.createResource({
        title,
        topic,
        shortDescription,
        content,
        targetAudience,
        estimatedMinutes: Number(estimatedMinutes),
      });

      showToast('Learning resource published to library.', 'success');
      setModalOpen(false);
      await fetchResources();
    } catch (err) {
      showToast(err.message || 'Failed to create resource', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await resourceApi.deleteResource(deleteTargetId);
      showToast('Resource deleted.', 'info');
      await fetchResources();
    } catch (err) {
      showToast(err.message || 'Failed to delete resource', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookMarked className="w-8 h-8 text-emerald-600" />
            <span>Manage Learning Library</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Author and publish educational modules, scientific guides, and practical ecological articles.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Article</span>
        </button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No resources found"
          description="Publish your first article above to populate the library."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Title</th>
                  <th className="py-3.5 px-6">Topic</th>
                  <th className="py-3.5 px-6">Target Audience</th>
                  <th className="py-3.5 px-6">Reading Time</th>
                  <th className="py-3.5 px-6">Author</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{res.title}</td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-[10px] uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {res.topic}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-semibold">{res.targetAudience}</td>
                    <td className="py-4 px-6 text-slate-500">{res.estimatedMinutes} mins</td>
                    <td className="py-4 px-6 text-slate-500">{res.createdBy?.name || 'Faculty'}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setDeleteTargetId(res._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete"
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

      {/* Create Resource Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Publish Environmental Learning Resource"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveResource} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Article Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Regenerative Agriculture Principles"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Topic
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Audience Level
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Est. Minutes
              </label>
              <input
                type="number"
                min={1}
                max={180}
                required
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Short Description / Abstract (Min 10 chars)
            </label>
            <textarea
              required
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief summary of key concepts..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Article Content (Markdown supported)
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide deep, educational content with scientific facts and practical institutional takeaways..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
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
              {saving ? 'Publishing...' : 'Publish to Library'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Learning Resource"
        message="Are you sure you want to permanently delete this resource from the library?"
        danger={true}
        confirmText="Delete"
      />
    </div>
  );
};

export default ManageResources;
