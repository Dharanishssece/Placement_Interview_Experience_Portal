import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const loggedInUser = await login(email, password);
      toast.success(`Welcome back, ${loggedInUser.name}!`);

      // Dynamic redirection based on verified backend role
      if (loggedInUser.role === 'placement_director') {
        navigate('/director/dashboard', { replace: true });
      } else if (loggedInUser.role === 'placement_officer') {
        navigate('/officer/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Authentication failed. Please verify credentials.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');

    try {
      setLoading(true);
      const loggedInUser = await login(demoEmail, demoPassword);
      toast.success(`Logged in as ${loggedInUser.name}!`);

      if (loggedInUser.role === 'placement_director') {
        navigate('/director/dashboard', { replace: true });
      } else if (loggedInUser.role === 'placement_officer') {
        navigate('/officer/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Demo login failed.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_50%)]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xl tracking-tight text-white">
                CAREER<span className="text-blue-400">PULSE</span>
              </span>
              <p className="text-[11px] font-semibold text-slate-400">Department Placement Portal</p>
            </div>
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
            Sign In to Your Account
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Unified access for Placement Directors, Officers, and Students
          </p>
        </div>

        {/* Login Box */}
        <div className="mt-8 bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. dharanishssece@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Login Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-700/80">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              ⚡ 1-Click Evaluation Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleDemoFill('dharanishssece@gmail.com', 'Dharani@136')}
                className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50 text-purple-200 transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Director</span>
                </div>
                <p className="text-[10px] text-purple-300/70 truncate mt-0.5">dharanishssece@gmail.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('dharanishcsc@gmail.com', 'Dharani@136')}
                className="p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/50 text-blue-200 transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Officer</span>
                </div>
                <p className="text-[10px] text-blue-300/70 truncate mt-0.5">dharanishcsc@gmail.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('student1@college.edu', 'Student@123')}
                className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-emerald-200 transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Placed Student</span>
                </div>
                <p className="text-[10px] text-emerald-300/70 truncate mt-0.5">Google Placed (22CS101)</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('student5@college.edu', 'Student@123')}
                className="p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/50 text-amber-200 transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Unplaced Student</span>
                </div>
                <p className="text-[10px] text-amber-300/70 truncate mt-0.5">Vignesh Kumar (22EE105)</p>
              </button>
            </div>
          </div>

          {/* Student Register footer */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Are you a student looking to register?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
