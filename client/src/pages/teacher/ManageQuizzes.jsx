import React, { useState, useEffect } from 'react';
import { quizApi } from '../../services/quiz.api';
import { useToast } from '../../context/ToastContext';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { CardSkeleton, EmptyState } from '../../components/common/Skeleton';
import { BookOpen, Plus, Trash2, Award, Clock, PlusCircle, Check } from 'lucide-react';

const ManageQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Quiz Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('Climate Awareness');
  const [difficulty, setDifficulty] = useState('Medium');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);
  const [passingScore, setPassingScore] = useState(60);
  const [pointsReward, setPointsReward] = useState(30);

  // Questions Array
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
    },
  ]);

  const { showToast } = useToast();

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await quizApi.getQuizzes({ limit: 50 });
      if (res.success && res.data) {
        setQuizzes(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load quizzes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleOpenCreate = () => {
    setTitle('');
    setDescription('');
    setTopic('Climate Awareness');
    setDifficulty('Medium');
    setTimeLimitMinutes(10);
    setPassingScore(60);
    setPointsReward(30);
    setQuestions([
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
      },
    ]);
    setModalOpen(true);
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length <= 1) {
      showToast('A quiz must have at least one question.', 'warning');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx, text) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx].questionText = text;
      return copy;
    });
  };

  const handleOptionChange = (qIdx, oIdx, val) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].options[oIdx] = val;
      return copy;
    });
  };

  const handleCorrectOptionChange = (qIdx, correctIdx) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].correctOptionIndex = correctIdx;
      return copy;
    });
  };

  const handleExplanationChange = (qIdx, text) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].explanation = text;
      return copy;
    });
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        showToast(`Question ${i + 1} text is required.`, 'warning');
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        showToast(`All 4 options must be filled for Question ${i + 1}.`, 'warning');
        return;
      }
      if (!q.explanation.trim()) {
        showToast(`Explanation is required for Question ${i + 1}.`, 'warning');
        return;
      }
    }

    setSaving(true);
    try {
      await quizApi.createQuiz({
        title,
        description,
        topic,
        difficulty,
        timeLimitMinutes: Number(timeLimitMinutes),
        passingScore: Number(passingScore),
        pointsReward: Number(pointsReward),
        xpReward: Number(pointsReward),
        questions,
      });

      showToast('Quiz created successfully.', 'success');
      setModalOpen(false);
      await fetchQuizzes();
    } catch (err) {
      showToast(err.message || 'Failed to create quiz', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await quizApi.deleteQuiz(deleteTargetId);
      showToast('Quiz deactivated.', 'info');
      await fetchQuizzes();
    } catch (err) {
      showToast(err.message || 'Failed to deactivate quiz', 'error');
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
            <BookOpen className="w-8 h-8 text-emerald-600" />
            <span>Manage Environmental Quizzes</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Build pedagogical assessments, calibrate scoring thresholds, and publish answer explanations.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No quizzes available"
          description="Create your first quiz above to evaluate student environmental literacy."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Quiz Title</th>
                  <th className="py-3.5 px-6">Topic</th>
                  <th className="py-3.5 px-6">Difficulty</th>
                  <th className="py-3.5 px-6">Time Limit</th>
                  <th className="py-3.5 px-6">Passing Score</th>
                  <th className="py-3.5 px-6">Reward</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quizzes.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{q.title}</td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-[10px] uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {q.topic}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{q.difficulty}</td>
                    <td className="py-4 px-6 text-slate-500">{q.timeLimitMinutes} mins</td>
                    <td className="py-4 px-6 font-bold text-slate-700">{q.passingScore}%</td>
                    <td className="py-4 px-6 font-extrabold text-emerald-700">+{q.pointsReward} pts</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setDeleteTargetId(q._id)}
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

      {/* Create Quiz Modal with Dynamic Question Builder */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Environmental Science Quiz"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveQuiz} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Quiz Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ocean Acidification & Marine Carbon Sinks"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Time (Mins)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Reward Pts
                </label>
                <input
                  type="number"
                  min={5}
                  max={500}
                  required
                  value={pointsReward}
                  onChange={(e) => setPointsReward(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Description
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summarize the learning goals of this assessment..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="border-t border-slate-200 pt-5 space-y-5">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-900">
                Questions ({questions.length})
              </h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-700">Question {qIdx + 1}</span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Enter the question prompt..."
                    value={q.questionText}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  {/* 4 Options */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">
                      4 Options (Select Radio for the Correct Answer):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`flex items-center gap-2 p-2 rounded-xl border bg-white ${
                            q.correctOptionIndex === oIdx
                              ? 'border-emerald-500 ring-1 ring-emerald-500'
                              : 'border-slate-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct_opt_${qIdx}`}
                            checked={q.correctOptionIndex === oIdx}
                            onChange={() => handleCorrectOptionChange(qIdx, oIdx)}
                            className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                          />
                          <input
                            type="text"
                            required
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                            className="w-full text-xs outline-none bg-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Scientific Explanation (Displayed after student submission):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Explain why the correct answer is valid..."
                      value={q.explanation}
                      onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
              {saving ? 'Publishing...' : 'Publish Quiz'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Deactivate Quiz"
        message="Are you sure you want to deactivate this quiz? It will no longer appear for student attempts."
        danger={true}
        confirmText="Deactivate"
      />
    </div>
  );
};

export default ManageQuizzes;
