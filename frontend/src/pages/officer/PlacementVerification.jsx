import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Badge from '../../components/Badge';
import {
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  XCircle,
  AlertTriangle,
  Award,
  Users,
  Edit,
  Trash2,
} from 'lucide-react';

export default function PlacementVerification() {
  const [placements, setPlacements] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCompanyId, setSelectedCompanyId] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    companyId: '',
    driveId: '',
    jobRole: '',
    packageCTC: '',
    packageDisplay: '',
    selectionDate: new Date().toISOString().split('T')[0],
    offerStatus: 'Offered',
    verificationStatus: 'Verified',
    remarks: '',
  });

  const [formLoading, setFormLoading] = useState(false);
  const toast = useToast();

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const [placeRes, compRes, driveRes, studRes] = await Promise.all([
        api.get('/officer/placements', {
          params: {
            companyId: selectedCompanyId !== 'All' ? selectedCompanyId : undefined,
            verificationStatus: verificationFilter !== 'All' ? verificationFilter : undefined,
            department: departmentFilter !== 'All' ? departmentFilter : undefined,
          },
        }),
        api.get('/director/companies', { params: { limit: 100 } }),
        api.get('/director/drives', { params: { limit: 100 } }),
        api.get('/officer/students', { params: { limit: 200 } }),
      ]);

      if (placeRes.data.success) setPlacements(placeRes.data.records || []);
      if (compRes.data.success) setCompanies(compRes.data.companies || []);
      if (driveRes.data.success) setDrives(driveRes.data.drives || []);
      if (studRes.data.success) setStudents(studRes.data.students || []);
    } catch (err) {
      console.error('Failed to load placements:', err);
      toast.error('Failed to load placement records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, [selectedCompanyId, verificationFilter, departmentFilter]);

  const handleOpenAdd = () => {
    setFormData({
      studentId: students.length > 0 ? students[0]._id : '',
      companyId: companies.length > 0 ? companies[0]._id : '',
      driveId: drives.length > 0 ? drives[0]._id : '',
      jobRole: 'Software Engineer',
      packageCTC: '12',
      packageDisplay: '12 LPA',
      selectionDate: new Date().toISOString().split('T')[0],
      offerStatus: 'Offered',
      verificationStatus: 'Verified',
      remarks: 'Verified offer letter submitted to Placement Office.',
    });
    setIsAddModalOpen(true);
  };

  const handleCreatePlacement = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.companyId || !formData.driveId || !formData.jobRole || !formData.packageCTC) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      setFormLoading(true);
      const res = await api.post('/officer/placements', {
        ...formData,
        packageCTC: Number(formData.packageCTC),
        packageDisplay: formData.packageDisplay || `${formData.packageCTC} LPA`,
      });

      if (res.data.success) {
        toast.success('Placement record created and verified successfully!');
        setIsAddModalOpen(false);
        fetchPlacements();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to record placement.';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleVerifyToggle = async (record, newStatus) => {
    try {
      const res = await api.put(`/officer/placements/${record._id}/verify`, {
        status: newStatus,
        remarks: newStatus === 'Verified' ? 'Verified by Officer' : 'Verification revoked',
      });
      if (res.data.success) {
        toast.success(`Placement record marked as ${newStatus}!`);
        fetchPlacements();
      }
    } catch (err) {
      toast.error('Failed to update verification status.');
    }
  };

  const handleDeleteRecord = async () => {
    try {
      setFormLoading(true);
      const res = await api.delete(`/officer/placements/${selectedRecord._id}`);
      if (res.data.success) {
        toast.success('Placement record deleted.');
        setIsDeleteDialogOpen(false);
        fetchPlacements();
      }
    } catch (err) {
      toast.error('Failed to remove placement record.');
    } finally {
      setFormLoading(false);
    }
  };

  // Filter drives by selected company in modal
  const filteredDrivesForModal = drives.filter(
    (d) => !formData.companyId || d.companyId?._id === formData.companyId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Placement Verification</h1>
          <p className="text-xs text-slate-500 mt-1">
            Associate registered students with hiring companies, verify selections, and manage official offers
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Record New Placement
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Company:</span>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 max-w-[200px]"
          >
            <option value="All">All Companies</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Verification:</span>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Revoked">Revoked</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
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
      </div>

      {/* Placements Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">Student</th>
                <th className="py-3.5 px-4">Company & Drive</th>
                <th className="py-3.5 px-4">Job Role</th>
                <th className="py-3.5 px-4">Package (CTC)</th>
                <th className="py-3.5 px-4">Offer Status</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Verifying Officer</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {placements.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <p className="font-bold text-slate-900">{r.studentId?.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {r.studentId?.rollNumber} • {r.studentId?.department}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900">{r.companyId?.name}</p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Drive: {r.driveId?.academicYear}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{r.jobRole}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 text-xs">
                    {r.packageDisplay || `${r.packageCTC} LPA`}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-semibold text-slate-700">{r.offerStatus}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={r.verificationStatus} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {r.verifiedBy?.name || '—'}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.verificationStatus !== 'Verified' ? (
                        <button
                          onClick={() => handleVerifyToggle(r, 'Verified')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                        >
                          Verify
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerifyToggle(r, 'Revoked')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg font-bold text-[11px] transition-colors"
                          title="Revoke Verification"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedRecord(r);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Placement Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {placements.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No placement records found matching the active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Placement Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Record & Verify Student Placement">
        <form onSubmit={handleCreatePlacement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Registered Student *</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            >
              <option value="">-- Choose Student --</option>
              {students.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name} ({st.rollNumber} - {st.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
              <select
                required
                value={formData.companyId}
                onChange={(e) => {
                  const compId = e.target.value;
                  const relevantDrive = drives.find((d) => d.companyId?._id === compId);
                  setFormData({
                    ...formData,
                    companyId: compId,
                    driveId: relevantDrive ? relevantDrive._id : formData.driveId,
                  });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              >
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Placement Drive *</label>
              <select
                required
                value={formData.driveId}
                onChange={(e) => setFormData({ ...formData, driveId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              >
                {filteredDrivesForModal.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.academicYear} (Date: {new Date(d.driveDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role Title *</label>
              <input
                type="text"
                required
                value={formData.jobRole}
                onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                placeholder="e.g. Software Engineer"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Package (CTC in LPA) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.packageCTC}
                onChange={(e) => setFormData({ ...formData, packageCTC: e.target.value })}
                placeholder="e.g. 14.5"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Offer Status</label>
              <select
                value={formData.offerStatus}
                onChange={(e) => setFormData({ ...formData, offerStatus: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              >
                <option value="Offered">Offered</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
                <option value="Joined">Joined</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Verification Status</label>
              <select
                value={formData.verificationStatus}
                onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="Verified">Verified (Eligible for Experience Submission)</option>
                <option value="Pending">Pending Validation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Verification Remarks / Notes</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Validated against official offer letter from HR."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              {formLoading ? 'Recording...' : 'Record Placement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Record Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteRecord}
        title="Remove Placement Record"
        message="Are you sure you want to remove this placement record?"
        warningText="Removing this verified record will revoke the student's eligibility to submit interview experiences for this drive."
        confirmText="Remove Record"
        isDanger={true}
        isLoading={formLoading}
      />
    </div>
  );
}
