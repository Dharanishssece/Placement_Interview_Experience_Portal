import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'blue', onClick }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'hover:border-blue-300',
      gradient: 'from-blue-600 to-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-300',
      gradient: 'from-emerald-600 to-teal-600',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'hover:border-purple-300',
      gradient: 'from-purple-600 to-pink-600',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'hover:border-amber-300',
      gradient: 'from-amber-600 to-orange-600',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'hover:border-rose-300',
      gradient: 'from-rose-600 to-red-600',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-300',
      gradient: 'from-indigo-600 to-violet-600',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      } ${scheme.border}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            {value !== undefined && value !== null ? value : '—'}
          </h3>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${scheme.bg} ${scheme.text}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {subtext && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500">
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
