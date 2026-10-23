import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-slate-800/80 border border-slate-700 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
          404 Not Found
        </span>

        <h1 className="text-2xl font-bold text-white mt-3">Page Not Found</h1>
        <p className="text-slate-400 text-xs mt-2 leading-relaxed">
          The requested placement resource, company, or dashboard route could not be found.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Home className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
