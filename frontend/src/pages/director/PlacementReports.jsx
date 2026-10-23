import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  GraduationCap,
  Building2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../../components/Badge';

export default function PlacementReports() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('All');
  const [academicYear, setAcademicYear] = useState('All');

  const toast = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/director/reports', {
        params: {
          department,
          academicYear,
        },
      });
      if (res.data.success) {
        setRecords(res.data.records || []);
      }
    } catch (err) {
      console.error('Failed to load placement reports:', err);
      toast.error('Failed to load placement reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [department, academicYear]);

  // Export to CSV Function
  const exportToCSV = () => {
    if (records.length === 0) {
      toast.warning('No records available to export.');
      return;
    }

    const headers = [
      'Roll Number',
      'Student Name',
      'Department',
      'Email',
      'Batch',
      'Company',
      'Job Role',
      'Package CTC (LPA)',
      'Academic Year',
      'Selection Date',
      'Offer Status',
      'Verification Status',
      'Verified By',
    ];

    const rows = records.map((r) => [
      `"${r.studentId?.rollNumber || ''}"`,
      `"${r.studentId?.name || ''}"`,
      `"${r.studentId?.department || ''}"`,
      `"${r.studentId?.email || ''}"`,
      `"${r.studentId?.batch || ''}"`,
      `"${r.companyId?.name || ''}"`,
      `"${r.jobRole || ''}"`,
      `"${r.packageCTC || 0}"`,
      `"${r.driveId?.academicYear || ''}"`,
      `"${r.selectionDate ? new Date(r.selectionDate).toLocaleDateString() : ''}"`,
      `"${r.offerStatus || ''}"`,
      `"${r.verificationStatus || ''}"`,
      `"${r.verifiedBy?.name || 'Placement Cell'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Institutional_Placement_Report_${academicYear}_${department}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Placement report CSV downloaded successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate summary metrics
  const uniqueStudents = new Set(records.map((r) => r.studentId?._id)).size;
  const avgPackage =
    records.length > 0
      ? (records.reduce((acc, r) => acc + (r.packageCTC || 0), 0) / records.length).toFixed(2)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Placement Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate printable executive summaries and download official audit CSV records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Summary
          </button>
        </div>
      </div>

      {/* Filter Controls (Hidden in Print) */}
      <div className="no-print bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Department:</span>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="All">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="AIDS">AIDS</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Academic Year:</span>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="All">All Years</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
          </select>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">DEPARTMENT OF TRAINING & PLACEMENT</h2>
              <p className="text-xs text-slate-500">Official Consolidated Student Selection Audit Report</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400">
            <p>Generated: {new Date().toLocaleDateString()}</p>
            <p>Filter: {department} | Year: {academicYear}</p>
          </div>
        </div>

        {/* Quick Report Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Selections</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{records.length}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Unique Students Placed</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{uniqueStudents}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Average Package</p>
            <p className="text-xl font-bold text-blue-600 mt-0.5">{avgPackage} LPA</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Verification</p>
            <p className="text-xl font-bold text-purple-600 mt-0.5">100% Verified</p>
          </div>
        </div>

        {/* Table of Records */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Dept</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Job Role</th>
                <th className="py-3 px-4">Drive Year</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{r.studentId?.rollNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{r.studentId?.name}</td>
                  <td className="py-3 px-4 text-slate-600">{r.studentId?.department}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.companyId?.name}</td>
                  <td className="py-3 px-4 text-slate-700">{r.jobRole}</td>
                  <td className="py-3 px-4 text-slate-500">{r.driveId?.academicYear}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">
                    {r.packageDisplay || `${r.packageCTC} LPA`}
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={r.verificationStatus} />
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No verified records found for the selected department and year.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Report Footer / Signature */}
        <div className="pt-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 mt-8">
          <div>
            <p className="font-bold text-slate-800">Placement Officer Signature</p>
            <p className="mt-8">Verified & Audited</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-800">Placement Director Signature</p>
            <p className="mt-8">Executive Placement Approval</p>
          </div>
        </div>
      </div>
    </div>
  );
}
