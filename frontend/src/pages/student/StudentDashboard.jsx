import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import SkeletonLoader from '../../components/SkeletonLoader';
import {
  GraduationCap,
  Building2,
  Compass,
  UploadCloud,
  Bookmark,
  CheckSquare,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/dashboard-overview');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <SkeletonLoader count={4} />
      </div>
    );
  }

  const isPlaced = data?.verifiedPlacementsCount > 0;
  const verifiedPlacements = data?.myPlacements?.filter((p) => p.verificationStatus === 'Verified') || [];
  const recentExperiences = data?.recentExperiences || [];
  const bookmarks = data?.bookmarks || [];
  const prepTrackers = data?.prepTrackers || [];

  return (
    <div className="space-y-8">
      {/* Welcome & Eligibility Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/20">
            <GraduationCap className="w-4 h-4 text-emerald-400" /> Class of {user?.batch || '2022-2026'} • {user?.department}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isPlaced ? (
              <span className="text-emerald-300 font-medium">
                🎉 Congratulations! You have {verifiedPlacements.length} verified campus placement offer(s). You can share your interview experience to guide your juniors.
              </span>
            ) : (
              <span>
                Browse verified questions from top companies, save bookmarked rounds, and track your interview preparation roadmap.
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isPlaced ? (
            <Link
              to="/student/submit-experience"
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4 text-slate-950" /> Submit Interview Experience
            </Link>
          ) : (
            <Link
              to="/student/prep-tracker"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" /> Start Prep Roadmap
            </Link>
          )}
          <Link
            to="/student/experiences"
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4" /> Browse Questions
          </Link>
        </div>
      </div>

      {/* Verified Placement Status Strip (If Placed) */}
      {isPlaced && (
        <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Official Placement Verification Active
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                {verifiedPlacements.map((p) => (
                  <span key={p._id} className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg">
                    {p.companyId?.name} ({p.packageDisplay || `${p.packageCTC} LPA`})
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Link
            to="/student/submit-experience"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 self-start sm:self-center"
          >
            Submit for Verified Company <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Visiting Companies"
          value={data?.totalCompanies}
          subtext="Recruiting on campus"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Published Experiences"
          value={data?.totalPublishedExperiences}
          subtext="Verified peer interview reviews"
          icon={Compass}
          color="purple"
        />
        <StatCard
          title="My Verified Offers"
          value={data?.verifiedPlacementsCount || 0}
          subtext={isPlaced ? 'Verified by Placement Officer' : 'Unplaced (In Preparation)'}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Saved Bookmarks"
          value={bookmarks.length}
          subtext="Saved interview rounds"
          icon={Bookmark}
          color="amber"
        />
      </div>

      {/* Main Grid: Recently Published Experiences & Preparation Trackers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Experiences */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recently Published Interview Experiences</h3>
                <p className="text-xs text-slate-500">Verified questions and preparation strategies from placed seniors</p>
              </div>
              <Link
                to="/student/experiences"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentExperiences.map((exp) => (
                <div
                  key={exp._id}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{exp.companyId?.name}</span>
                      <span className="text-xs font-semibold text-blue-600">• {exp.jobRole}</span>
                      <Badge status={exp.difficultyLevel} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Author: {exp.studentId?.name} ({exp.studentId?.department}) • Class of {exp.selectionYear}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 italic">
                      "{exp.overallExperience}"
                    </p>
                  </div>

                  <Link
                    to={`/student/experiences/${exp._id}`}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 self-start sm:self-center transition-colors flex items-center gap-1"
                  >
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}

              {recentExperiences.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-8">
                  No interview experiences published yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Bookmarks & Preparation Roadmap Progress */}
        <div className="space-y-6">
          {/* Prep Trackers Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" /> Target Company Plans
              </h3>
              <Link
                to="/student/prep-tracker"
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Manage
              </Link>
            </div>

            {prepTrackers.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 mb-3">No active target roadmap created.</p>
                <Link
                  to="/student/prep-tracker"
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100"
                >
                  + Add Target Company
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {prepTrackers.slice(0, 3).map((trk) => {
                  const total = trk.tasks?.length || 0;
                  const completed = trk.tasks?.filter((t) => t.completed).length || 0;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <div key={trk._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-slate-900">{trk.companyId?.name}</span>
                        <span className="text-blue-600">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {completed} of {total} preparation tasks completed
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saved Bookmarks */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-500" /> Saved Experiences ({bookmarks.length})
              </h3>
              <Link
                to="/student/bookmarks"
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                View
              </Link>
            </div>

            <div className="space-y-2.5">
              {bookmarks.slice(0, 3).map((bm) => (
                <Link
                  key={bm._id}
                  to={`/student/experiences/${bm.experienceId?._id}`}
                  className="block p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-300 transition-colors"
                >
                  <p className="text-xs font-bold text-slate-900">
                    {bm.experienceId?.companyId?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {bm.experienceId?.jobRole} • Class of {bm.experienceId?.selectionYear}
                  </p>
                </Link>
              ))}
              {bookmarks.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  No experiences saved yet. Bookmark experiences while browsing!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
