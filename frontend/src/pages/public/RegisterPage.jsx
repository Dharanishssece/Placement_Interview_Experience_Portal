import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Hash,
  Building,
  Phone,
  ArrowRight,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    password: '',
    department: 'CSE',
    phone: '',
    batch: '2022-2026',
    cgpa: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { registerStudent } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Pre-check reserved emails client side for immediate feedback
    const normalizedEmail = formData.email.toLowerCase().trim();
    if (
      normalizedEmail === 'dharanishssece@gmail.com' ||
      normalizedEmail === 'dharanishcsc@gmail.com'
    ) {
      const msg = 'This email cannot be used for student registration.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (!formData.name || !formData.rollNumber || !formData.email || !formData.password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const user = await registerStudent({
        ...formData,
        rollNumber: formData.rollNumber.toUpperCase().trim(),
        email: normalizedEmail,
      });

      toast.success('Registration successful! Welcome to the Placement Portal.');
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration failed:', err);
      const msg = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.12),transparent_50%)]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xl tracking-tight text-white">
                CAREER<span className="text-emerald-400">PULSE</span>
              </span>
              <p className="text-[11px] font-semibold text-slate-400">Student Portal</p>
            </div>
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
            Student Account Registration
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Create your account to view verified interview questions and track placements
          </p>
        </div>

        <div className="mt-8 bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl">
          {/* Security Notice */}
          <div className="mb-6 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-blue-300 text-xs">
            <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong>Academic Security:</strong> Administrative accounts (Director & Officer) are provisioned offline. Public registration generates verified student accounts only.
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Roll Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="e.g. 22CS101"
                    required
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@college.edu"
                    required
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Building className="w-4 h-4" />
                  </div>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="IT">IT (Information Technology)</option>
                    <option value="ECE">ECE (Electronics & Comm.)</option>
                    <option value="EEE">EEE (Electrical & Electronics)</option>
                    <option value="MECH">MECH (Mechanical Engg.)</option>
                    <option value="CIVIL">CIVIL (Civil Engg.)</option>
                    <option value="AIDS">AIDS (AI & Data Science)</option>
                    <option value="AIML">AIML (AI & Machine Learning)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Batch</label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  placeholder="2022-2026"
                  className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">CGPA (0 - 10)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="e.g. 8.75"
                  className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a secure password (min 6 chars)"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mt-4 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering Account...
                </>
              ) : (
                <>
                  Create Student Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
