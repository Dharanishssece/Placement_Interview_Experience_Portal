import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import {
  CheckSquare,
  Plus,
  Building2,
  Calendar,
  CheckCircle2,
  Circle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export default function PreparationTrackerPage() {
  const [trackers, setTrackers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const toast = useToast();

  const fetchTrackers = async () => {
    try {
      setLoading(true);
      const [trkRes, compRes] = await Promise.all([
        api.get('/student/prep-trackers'),
        api.get('/director/companies', { params: { limit: 100 } }),
      ]);

      if (trkRes.data.success) setTrackers(trkRes.data.trackers || []);
      if (compRes.data.success) {
        setCompanies(compRes.data.companies || []);
        if (compRes.data.companies?.length > 0) {
          setSelectedCompanyId(compRes.data.companies[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load trackers:', err);
      toast.error('Failed to load preparation trackers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackers();
  }, []);

  const handleCreateTracker = async (e) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      toast.error('Please select a target company.');
      return;
    }

    try {
      setFormLoading(true);
      const res = await api.post('/student/prep-trackers', {
        companyId: selectedCompanyId,
        targetRole,
        targetDate: targetDate || null,
        notes,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setIsAddModalOpen(false);
        fetchTrackers();
      }
    } catch (err) {
      if (err.response?.status === 409) {
        toast.info('You already have a preparation plan for this company.');
      } else {
        toast.error('Failed to create tracker.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleTask = async (trackerId, taskId) => {
    try {
      const res = await api.put(`/student/prep-trackers/${trackerId}/tasks/${taskId}`);
      if (res.data.success) {
        setTrackers((prev) =>
          prev.map((t) => (t._id === trackerId ? res.data.tracker : t))
        );
      }
    } catch (err) {
      toast.error('Failed to update task.');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading your preparation roadmaps...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Personal Preparation Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build target-company preparation roadmaps and track your DSA, Core Subjects, and Interview question readiness
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Add Target Company Plan
        </button>
      </div>

      {trackers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Target Company Plans Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Select a campus recruiting partner (e.g. Google, Microsoft, Zoho) and generate a structured preparation checklist.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700"
          >
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {trackers.map((trk) => {
            const total = trk.tasks?.length || 0;
            const completed = trk.tasks?.filter((t) => t.completed).length || 0;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div
                key={trk._id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-6"
              >
                {/* Plan Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900">{trk.companyId?.name}</h2>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {trk.targetRole}
                      </span>
                    </div>
                    {trk.targetDate && (
                      <p className="text-xs text-slate-400">
                        Target Recruitment Date: {new Date(trk.targetDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Progress Ring / Percentage */}
                  <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Preparation Progress</p>
                      <p className="text-base font-extrabold text-blue-600">{pct}% Ready</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-blue-100 flex items-center justify-center relative">
                      <div
                        className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent absolute animate-spin"
                        style={{ animationDuration: '0s', transform: `rotate(${pct * 3.6}deg)` }}
                      />
                      <span className="text-xs font-bold text-slate-800">{pct}%</span>
                    </div>
                  </div>
                </div>

                {/* Checklist Tasks */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Roadmap Milestones ({completed}/{total} Completed)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {trk.tasks?.map((task) => (
                      <div
                        key={task._id}
                        onClick={() => handleToggleTask(trk._id, task._id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          task.completed
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-white text-slate-800'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <p
                            className={`text-xs font-semibold leading-snug ${
                              task.completed ? 'line-through text-slate-500' : ''
                            }`}
                          >
                            {task.title}
                          </p>
                          <span className="text-[10px] font-medium text-slate-400 block mt-1">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Company Link */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <Link
                    to={`/student/companies/${trk.companyId?._id}`}
                    className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <BookOpen className="w-4 h-4" /> View Verified Questions for {trk.companyId?.name} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Plan Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Target Company Preparation Plan">
        <form onSubmit={handleCreateTracker} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Company *</label>
            <select
              required
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            >
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.tier})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Job Role *</label>
            <input
              type="text"
              required
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Software Development Engineer"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Drive Date (Optional)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Personal Goals / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on Trees, DP, and SQL normalization..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              {formLoading ? 'Creating Roadmap...' : 'Generate Roadmap'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
