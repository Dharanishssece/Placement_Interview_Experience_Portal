import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import SkeletonLoader from '../../components/SkeletonLoader';
import {
  Building2,
  CalendarDays,
  Users,
  Award,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  Plus,
  ArrowRight,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';

export default function DirectorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [drives, setDrives] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, drivesRes, auditRes] = await Promise.all([
          api.get('/director/dashboard-stats'),
          api.get('/director/drives'),
          api.get('/director/audit-logs'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (drivesRes.data.success) setDrives(drivesRes.data.drives || []);
        if (auditRes.data.success) setAuditLogs(auditRes.data.logs || []);
      } catch (err) {
        console.error('Failed to load Director dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <SkeletonLoader count={4} />
        <SkeletonLoader count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20">
            <ShieldCheck className="w-4 h-4 text-blue-400" /> Executive Administration Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Director'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Real-time Institutional Placement Records, Corporate Recruitment Drives, and Department Performance Analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/director/companies"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Company
          </Link>
          <Link
            to="/director/analytics"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" /> View Analytics
          </Link>
        </div>
      </div>

      {/* 8 Primary Calculated Stat Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Placement Performance Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Companies Visited"
            value={stats?.totalCompanies}
            subtext="Corporate recruiting partners"
            icon={Building2}
            color="purple"
          />
          <StatCard
            title="Placement Drives Conducted"
            value={stats?.totalDrives}
            subtext="Across active academic years"
            icon={CalendarDays}
            color="blue"
          />
          <StatCard
            title="Registered Students"
            value={stats?.totalStudents}
            subtext={`${stats?.totalDepartments || 0} Participating Departments`}
            icon={Users}
            color="indigo"
          />
          <StatCard
            title="Unique Students Placed"
            value={stats?.totalUniquePlaced}
            subtext={`${stats?.placementPercentage || 0}% Placement Ratio`}
            icon={Award}
            color="emerald"
          />
          <StatCard
            title="Total Job Offers Received"
            value={stats?.totalOffers}
            subtext="Includes verified multi-offers"
            icon={Layers}
            color="blue"
          />
          <StatCard
            title="Highest CTC Package"
            value={stats?.highestCTC ? `${stats.highestCTC} LPA` : '0 LPA'}
            subtext={`Average: ${stats?.avgCTC || 0} LPA`}
            icon={DollarSign}
            color="amber"
          />
          <StatCard
            title="Pending Verifications"
            value={stats?.pendingVerifications}
            subtext="Awaiting officer confirmation"
            icon={Clock}
            color="rose"
          />
          <StatCard
            title="Pending Experience Reviews"
            value={stats?.pendingExperiences}
            subtext="Student submissions in queue"
            icon={FileSpreadsheet}
            color="amber"
          />
        </div>
      </div>

      {/* Placement Drives & Audit Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Active Recruitment Drives */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Placement Drives</h3>
              <p className="text-xs text-slate-500">Corporate campus drives scheduled & completed</p>
            </div>
            <Link
              to="/director/drives"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Manage Drives <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Drive Date</th>
                  <th className="py-3 px-4">Roles & Package</th>
                  <th className="py-3 px-4">Eligible Depts</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drives.slice(0, 5).map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{d.companyId?.name || 'Company'}</p>
                      <span className="text-[10px] text-slate-400">{d.academicYear}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {new Date(d.driveDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {d.jobRoles && d.jobRoles.length > 0 ? (
                        <div>
                          <p className="font-medium text-slate-800">{d.jobRoles[0].roleTitle}</p>
                          <span className="text-[11px] font-bold text-emerald-600">
                            {d.jobRoles[0].ctcDisplay || `${d.jobRoles[0].ctc} LPA`}
                          </span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {d.eligibleDepartments?.slice(0, 3).map((dept) => (
                          <span
                            key={dept}
                            className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={d.recruitmentStatus} />
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {d.placedCount || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Administrative Audit Trail */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" /> Recent Administrative Activity
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Audit log of verified records and publications
            </p>

            <div className="space-y-3.5">
              {auditLogs.slice(0, 6).map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-800">{log.actorName}</span>
                    <span className="text-slate-400">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-snug">{log.changeSummary}</p>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-6">
                  No administrative logs recorded yet.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6">
            <Link
              to="/director/reports"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" /> View Full Placement Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
