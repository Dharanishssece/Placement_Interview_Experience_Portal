import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Building2,
  FileCheck2,
  Compass,
  KeyRound,
} from 'lucide-react';
import Badge from './Badge';

export default function Navbar({ onMenuToggle, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'placement_director') return '/director/dashboard';
    if (user.role === 'placement_officer') return '/officer/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              aria-label="Toggle Menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link to={getDashboardPath()} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-950/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  CAREER<span className="text-blue-600">PULSE</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                  College Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                Placement & Interview Experience Management
              </p>
            </div>
          </Link>
        </div>

        {/* Right Navigation / User Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Role badge */}
              <div className="hidden sm:flex items-center gap-2">
                <Badge status={user.role} />
              </div>

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-all select-none"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden md:block text-left text-xs">
                    <p className="font-bold text-slate-900 leading-tight">{user.name}</p>
                    <p className="text-slate-500 text-[11px]">
                      {user.role === 'student' ? `${user.rollNumber} • ${user.department}` : user.department}
                    </p>
                  </div>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5 sm:hidden">
                        <Badge status={user.role} />
                      </div>
                    </div>

                    <div className="py-1">
                      {user.role === 'student' && (
                        <Link
                          to="/student/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          My Profile & Offers
                        </Link>
                      )}

                      {user.role === 'placement_director' && (
                        <Link
                          to="/director/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <KeyRound className="w-4 h-4 text-slate-400" />
                          Account & Security
                        </Link>
                      )}

                      {user.role === 'placement_officer' && (
                        <Link
                          to="/officer/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <KeyRound className="w-4 h-4 text-slate-400" />
                          Account & Security
                        </Link>
                      )}

                      <Link
                        to="/student/experiences"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Compass className="w-4 h-4 text-slate-400" />
                        Explore Experiences
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 w-full text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                Student Registration
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
