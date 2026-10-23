import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  GraduationCap,
  Building2,
  Briefcase,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  Search,
  BookOpen,
  Compass,
} from 'lucide-react';
import Badge from '../../components/Badge';

export default function LandingPage() {
  const [stats, setStats] = useState(null);
  const [topCompanies, setTopCompanies] = useState([]);
  const [featuredExperiences, setFeaturedExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/public/stats');
        if (res.data.success) {
          setStats(res.data.stats);
          setTopCompanies(res.data.topCompanies || []);
          setFeaturedExperiences(res.data.featuredExperiences || []);
        }
      } catch (err) {
        console.error('Failed to load public stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-700 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                CAREER<span className="text-blue-600">PULSE</span>
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 hidden sm:inline-block">
                College Placement Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/experiences"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              <CompassIcon className="w-4 h-4" /> Browse Experiences
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              Student Register <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Official Department of Training & Placement Portal
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Placement Records & Verified <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              Interview Experience Portal
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Empowering placement departments with institutional company management, multi-stage student verification,
            and real peer interview experiences shared exclusively by placed seniors.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              Access Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/student/experiences"
              className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Explore Interview Archive
            </Link>
          </div>

          {/* Quick Metrics Counter */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xs text-slate-400 font-medium">Visiting Companies</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {stats?.totalCompanies || '7+'}
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xs text-slate-400 font-medium">Verified Job Offers</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {stats?.totalOffers || '5+'}
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xs text-slate-400 font-medium">Highest Package (CTC)</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                {stats?.highestCTC ? `${stats.highestCTC} LPA` : '32.5 LPA'}
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xs text-slate-400 font-medium">Verified Experiences</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-sky-400 mt-1">
                {stats?.totalExperiences || '3+'}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Role Architecture Cards */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Role-Based System</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Built for the Entire College Placement Ecosystem
          </h3>
          <p className="text-slate-500 text-sm mt-2">
            Three isolated permission tiers ensuring institutional data integrity and student privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Director Card */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Placement Director</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Strategic administrative control over recruitment drives, corporate partnerships, department analytics, and executive placement reports.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  Manage companies and visiting recruitment drives
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  Department & CTC distribution analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  Printable summaries & CSV report exports
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center text-xs font-bold text-purple-700 hover:text-purple-800"
            >
              Director Sign In <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {/* Officer Card */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Placement Officer</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Operational verification of student eligibility, company-wise selections, multiple offers tracking, and moderation of interview submissions.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  Registered student directory & status control
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  Placement verification & offer record linking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  Moderation of submitted interview experiences & PDFs
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-800"
            >
              Officer Sign In <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {/* Student Card */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Students</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore real interview questions from top tech giants, bookmark key rounds, track preparation milestones, and share verified experiences.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Browse verified round-by-round interview questions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Company-specific preparation roadmaps & tasks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Submit interview experience upon selection verification
                </li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Register Account <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Top Companies Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Top Recruitment Partners</h3>
              <p className="text-xs text-slate-500">
                Companies actively conducting placement drives on our campus.
              </p>
            </div>
            <Link
              to="/student/companies"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              View All Companies <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topCompanies.slice(0, 4).map((c) => (
              <div
                key={c._id}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-300 hover:bg-white transition-all shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge status={c.tier} />
                  <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">
                    {c.headquarters}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{c.name}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{c.industry}</p>
                <Link
                  to={`/student/companies/${c._id}`}
                  className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  View Drives & Experiences <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Verified Interview Experiences */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Peer Knowledge</h2>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">Recently Approved Interview Experiences</h3>
          </div>
          <Link
            to="/student/experiences"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            Explore All Experiences <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredExperiences.slice(0, 3).map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-900">{exp.companyId?.name}</span>
                  <Badge status={exp.difficultyLevel} />
                </div>
                <h4 className="text-sm font-bold text-blue-600">{exp.jobRole}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Shared by {exp.studentId?.name} ({exp.studentId?.department}) • Class of {exp.selectionYear}
                </p>
                <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                  "{exp.overallExperience}"
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {exp.rounds?.length || 0} Interview Rounds
                </span>
                <Link
                  to={`/student/experiences/${exp._id}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  Read Full Experience <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between text-xs">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-4 sm:mb-0">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-white">PLACEMENT INTERVIEW EXPERIENCE PORTAL</span>
          </div>
          <p>© 2026 Department of Training and Placement. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function CompassIcon(props) {
  return <Compass {...props} />;
}
