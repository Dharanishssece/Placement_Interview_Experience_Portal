import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import SkeletonLoader from '../../components/SkeletonLoader';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  UserCheck,
  UserX,
  FileText,
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingPlacements, setPendingPlacements] = useState([]);
  const [pendingModeration, setPendingModeration] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficerData = async () => {
      try {
        setLoading(true);
        const [statsRes, placeRes, modRes] = await Promise.all([
          api.get('/officer/dashboard-stats'),
          api.get('/officer/placements', { params: { verificationStatus: 'Pending' } }),
          api.get('/officer/moderation', { params: { status: 'Pending Review' } }),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (placeRes.data.success) setPendingPlacements(placeRes.data.records || []);
        if (modRes.data.success) setPendingModeration(modRes.data.experiences || []);
      } catch (err) {
        console.error('Failed to load officer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficerData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <SkeletonLoader count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20">
            <ShieldCheck className="w-4 h-4 text-blue-400" /> Placement Officer Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Officer Dashboard — {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Verify student placement selections, manage directory records, and moderate submitted interview experiences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/officer/placements"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Verify Placements
          </Link>
          <Link
            to="/officer/moderation"
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Review Submissions ({stats?.pendingExperiences || 0})
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Registered Students"
          value={stats?.totalStudents}
          subtext={`${stats?.activeStudents || 0} active • ${stats?.suspendedStudents || 0} suspended`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Verified Job Offers"
          value={stats?.totalVerifiedOffers}
          subtext={`${stats?.uniquePlaced || 0} Unique students placed`}
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Pending Placements"
          value={stats?.pendingVerifications}
          subtext="Selections awaiting officer verification"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Experience Moderation Queue"
          value={stats?.pendingExperiences}
          subtext={`${stats?.approvedExperiences || 0} approved • ${stats?.rejectedExperiences || 0} rejected`}
          icon={FileCheck2}
          color="purple"
        />
      </div>

      {/* Pending Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Placements Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" /> Pending Placement Verifications ({pendingPlacements.length})
                </h3>
                <p className="text-xs text-slate-500">Selections requiring eligibility confirmation</p>
              </div>
              <Link
                to="/officer/placements"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {pendingPlacements.slice(0, 4).map((record) => (
                <div
                  key={record._id}
                  className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{record.studentId?.name}</p>
                    <p className="text-slate-500 text-[11px]">
                      {record.studentId?.rollNumber} • {record.studentId?.department}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-slate-800">{record.companyId?.name}</span>
                      <span className="font-bold text-emerald-600">
                        ({record.packageDisplay || `${record.packageCTC} LPA`})
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/officer/placements"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                  >
                    Verify
                  </Link>
                </div>
              ))}
              {pendingPlacements.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-8">
                  No placement records currently awaiting verification.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pending Experience Moderation Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" /> Pending Experience Reviews ({pendingModeration.length})
                </h3>
                <p className="text-xs text-slate-500">Student submissions waiting to be published</p>
              </div>
              <Link
                to="/officer/moderation"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Moderation Queue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {pendingModeration.slice(0, 4).map((exp) => (
                <div
                  key={exp._id}
                  className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{exp.companyId?.name} — {exp.jobRole}</p>
                    <p className="text-slate-500 text-[11px]">
                      Submitted by {exp.studentId?.name} ({exp.studentId?.rollNumber})
                    </p>
                    <p className="text-[11px] text-purple-700 mt-0.5">
                      {exp.rounds?.length || 0} rounds • Submitted on {new Date(exp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to="/officer/moderation"
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs"
                  >
                    Review
                  </Link>
                </div>
              ))}
              {pendingModeration.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-8">
                  No interview experiences waiting in moderation queue.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
