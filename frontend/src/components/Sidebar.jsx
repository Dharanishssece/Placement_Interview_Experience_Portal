import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  BarChart3,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  FileText,
  Bookmark,
  Compass,
  UploadCloud,
  CheckSquare,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Award,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const directorLinks = [
    { to: '/director/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/director/companies', label: 'Company Management', icon: Building2 },
    { to: '/director/drives', label: 'Placement Drives', icon: CalendarDays },
    { to: '/director/analytics', label: 'Placement Analytics', icon: BarChart3 },
    { to: '/director/reports', label: 'Summary Reports & CSV', icon: FileSpreadsheet },
    { to: '/director/settings', label: 'Security & Settings', icon: KeyRound },
  ];

  const officerLinks = [
    { to: '/officer/dashboard', label: 'Officer Dashboard', icon: LayoutDashboard },
    { to: '/officer/students', label: 'Student Directory', icon: Users },
    { to: '/officer/placements', label: 'Placement Verification', icon: CheckCircle2 },
    { to: '/officer/moderation', label: 'Experience Moderation', icon: ShieldCheck },
    { to: '/officer/settings', label: 'Security & Settings', icon: KeyRound },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { to: '/student/companies', label: 'Company Hub', icon: Building2 },
    { to: '/student/experiences', label: 'Interview Experiences', icon: Compass },
    { to: '/student/submit-experience', label: 'Submit Experience', icon: UploadCloud, highlight: true },
    { to: '/student/my-submissions', label: 'My Submissions', icon: FileText },
    { to: '/student/prep-tracker', label: 'Preparation Tracker', icon: CheckSquare },
    { to: '/student/bookmarks', label: 'Saved Bookmarks', icon: Bookmark },
    { to: '/student/profile', label: 'My Placement Profile', icon: Award },
  ];

  let links = [];
  let roleTitle = 'User Panel';
  let roleSubtitle = 'Placement Portal';

  if (role === 'placement_director') {
    links = directorLinks;
    roleTitle = 'Director Portal';
    roleSubtitle = 'Executive Administration';
  } else if (role === 'placement_officer') {
    links = officerLinks;
    roleTitle = 'Officer Portal';
    roleSubtitle = 'Verification & Moderation';
  } else {
    links = studentLinks;
    roleTitle = 'Student Portal';
    roleSubtitle = 'Career & Preparation';
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          {/* Role header card in sidebar */}
          <div className="px-3 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <p className="text-xs font-bold text-white uppercase tracking-wider">{roleTitle}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{roleSubtitle}</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : link.highlight
                        ? 'text-emerald-400 hover:bg-slate-800/80 hover:text-emerald-300'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom College Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-center">
          <p className="text-[11px] font-bold text-slate-400">Department of Training & Placement</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Secure College Portal v2.0</p>
        </div>
      </aside>
    </>
  );
}
