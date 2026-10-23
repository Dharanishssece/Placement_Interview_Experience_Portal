import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import {
  Building2,
  Search,
  ExternalLink,
  MapPin,
  CalendarDays,
  Users,
  Compass,
  ArrowRight,
} from 'lucide-react';

export default function CompanyDirectory() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');

  const toast = useToast();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await api.get('/director/companies', {
          params: { search, tier: tierFilter, limit: 50 },
        });
        if (res.data.success) {
          setCompanies(res.data.companies || []);
        }
      } catch (err) {
        toast.error('Failed to load companies.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [search, tierFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruiting Companies Hub</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore campus recruiting partners, interview experiences, job roles, and previous hiring packages
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company by name or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 w-full sm:w-auto"
        >
          <option value="All">All Categories</option>
          <option value="Tier 1 (Dream)">Tier 1 (Dream)</option>
          <option value="Tier 2 (Core)">Tier 2 (Core)</option>
          <option value="Tier 3 (Mass / IT Services)">Tier 3 (Mass / IT Services)</option>
          <option value="Startup">Startup</option>
        </select>
      </div>

      {/* Company Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-60" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Companies Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No recruiting partners matched your query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((comp) => (
            <div
              key={comp._id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{comp.name}</h3>
                    <p className="text-xs text-slate-500">{comp.industry}</p>
                  </div>
                  <Badge status={comp.tier} />
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {comp.description}
                </p>

                {comp.headquarters && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{comp.headquarters}</span>
                  </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Drives Conducted</p>
                    <p className="text-xs font-bold text-slate-900">{comp.driveCount || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Interview Experiences</p>
                    <p className="text-xs font-bold text-blue-600">{comp.approvedExperiencesCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {comp.website ? (
                  <a
                    href={comp.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Official Career Site
                  </a>
                ) : (
                  <span />
                )}

                <Link
                  to={`/student/companies/${comp._id}`}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
