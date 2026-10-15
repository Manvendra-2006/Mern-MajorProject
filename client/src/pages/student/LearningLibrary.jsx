import React, { useState, useEffect } from 'react';
import { resourceApi } from '../../services/resource.api';
import { Modal } from '../../components/common/Modal';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import { BookMarked, Search, Clock, Users, ArrowRight, BookOpen } from 'lucide-react';

const LearningLibrary = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [readingResource, setReadingResource] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedTopic) params.topic = selectedTopic;
        if (selectedAudience) params.targetAudience = selectedAudience;

        const res = await resourceApi.getResources(params);
        if (res.success && res.data) {
          setResources(res.data);
        }
      } catch (err) {
        console.error('Failed to load resources', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [search, selectedTopic, selectedAudience]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BookMarked className="w-8 h-8 text-emerald-600" />
          <span>Environmental Learning Library</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Explore curated scientific articles, composting guides, carbon cycle explanations, and practical conservation frameworks.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search articles & topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Topics</option>
            <option value="Climate Awareness">Climate Awareness</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Water Conservation">Water Conservation</option>
            <option value="Energy Saving">Energy Saving</option>
          </select>
        </div>

        <div>
          <select
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Audience Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No resources found"
          description="Try broadening your topic or search keyword filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div
              key={resource._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {resource.topic}
                  </span>
                  <span className="font-semibold text-slate-500">{resource.targetAudience}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">{resource.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {resource.shortDescription}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{resource.estimatedMinutes} min read</span>
                </div>

                <button
                  onClick={() => setReadingResource(resource)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Article</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Reader Modal */}
      <Modal
        isOpen={Boolean(readingResource)}
        onClose={() => setReadingResource(null)}
        title={readingResource?.title || 'Learning Resource'}
        maxWidth="max-w-3xl"
      >
        {readingResource && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-xs border-b border-slate-100 pb-4">
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {readingResource.topic}
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {readingResource.estimatedMinutes} min read
              </span>
              <span className="text-slate-500">
                Level: {readingResource.targetAudience}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 italic">
              {readingResource.shortDescription}
            </div>

            <div className="prose prose-slate max-w-none text-sm text-slate-700 whitespace-pre-line leading-relaxed font-normal">
              {readingResource.content}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setReadingResource(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Done Reading
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LearningLibrary;
