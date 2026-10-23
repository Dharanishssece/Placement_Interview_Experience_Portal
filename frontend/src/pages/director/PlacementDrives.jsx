import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import {
  CalendarDays,
  Plus,
  Building2,
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  Edit,
  Filter,
} from 'lucide-react';

export default function PlacementDrives() {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [yearFilter, setYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    companyId: '',
    academicYear: '2025-2026',
    driveDate: new Date().toISOString().split('T')[0],
    roleTitle: '',
    ctc: '',
    vacancies: '',
    eligibleDepartments: ['CSE', 'IT', 'ECE'],
    minCgpa: '7.0',
    recruitmentStatus: 'Scheduled',
    notes: '',
  });

  const [formLoading, setFormLoading] = useState(false);
  const toast = useToast();

  const fetchDrivesAndCompanies = async () => {
    try {
      setLoading(true);
      const [drivesRes, compRes] = await Promise.all([
        api.get('/director/drives', {
          params: {
            academicYear: yearFilter !== 'All' ? yearFilter : undefined,
            status: statusFilter !== 'All' ? statusFilter : undefined,
          },
        }),
        api.get('/director/companies', { params: { limit: 100 } }),
      ]);

      if (drivesRes.data.success) setDrives(drivesRes.data.drives || []);
      if (compRes.data.success) setCompanies(compRes.data.companies || []);
    } catch (err) {
      console.error('Failed to load drives:', err);
      toast.error('Failed to load placement drives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivesAndCompanies();
  }, [yearFilter, statusFilter]);

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!formData.companyId || !formData.roleTitle || !formData.ctc) {
      toast.error('Company, Job Role, and CTC are required.');
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        companyId: formData.companyId,
        academicYear: formData.academicYear,
        driveDate: formData.driveDate,
        jobRoles: [
          {
            roleTitle: formData.roleTitle.trim(),
            ctc: Number(formData.ctc),
            ctcDisplay: `${formData.ctc} LPA`,
            vacancies: Number(formData.vacancies || 0),
          },
        ],
        eligibleDepartments: formData.eligibleDepartments,
        minCgpa: Number(formData.minCgpa || 6.5),
        recruitmentStatus: formData.recruitmentStatus,
        notes: formData.notes,
      };

      const res = await api.post('/director/drives', payload);
      if (res.data.success) {
        toast.success('Placement drive scheduled successfully!');
        setIsAddModalOpen(false);
        fetchDrivesAndCompanies();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to schedule drive.';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setFormLoading(true);
      const res = await api.put(`/director/drives/${selectedDrive._id}`, {
        recruitmentStatus: newStatus,
      });
      if (res.data.success) {
        toast.success(`Drive status updated to "${newStatus}"!`);
        setIsStatusModalOpen(false);
        fetchDrivesAndCompanies();
      }
    } catch (err) {
      toast.error('Failed to update drive status.');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleDept = (dept) => {
    setFormData((prev) => {
      const exists = prev.eligibleDepartments.includes(dept);
      return {
        ...prev,
        eligibleDepartments: exists
          ? prev.eligibleDepartments.filter((d) => d !== dept)
          : [...prev.eligibleDepartments, dept],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Placement Drives</h1>
          <p className="text-xs text-slate-500 mt-1">
            Schedule corporate recruitment timelines, eligible branches, and recruitment statuses
          </p>
        </div>

        <button
          onClick={() => {
            if (companies.length > 0) {
              setFormData((prev) => ({ ...prev, companyId: companies[0]._id }));
            }
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Schedule Placement Drive
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Academic Year:</span>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="All">All Years</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Drive Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Drives Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">Company & Year</th>
                <th className="py-3.5 px-4">Drive Date</th>
                <th className="py-3.5 px-4">Job Role & Package</th>
                <th className="py-3.5 px-4">Eligible Departments</th>
                <th className="py-3.5 px-4">Min CGPA</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Placed</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drives.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <p className="font-bold text-slate-900 text-sm">{d.companyId?.name || 'Company'}</p>
                    <span className="text-[11px] text-slate-400 font-medium">{d.academicYear}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                    {new Date(d.driveDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    {d.jobRoles && d.jobRoles.length > 0 ? (
                      <div>
                        <p className="font-semibold text-slate-900">{d.jobRoles[0].roleTitle}</p>
                        <span className="font-bold text-emerald-600 text-[11px]">
                          {d.jobRoles[0].ctcDisplay || `${d.jobRoles[0].ctc} LPA`}
                        </span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {d.eligibleDepartments?.map((dept) => (
                        <span key={dept} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">{d.minCgpa}</td>
                  <td className="py-3.5 px-4">
                    <Badge status={d.recruitmentStatus} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                      {d.placedCount || 0}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => {
                        setSelectedDrive(d);
                        setIsStatusModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Status
                    </button>
                  </td>
                </tr>
              ))}
              {drives.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No placement drives recorded for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Drive Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Schedule New Recruitment Drive">
        <form onSubmit={handleCreateDrive} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Company *</label>
            <select
              required
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            >
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.tier})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year *</label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="2025-2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Date *</label>
              <input
                type="date"
                required
                value={formData.driveDate}
                onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role Title *</label>
              <input
                type="text"
                required
                value={formData.roleTitle}
                onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                placeholder="e.g. Software Development Engineer"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CTC (in LPA) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.ctc}
                onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                placeholder="e.g. 14.5"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Eligible Departments</label>
            <div className="flex flex-wrap gap-2">
              {['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML'].map((dept) => {
                const selected = formData.eligibleDepartments.includes(dept);
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => toggleDept(dept)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum CGPA</label>
              <input
                type="number"
                step="0.1"
                value={formData.minCgpa}
                onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
              <select
                value={formData.recruitmentStatus}
                onChange={(e) => setFormData({ ...formData, recruitmentStatus: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              {formLoading ? 'Scheduling...' : 'Save Drive'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Update Recruitment Status" maxWidth="max-w-md">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Select the new recruitment progress for <strong>{selectedDrive?.companyId?.name}</strong> ({selectedDrive?.academicYear}):
          </p>

          <div className="grid grid-cols-2 gap-3">
            {['Scheduled', 'Ongoing', 'Completed', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => handleUpdateStatus(st)}
                disabled={formLoading}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-xs font-bold text-slate-800 transition-all text-center"
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
