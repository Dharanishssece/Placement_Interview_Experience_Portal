import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-slate-200 rounded-md"></div>
          <div className="h-7 w-32 bg-slate-300 rounded-lg"></div>
        </div>
        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="h-3 w-40 bg-slate-200 rounded-md"></div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200"></div>
      <div className="divide-y divide-slate-100">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="h-4 w-1/4 bg-slate-200 rounded-md"></div>
            <div className="h-4 w-1/6 bg-slate-200 rounded-md"></div>
            <div className="h-4 w-1/5 bg-slate-200 rounded-md"></div>
            <div className="h-4 w-1/12 bg-slate-200 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  if (type === 'table') return <SkeletonTable rows={count} />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
