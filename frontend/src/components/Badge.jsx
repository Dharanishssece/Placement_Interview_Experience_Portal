import React from 'react';

const badgeStyles = {
  // Roles
  placement_director: 'bg-purple-100 text-purple-800 border-purple-200',
  placement_officer: 'bg-blue-100 text-blue-800 border-blue-200',
  student: 'bg-emerald-100 text-emerald-800 border-emerald-200',

  // Verification & Moderation Statuses
  Verified: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  Pending: 'bg-amber-50 text-amber-700 border-amber-300',
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-300',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-300',
  Revoked: 'bg-rose-50 text-rose-700 border-rose-300',

  // Account Status
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  suspended: 'bg-rose-50 text-rose-700 border-rose-200',

  // Drive Status
  Scheduled: 'bg-sky-50 text-sky-700 border-sky-300',
  Ongoing: 'bg-amber-50 text-amber-700 border-amber-300',
  Completed: 'bg-slate-100 text-slate-700 border-slate-300',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-300',

  // Difficulty
  Easy: 'bg-teal-50 text-teal-700 border-teal-300',
  Medium: 'bg-blue-50 text-blue-700 border-blue-300',
  Hard: 'bg-orange-50 text-orange-700 border-orange-300',
  'Very Hard': 'bg-rose-50 text-rose-700 border-rose-300',

  // Company Tiers
  'Tier 1 (Dream)': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Tier 2 (Core)': 'bg-blue-50 text-blue-700 border-blue-200',
  'Tier 3 (Mass / IT Services)': 'bg-slate-100 text-slate-700 border-slate-200',
  Startup: 'bg-amber-50 text-amber-700 border-amber-200',
};

const formatLabel = (status) => {
  if (status === 'placement_director') return 'Placement Director';
  if (status === 'placement_officer') return 'Placement Officer';
  if (status === 'student') return 'Student';
  return status;
};

export default function Badge({ status, label, className = '' }) {
  const style = badgeStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const display = label || formatLabel(status) || 'Unknown';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {display}
    </span>
  );
}
