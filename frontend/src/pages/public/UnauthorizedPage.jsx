import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'placement_director') return '/director/dashboard';
    if (user.role === 'placement_officer') return '/officer/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-slate-800/80 border border-slate-700 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
          403 Forbidden
        </span>

        <h1 className="text-2xl font-bold text-white mt-3">Access Denied</h1>
        <p className="text-slate-400 text-xs mt-2 leading-relaxed">
          You do not possess administrative permissions to access this institutional page. Your role is{' '}
          <strong className="text-white uppercase font-bold">{user?.role || 'Guest'}</strong>.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={getDashboardPath()}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Go to My Dashboard
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
