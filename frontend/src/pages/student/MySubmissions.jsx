import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  ArrowRight,
  UploadCloud,
  Layers,
} from 'lucide-react';

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [selectedExp, setSelectedExp] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    jobRole: '',
    difficultyLevel: 'Medium',
    overallExperience: '',
    preparationStrategy: '',
    tips: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/my-submissions');
      if (res.data.success) {
        setSubmissions(res.data.submissions || []);
      }
    } catch (err) {
      toast.error('Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOpenEdit = (exp) => {
    setSelectedExp(exp);
    setEditFormData({
      jobRole: exp.jobRole || '',
      difficultyLevel: exp.difficultyLevel || 'Medium',
      overallExperience: exp.overallExperience || '',
      preparationStrategy: exp.preparationStrategy || '',
      tips: exp.tips || '',
    });
    setIsEditModalOpen(true);
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.put(`/student/experiences/${selectedExp._id}`, editFormData);
      if (res.data.success) {
        toast.success('Experience updated and resubmitted for officer review!');
        setIsEditModalOpen(false);
        fetchSubmissions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update submission.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading your submissions...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Submissions & Moderation Status</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track review progress, read officer feedback, and edit rejected submissions
          </p>
        </div>

        <Link
          to="/student/submit-experience"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start"
        >
          <UploadCloud className="w-4 h-4" /> Submit Experience
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Experiences Submitted Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            If you have a verified placement record, click below to share your interview questions with juniors.
          </p>
          <Link
            to="/student/submit-experience"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
          >
            Submit Experience
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {submissions.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900">{exp.companyId?.name}</h3>
                    <span className="text-xs font-bold text-blue-600">• {exp.jobRole}</span>
                    <Badge status={exp.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Drive: {exp.driveId?.academicYear} • Submitted on {new Date(exp.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {exp.status === 'Approved' ? (
                    <Link
                      to={`/student/experiences/${exp._id}`}
                      className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> View Published
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleOpenEdit(exp)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Edit className="w-4 h-4" /> Edit & Resubmit
                    </button>
                  )}
                </div>
              </div>

              {/* Moderation Status Banner */}
              {exp.status === 'Pending Review' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Under Review:</strong> Your interview experience is awaiting inspection by the Placement Officer. Once approved, it will be published to the college directory.
                  </div>
                </div>
              )}

              {exp.status === 'Approved' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Published:</strong> This experience has been verified and published! It has received {exp.helpfulCount || 0} helpful votes and {exp.viewCount || 0} views.
                  </div>
                </div>
              )}

              {exp.status === 'Rejected' && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-700">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Revision Requested by Placement Officer:
                  </div>
                  <p className="pl-6 italic text-slate-700">"{exp.rejectionReason || 'Please provide more details on interview questions.'}"</p>
                  <p className="pl-6 text-[11px] text-slate-500 pt-1">
                    Click "Edit & Resubmit" to update the submission according to officer feedback.
                  </p>
                </div>
              )}

              {/* Content Preview */}
              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl">
                <p className="font-semibold text-slate-800 mb-1">Narrative Summary:</p>
                <p className="italic">"{exp.overallExperience}"</p>
                <div className="mt-3 flex items-center gap-4 text-slate-500 text-[11px]">
                  <span>{exp.rounds?.length || 0} Interview Rounds</span>
                  <span>Difficulty: {exp.difficultyLevel}</span>
                  {exp.pdfAttachment && <span>PDF Attached</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Submission Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Experience: ${selectedExp?.companyId?.name}`}
      >
        <form onSubmit={handleResubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Role Title *</label>
            <input
              type="text"
              required
              value={editFormData.jobRole}
              onChange={(e) => setEditFormData({ ...editFormData, jobRole: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Interview Difficulty</label>
            <select
              value={editFormData.difficultyLevel}
              onChange={(e) => setEditFormData({ ...editFormData, difficultyLevel: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Very Hard">Very Hard</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Overall Experience *</label>
            <textarea
              required
              rows={4}
              value={editFormData.overallExperience}
              onChange={(e) => setEditFormData({ ...editFormData, overallExperience: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Preparation Strategy *</label>
            <textarea
              required
              rows={3}
              value={editFormData.preparationStrategy}
              onChange={(e) => setEditFormData({ ...editFormData, preparationStrategy: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tips for Candidates</label>
            <input
              type="text"
              value={editFormData.tips}
              onChange={(e) => setEditFormData({ ...editFormData, tips: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              {actionLoading ? 'Saving...' : 'Update & Resubmit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
