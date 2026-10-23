import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Timeline from '../../components/Timeline';
import {
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Compass,
  Award,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  FileText,
} from 'lucide-react';

export default function CompanyDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackerLoading, setTrackerLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/director/companies/${id}`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        toast.error('Failed to load company profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const handleStartPrep = async () => {
    try {
      setTrackerLoading(true);
      const res = await api.post('/student/prep-trackers', {
        companyId: id,
        targetRole: data?.drives?.[0]?.jobRoles?.[0]?.roleTitle || 'Software Engineer',
      });
      if (res.data.success) {
        toast.success(`Preparation roadmap for ${data.company.name} created!`);
        navigate('/student/prep-tracker');
      }
    } catch (err) {
      if (err.response?.status === 409) {
        toast.info('You already have a preparation roadmap for this company.');
        navigate('/student/prep-tracker');
      } else {
        toast.error('Failed to create prep tracker.');
      }
    } finally {
      setTrackerLoading(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading company profile...</div>;
  }

  const company = data?.company;
  const drives = data?.drives || [];
  const experiences = data?.experiences || [];
  const placedRecords = data?.placedRecords || [];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Back button */}
      <Link
        to="/student/companies"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Company Directory
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {company?.name}
            </h1>
            <Badge status={company?.tier} />
          </div>

          <p className="text-xs text-slate-500">{company?.industry}</p>

          <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
            {company?.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            {company?.headquarters && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {company.headquarters}
              </span>
            )}
            {company?.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-semibold flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Visit Official Website
              </a>
            )}
          </div>
        </div>

        <button
          onClick={handleStartPrep}
          disabled={trackerLoading}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start md:self-center shrink-0"
        >
          <CheckSquare className="w-4 h-4" /> Start Preparation Roadmap
        </button>
      </div>

      {/* Placement Drives Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" /> Recruitment Drives ({drives.length})
        </h3>

        {drives.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No recruitment drives recorded for this company yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map((d) => (
              <div key={d._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{d.academicYear} Drive</span>
                  <Badge status={d.recruitmentStatus} />
                </div>
                <p className="text-slate-500">
                  Drive Date: {new Date(d.driveDate).toLocaleDateString()} • Min CGPA: {d.minCgpa}
                </p>

                {d.jobRoles?.map((r, i) => (
                  <div key={i} className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{r.roleTitle}</span>
                    <span className="font-bold text-emerald-600">{r.ctcDisplay || `${r.ctc} LPA`}</span>
                  </div>
                ))}

                <div className="flex flex-wrap gap-1 pt-1">
                  {d.eligibleDepartments?.map((dept) => (
                    <span key={dept} className="px-1.5 py-0.5 bg-white text-slate-600 rounded border border-slate-200 text-[10px]">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published Interview Experiences */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-600" /> Verified Interview Experiences ({experiences.length})
            </h3>
            <p className="text-xs text-slate-500">Real interview debriefs and question timelines from placed seniors</p>
          </div>
        </div>

        {experiences.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 text-center border border-dashed border-slate-200">
            <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No Interview Experiences Published Yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Be the first placed candidate to share your experience once verified!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div
                key={exp._id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{exp.jobRole}</h4>
                    <Badge status={exp.difficultyLevel} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Shared by {exp.studentId?.name} ({exp.studentId?.department}) • Class of {exp.selectionYear}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 italic">
                    "{exp.overallExperience}"
                  </p>
                </div>

                <Link
                  to={`/student/experiences/${exp._id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5"
                >
                  Read Full Experience <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
