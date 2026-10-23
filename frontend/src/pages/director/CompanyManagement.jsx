import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Badge from '../../components/Badge';
import {
  Building2,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Edit,
  Trash2,
  Users,
  Calendar,
  Briefcase,
  Layers,
  FileCheck2,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: 'Information Technology & Services',
    headquarters: 'Bengaluru, India',
    tier: 'Tier 1 (Dream)',
    description: '',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  const toast = useToast();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/director/companies', {
        params: {
          search,
          industry: industryFilter,
          tier: tierFilter,
          page,
          limit: 9,
        },
      });
      if (res.data.success) {
        setCompanies(res.data.companies || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
      toast.error('Failed to load companies list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, industryFilter, tierFilter, page]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      website: '',
      industry: 'Information Technology & Services',
      headquarters: 'Bengaluru, India',
      tier: 'Tier 1 (Dream)',
      description: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setSelectedCompany(comp);
    setFormData({
      name: comp.name,
      website: comp.website || '',
      industry: comp.industry || 'Information Technology & Services',
      headquarters: comp.headquarters || 'Bengaluru, India',
      tier: comp.tier || 'Tier 1 (Dream)',
      description: comp.description || '',
      notes: comp.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDetail = async (comp) => {
    setSelectedCompany(comp);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`/director/companies/${comp._id}`);
      if (res.data.success) {
        setCompanyDetails(res.data);
      }
    } catch (err) {
      toast.error('Failed to load company details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const res = await api.post('/director/companies', formData);
      if (res.data.success) {
        toast.success(`Company "${formData.name}" added successfully!`);
        setIsAddModalOpen(false);
        fetchCompanies();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create company.';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const res = await api.put(`/director/companies/${selectedCompany._id}`, formData);
      if (res.data.success) {
        toast.success('Company details updated successfully!');
        setIsEditModalOpen(false);
        fetchCompanies();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update company.';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCompany = async () => {
    try {
      setFormLoading(true);
      const res = await api.delete(`/director/companies/${selectedCompany._id}`);
      if (res.data.success) {
        toast.success('Company deleted successfully.');
        setIsDeleteDialogOpen(false);
        fetchCompanies();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete company.';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Company Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain institutional recruiting partners, tier categories, and associated placement records
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Add New Company
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name, industry, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="All">All Tiers</option>
            <option value="Tier 1 (Dream)">Tier 1 (Dream)</option>
            <option value="Tier 2 (Core)">Tier 2 (Core)</option>
            <option value="Tier 3 (Mass / IT Services)">Tier 3 (Mass / IT Services)</option>
            <option value="Startup">Startup</option>
          </select>

          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="All">All Industries</option>
            <option value="Internet & Cloud Computing">Internet & Cloud Computing</option>
            <option value="Software & Cloud Services">Software & Cloud Services</option>
            <option value="E-Commerce & Cloud Infrastructure">E-Commerce</option>
            <option value="Networking & Cybersecurity">Networking & Cybersecurity</option>
            <option value="SaaS & Enterprise Business Tools">SaaS Tools</option>
            <option value="IT Consulting & Cloud Solutions">IT Consulting</option>
          </select>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-60" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Companies Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No company records match your active search or filters. Click "Add New Company" to register one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((comp) => (
            <div
              key={comp._id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => handleOpenDetail(comp)}>
                      {comp.name}
                    </h3>
                    <p className="text-xs text-slate-500">{comp.industry}</p>
                  </div>
                  <Badge status={comp.tier} />
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {comp.description}
                </p>

                {comp.headquarters && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{comp.headquarters}</span>
                  </div>
                )}

                {/* Metrics Pill */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Drives</p>
                    <p className="text-xs font-bold text-slate-900">{comp.driveCount || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Placed</p>
                    <p className="text-xs font-bold text-emerald-600">{comp.placedCount || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Reviews</p>
                    <p className="text-xs font-bold text-blue-600">{comp.approvedExperiencesCount || 0}</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenDetail(comp)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" /> View Placements
                </button>

                <div className="flex items-center gap-1">
                  {comp.website && (
                    <a
                      href={comp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Visit Website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleOpenEdit(comp)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Edit Details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCompany(comp);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Delete Company"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {/* Add Company Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Recruitment Partner">
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Google India"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Internet & Cloud"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tier Category</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tier 1 (Dream)">Tier 1 (Dream)</option>
                <option value="Tier 2 (Core)">Tier 2 (Core)</option>
                <option value="Tier 3 (Mass / IT Services)">Tier 3 (Mass / IT Services)</option>
                <option value="Startup">Startup</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters</label>
              <input
                type="text"
                value={formData.headquarters}
                onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                placeholder="e.g. Bengaluru, India"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://careers.company.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Overview of the company, product lines, and market presence..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Placement Notes / Criteria</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Focuses heavily on Graph algorithms and System Design..."
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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              {formLoading ? 'Saving...' : 'Add Company'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Company Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Company: ${selectedCompany?.name}`}>
        <form onSubmit={handleUpdateCompany} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tier Category</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              >
                <option value="Tier 1 (Dream)">Tier 1 (Dream)</option>
                <option value="Tier 2 (Core)">Tier 2 (Core)</option>
                <option value="Tier 3 (Mass / IT Services)">Tier 3 (Mass / IT Services)</option>
                <option value="Startup">Startup</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
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
              disabled={formLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              {formLoading ? 'Saving...' : 'Update Details'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Company Profile & Placed Students Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={companyDetails?.company?.name || 'Company Profile'}
        maxWidth="max-w-3xl"
      >
        {detailLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading company placement records...</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between gap-3 mb-2">
                <Badge status={companyDetails?.company?.tier} />
                <span className="text-xs text-slate-500">{companyDetails?.company?.industry}</span>
              </div>
              <p className="text-xs text-slate-600">{companyDetails?.company?.description}</p>
            </div>

            {/* Placed Students List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Verified Placed Students ({companyDetails?.placedRecords?.length || 0})
                </h4>
              </div>

              {companyDetails?.placedRecords?.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl">
                  No verified student selections recorded for this company yet.
                </p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Roll No</th>
                        <th className="py-2.5 px-3">Dept</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3 text-right">Package</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {companyDetails?.placedRecords?.map((p) => (
                        <tr key={p._id}>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{p.studentId?.name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{p.studentId?.rollNumber}</td>
                          <td className="py-2.5 px-3 text-slate-600">{p.studentId?.department}</td>
                          <td className="py-2.5 px-3 text-slate-700">{p.jobRole}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                            {p.packageDisplay || `${p.packageCTC} LPA`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteCompany}
        title="Delete Company Record"
        message={`Are you sure you want to remove "${selectedCompany?.name}"?`}
        warningText="Deletion is blocked if active student placement records or interview experiences are associated with this company."
        confirmText="Delete Company"
        isDanger={true}
        isLoading={formLoading}
      />
    </div>
  );
}
