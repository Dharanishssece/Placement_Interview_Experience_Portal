import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import {
  Compass,
  Search,
  Filter,
  Bookmark,
  ThumbsUp,
  Download,
  Eye,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function ExperienceDirectory() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [department, setDepartment] = useState('All');
  const [roundType, setRoundType] = useState('All');
  const [sort, setSort] = useState('newest');

  const toast = useToast();

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/experiences', {
        params: {
          search,
          difficulty: difficulty !== 'All' ? difficulty : undefined,
          department: department !== 'All' ? department : undefined,
          roundType: roundType !== 'All' ? roundType : undefined,
          sort,
          limit: 30,
        },
      });
      if (res.data.success) {
        setExperiences(res.data.experiences || []);
      }
    } catch (err) {
      console.error('Failed to load experiences:', err);
      toast.error('Failed to load interview experiences.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [search, difficulty, department, roundType, sort]);

  const handleToggleBookmark = async (expId) => {
    if (!user) {
      toast.info('Please sign in to bookmark experiences.');
      return;
    }
    try {
      const res = await api.post(`/student/bookmarks/${expId}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setExperiences((prev) =>
          prev.map((e) => (e._id === expId ? { ...e, isBookmarked: res.data.bookmarked } : e))
        );
      }
    } catch (err) {
      toast.error('Failed to update bookmark.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verified Interview Experiences</h1>
        <p className="text-xs text-slate-500 mt-1">
          Learn from real placement interview questions, rounds, and preparation strategies shared by placed seniors
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions, company names, job roles, or algorithmic topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Very Hard">Very Hard</option>
          </select>

          <select
            value={roundType}
            onChange={(e) => setRoundType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="All">All Round Types</option>
            <option value="Coding">Coding Assessment</option>
            <option value="Technical">Technical Round</option>
            <option value="Aptitude">Aptitude</option>
            <option value="HR">HR & Behavioral</option>
            <option value="Managerial">Managerial</option>
          </select>

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="All">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="AIDS">AIDS</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold"
          >
            <option value="newest">Newest First</option>
            <option value="helpful">Most Helpful</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Experiences Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse h-64" />
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Experiences Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No published interview experiences match your query. Try broadening your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiences.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Company, Role, Badges & Bookmark */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900">{exp.companyId?.name}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                        <ShieldCheck className="w-3 h-3 text-blue-600" /> Verified
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">{exp.jobRole}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge status={exp.difficultyLevel} />
                    {user?.role === 'student' && (
                      <button
                        onClick={() => handleToggleBookmark(exp._id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          exp.isBookmarked
                            ? 'bg-amber-50 border-amber-300 text-amber-500'
                            : 'border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-slate-50'
                        }`}
                        title={exp.isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Author Info */}
                <p className="text-[11px] text-slate-400">
                  By {exp.studentId?.name} ({exp.studentId?.department}) • Class of {exp.selectionYear} • {new Date(exp.createdAt).toLocaleDateString()}
                </p>

                {/* Narrative Snippet */}
                <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                  "{exp.overallExperience}"
                </p>

                {/* Round Preview Pill List */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {exp.rounds?.map((r, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                    >
                      {r.roundName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <ThumbsUp className="w-3.5 h-3.5 text-blue-600" /> {exp.helpfulCount || 0} found helpful
                  </span>
                  {exp.pdfAttachment && (
                    <span className="text-blue-600 font-semibold flex items-center gap-1">
                      <Download className="w-3 h-3" /> PDF
                    </span>
                  )}
                </div>

                <Link
                  to={`/student/experiences/${exp._id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  Read Debrief <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
