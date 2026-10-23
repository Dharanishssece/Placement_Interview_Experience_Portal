import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Badge from '../../components/Badge';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  GraduationCap,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Building,
} from 'lucide-react';

export default function StudentDirectory() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [accountStatus, setAccountStatus] = useState('All');
  const [placementStatus, setPlacementStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState('');

  // Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    department: 'CSE',
    phone: '',
    batch: '2022-2026',
    cgpa: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/officer/students', {
        params: {
          search,
          department,
          accountStatus,
          placementStatus,
          page,
          limit: 10,
        },
      });

      if (res.data.success) {
        setStudents(res.data.students || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      toast.error('Failed to load registered students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, department, accountStatus, placementStatus, page]);

  const handleOpenDetail = async (student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
    try {
      const res = await api.get(`/officer/students/${student._id}`);
      if (res.data.success) {
        setStudentDetails(res.data);
      }
    } catch (err) {
      toast.error('Failed to load full student profile.');
    }
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setEditFormData({
      name: student.name,
      department: student.department || 'CSE',
      phone: student.phone || '',
      batch: student.batch || '2022-2026',
      cgpa: student.cgpa || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.put(`/officer/students/${selectedStudent._id}`, editFormData);
      if (res.data.success) {
        toast.success('Student information updated successfully!');
        setIsEditModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update student.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (student) => {
    try {
      const res = await api.put(`/officer/students/${student._id}/status`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchStudents();
      }
    } catch (err) {
      toast.error('Failed to toggle student account status.');
    }
  };

  const handlePromptDelete = (student) => {
    setSelectedStudent(student);
    const msg =
      student.totalOffers > 0 || student.submittedExperiencesCount > 0
        ? `Warning: Student has ${student.totalOffers} placement record(s) and ${student.submittedExperiencesCount} experience submission(s). Confirming deletion will permanently delete related institutional records.`
        : 'Are you sure you want to delete this student record? This cannot be undone.';
    setDeleteWarning(msg);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setActionLoading(true);
      const res = await api.delete(`/officer/students/${selectedStudent._id}`, {
        data: { forceDelete: true },
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setIsDeleteDialogOpen(false);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) {
      toast.warning('No student records to export.');
      return;
    }

    const headers = [
      'Roll Number',
      'Name',
      'Email',
      'Department',
      'Batch',
      'CGPA',
      'Account Status',
      'Placement Status',
      'Verified Offers Count',
    ];

    const rows = students.map((s) => [
      `"${s.rollNumber}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.department}"`,
      `"${s.batch}"`,
      `"${s.cgpa || 0}"`,
      `"${s.accountStatus}"`,
      `"${s.isPlaced ? 'Placed' : 'Unplaced'}"`,
      `"${s.verifiedOffersCount || 0}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Student directory exported to CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Registered Student Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, verify eligibility, edit permitted academic details, and manage student accounts
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start"
        >
          <Download className="w-4 h-4" /> Export Student CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by name, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
            <option value="CIVIL">CIVIL</option>
            <option value="AIDS">AIDS</option>
            <option value="AIML">AIML</option>
          </select>

          <select
            value={placementStatus}
            onChange={(e) => setPlacementStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="All">All Placement Statuses</option>
            <option value="Placed">Verified Placed</option>
            <option value="Unplaced">Unplaced</option>
            <option value="Pending Verification">Pending Verification</option>
          </select>

          <select
            value={accountStatus}
            onChange={(e) => setAccountStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="All">All Accounts</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">Roll No</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Dept & Batch</th>
                <th className="py-3.5 px-4">CGPA</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Placement Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => (
                <tr key={st._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">{st.rollNumber}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{st.name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{st.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-700">{st.department}</span>
                    <span className="text-[10px] text-slate-400 block">{st.batch}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">{st.cgpa || '—'}</td>
                  <td className="py-3.5 px-4">
                    <Badge status={st.accountStatus} />
                  </td>
                  <td className="py-3.5 px-4">
                    {st.isPlaced ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <UserCheck className="w-3 h-3" /> Placed ({st.verifiedOffersCount})
                      </span>
                    ) : st.pendingOffersCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Pending ({st.pendingOffersCount})
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400">Unplaced</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenDetail(st)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="View Profile & Placements"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(st)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit Info"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(st)}
                        className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                          st.accountStatus === 'active'
                            ? 'text-slate-400 hover:text-amber-600'
                            : 'text-amber-500 hover:text-emerald-600'
                        }`}
                        title={st.accountStatus === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                      >
                        {st.accountStatus === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handlePromptDelete(st)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Student Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No registered students found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500">
            Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Student Profile & Placement History Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Student Profile: ${selectedStudent?.name} (${selectedStudent?.rollNumber})`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Email</p>
              <p className="font-bold text-slate-900 mt-0.5">{selectedStudent?.email}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Department</p>
              <p className="font-bold text-slate-900 mt-0.5">{selectedStudent?.department}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Batch</p>
              <p className="font-bold text-slate-900 mt-0.5">{selectedStudent?.batch}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">CGPA</p>
              <p className="font-bold text-slate-900 mt-0.5">{selectedStudent?.cgpa || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Phone</p>
              <p className="font-bold text-slate-900 mt-0.5">{selectedStudent?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Account Status</p>
              <p className="mt-0.5"><Badge status={selectedStudent?.accountStatus} /></p>
            </div>
          </div>

          {/* Placement History */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Institutional Placement History</h4>
            {studentDetails?.placements?.length === 0 ? (
              <p className="text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                No placement records associated with this student yet.
              </p>
            ) : (
              <div className="space-y-2">
                {studentDetails?.placements?.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-white"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{p.companyId?.name} — {p.jobRole}</p>
                      <p className="text-[11px] text-slate-500">
                        Package: <span className="font-bold text-emerald-600">{p.packageDisplay || `${p.packageCTC} LPA`}</span> • Drive: {p.driveId?.academicYear}
                      </p>
                    </div>
                    <Badge status={p.verificationStatus} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Student: ${selectedStudent?.name}`}>
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={editFormData.department}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="AIDS">AIDS</option>
                <option value="AIML">AIML</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batch</label>
              <input
                type="text"
                value={editFormData.batch}
                onChange={(e) => setEditFormData({ ...editFormData, batch: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={editFormData.cgpa}
                onChange={(e) => setEditFormData({ ...editFormData, cgpa: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              {actionLoading ? 'Saving...' : 'Update Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation with Historical Warning */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Registered Student"
        message={`Confirm permanent deletion of ${selectedStudent?.name} (${selectedStudent?.rollNumber})?`}
        warningText={deleteWarning}
        confirmText="Confirm Permanent Delete"
        isDanger={true}
        isLoading={actionLoading}
      />
    </div>
  );
}
