import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import Timeline from '../../components/Timeline';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Eye,
  AlertCircle,
  Calendar,
  Building2,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

export default function ExperienceModeration() {
  const [experiences, setExperiences] = useState([]);
  const [activeTab, setActiveTab] = useState('Pending Review');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedExp, setSelectedExp] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();

  const fetchModerationQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/officer/moderation', {
        params: { status: activeTab },
      });
      if (res.data.success) {
        setExperiences(res.data.experiences || []);
      }
    } catch (err) {
      console.error('Failed to load moderation list:', err);
      toast.error('Failed to load interview experience queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationQueue();
  }, [activeTab]);

  const handleApprove = async (exp) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/officer/moderation/${exp._id}`, {
        status: 'Approved',
      });
      if (res.data.success) {
        toast.success(`Interview experience for ${exp.companyId?.name} approved and published!`);
        if (isDetailModalOpen) setIsDetailModalOpen(false);
        fetchModerationQueue();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve experience.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPrompt = (exp) => {
    setSelectedExp(exp);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is mandatory.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.put(`/officer/moderation/${selectedExp._id}`, {
        status: 'Rejected',
        rejectionReason: rejectionReason.trim(),
      });
      if (res.data.success) {
        toast.success('Interview experience rejected with feedback for student.');
        setIsRejectModalOpen(false);
        if (isDetailModalOpen) setIsDetailModalOpen(false);
        fetchModerationQueue();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject experience.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interview Experience Moderation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review peer interview submissions, inspect technical questions, verify attached PDFs, and publish to the public directory
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {['Pending Review', 'Approved', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab}</span>
            {tab === 'Pending Review' && experiences.length > 0 && activeTab === tab && (
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-bold">
                {experiences.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse h-48" />
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Submissions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            There are currently no interview experiences under "{activeTab}".
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">{exp.companyId?.name}</h3>
                  <Badge status={exp.jobRole} label={exp.jobRole} />
                  <Badge status={exp.difficultyLevel} />
                  <Badge status={exp.status} />
                </div>

                <p className="text-xs text-slate-500">
                  Author: <span className="font-bold text-slate-800">{exp.studentId?.name}</span> ({exp.studentId?.rollNumber} • {exp.studentId?.department}) • Submitted: {new Date(exp.createdAt).toLocaleDateString()}
                </p>

                <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "{exp.overallExperience}"
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>{exp.rounds?.length || 0} Interview Rounds</span>
                  {exp.pdfAttachment && (
                    <span className="text-blue-600 font-semibold flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> PDF Attached ({exp.pdfAttachment.originalName})
                    </span>
                  )}
                </div>

                {exp.status === 'Rejected' && exp.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>Rejection Feedback:</strong> {exp.rejectionReason}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setSelectedExp(exp);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4" /> Inspect Questions
                </button>

                {activeTab === 'Pending Review' && (
                  <>
                    <button
                      onClick={() => handleApprove(exp)}
                      disabled={actionLoading}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleRejectPrompt(exp)}
                      disabled={actionLoading}
                      className="w-full sm:w-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Inspection Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Inspect Submission: ${selectedExp?.companyId?.name} (${selectedExp?.jobRole})`}
        maxWidth="max-w-4xl"
      >
        {selectedExp && (
          <div className="space-y-6 text-xs">
            {/* Student & Selection Info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Student Name</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedExp.studentId?.name}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Roll No & Dept</p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedExp.studentId?.rollNumber} ({selectedExp.studentId?.department})
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Academic Year</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedExp.driveId?.academicYear}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Difficulty</p>
                <p className="mt-0.5"><Badge status={selectedExp.difficultyLevel} /></p>
              </div>
            </div>

            {/* Narrative & Strategy */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Overall Experience Narrative</h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                {selectedExp.overallExperience}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Preparation Strategy & Tips</h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                {selectedExp.preparationStrategy}
              </p>
              {selectedExp.tips && (
                <p className="text-slate-600 mt-2 italic bg-blue-50/50 p-3 rounded-xl border border-blue-100/60">
                  Tips: {selectedExp.tips}
                </p>
              )}
            </div>

            {/* Attached PDF Preview */}
            {selectedExp.pdfAttachment?.filePath && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-950 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Uploaded PDF Document: {selectedExp.pdfAttachment.originalName}
                  </p>
                  <p className="text-[11px] text-blue-800/80 mt-0.5">
                    Verified PDF uploaded by student author
                  </p>
                </div>
                <a
                  href={selectedExp.pdfAttachment.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> View / Download PDF
                </a>
              </div>
            )}

            {/* Round-wise Timeline */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-3">
                Structured Interview Rounds & Questions ({selectedExp.rounds?.length || 0})
              </h4>
              <Timeline rounds={selectedExp.rounds} />
            </div>

            {/* Actions in Modal */}
            {selectedExp.status === 'Pending Review' && (
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleRejectPrompt(selectedExp)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs border border-rose-200"
                >
                  Reject Submission
                </button>
                <button
                  onClick={() => handleApprove(selectedExp)}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Approve & Publish Experience
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Experience Submission"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-xs text-slate-600">
            Please provide constructive feedback or reason for rejection so{' '}
            <strong>{selectedExp?.studentId?.name}</strong> can rectify and resubmit:
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rejection Reason / Feedback *
            </label>
            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please provide more details on Round 2 technical questions and explain the approach..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
            >
              {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
