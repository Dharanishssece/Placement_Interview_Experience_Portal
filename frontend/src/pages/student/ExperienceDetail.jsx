import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Timeline from '../../components/Timeline';
import {
  Compass,
  ArrowLeft,
  Building2,
  Calendar,
  ThumbsUp,
  Bookmark,
  Download,
  ShieldCheck,
  User,
  GraduationCap,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export default function ExperienceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votedHelpful, setVotedHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/student/experiences/${id}`);
        if (res.data.success) {
          const exp = res.data.experience;
          setExperience(exp);
          setHelpfulCount(exp.helpfulCount || 0);
          setIsBookmarked(!!exp.isBookmarked);
        }
      } catch (err) {
        toast.error('Failed to load interview experience.');
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [id]);

  const handleVoteHelpful = async () => {
    if (votedHelpful) return;
    try {
      const res = await api.post(`/student/experiences/${id}/helpful`);
      if (res.data.success) {
        setHelpfulCount(res.data.helpfulCount);
        setVotedHelpful(true);
        toast.success('Thank you! Your feedback helps your fellow students.');
      }
    } catch (err) {
      toast.error('Failed to record vote.');
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      toast.info('Please sign in to save bookmarks.');
      return;
    }
    try {
      const res = await api.post(`/student/bookmarks/${id}`);
      if (res.data.success) {
        setIsBookmarked(res.data.bookmarked);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update bookmark.');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading interview debrief...</div>;
  }

  if (!experience) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-bold text-slate-700">Interview experience not found.</p>
        <Link to="/student/experiences" className="text-xs text-blue-600 underline mt-2 block">
          Return to Experience Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        to="/student/experiences"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Experience Directory
      </Link>

      {/* Main Experience Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {experience.companyId?.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Experience
              </span>
              <Badge status={experience.difficultyLevel} />
            </div>

            <p className="text-base font-bold text-blue-600 mt-1">{experience.jobRole}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Placement Drive Academic Year: {experience.driveId?.academicYear || '2025-2026'} • Selection Year: {experience.selectionYear}
            </p>
          </div>

          {/* Bookmark & Helpful Actions */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {user?.role === 'student' && (
              <button
                onClick={handleToggleBookmark}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                  isBookmarked
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
              </button>
            )}

            <button
              onClick={handleVoteHelpful}
              disabled={votedHelpful}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                votedHelpful
                  ? 'bg-blue-50 border-blue-300 text-blue-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${votedHelpful ? 'fill-current' : ''}`} />
              <span>{helpfulCount} Helpful</span>
            </button>
          </div>
        </div>

        {/* Student Author Profile Info */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 text-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
            {experience.studentId?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="font-bold text-slate-900">{experience.studentId?.name}</p>
            <p className="text-slate-500 text-[11px]">
              Roll No: {experience.studentId?.rollNumber} • Department of {experience.studentId?.department} • Batch {experience.studentId?.batch || '2022-2026'}
            </p>
          </div>
        </div>

        {/* Overall Narrative */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Overall Recruitment Experience</h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {experience.overallExperience}
          </p>
        </div>

        {/* Preparation Strategy */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Preparation Strategy & Resources</h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {experience.preparationStrategy}
          </p>
        </div>

        {/* Tips for Candidates */}
        {experience.tips && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Tips for Future Candidates</h3>
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950 leading-relaxed">
              {experience.tips}
            </div>
          </div>
        )}

        {/* PDF Attachment (If available) */}
        {experience.pdfAttachment?.filePath && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-600" />
                Supporting PDF Document: {experience.pdfAttachment.originalName}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Uploaded notes, problem diagrams, and technical summary
              </p>
            </div>
            <a
              href={experience.pdfAttachment.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs self-start sm:self-center"
            >
              <Download className="w-3.5 h-3.5" /> View / Download PDF
            </a>
          </div>
        )}
      </div>

      {/* Round-wise Timeline with Questions & Explanations */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Round-wise Interview Questions Timeline ({experience.rounds?.length || 0})
            </h2>
            <p className="text-xs text-slate-500">
              Detailed technical questions, DSA topics, and suggested approaches from the interview
            </p>
          </div>
        </div>

        <Timeline rounds={experience.rounds} />
      </div>
    </div>
  );
}
