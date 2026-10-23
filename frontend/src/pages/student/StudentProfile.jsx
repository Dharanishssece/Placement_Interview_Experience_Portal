import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import {
  User,
  Award,
  KeyRound,
  ShieldCheck,
  Save,
  Lock,
  GraduationCap,
  Building,
} from 'lucide-react';

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [phone, setPhone] = useState(user?.phone || '');
  const [cgpa, setCgpa] = useState(user?.cgpa || '');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [placements, setPlacements] = useState([]);

  useEffect(() => {
    const fetchMyPlacements = async () => {
      try {
        const res = await api.get('/student/dashboard-overview');
        if (res.data.success) {
          setPlacements(res.data.data?.myPlacements || []);
        }
      } catch (err) {
        console.error('Failed to load profile placements:', err);
      }
    };
    fetchMyPlacements();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const res = await api.put('/auth/profile', { phone, cgpa: Number(cgpa) });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile details updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Profile & Offers</h1>
        <p className="text-xs text-slate-500 mt-1">
          View your institutional records, verified job offers, and update security credentials
        </p>
      </div>

      {/* Verified Placement Status Cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" /> Institutional Placement Records
        </h2>

        {placements.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">
            No campus placement records registered yet. Once placed and verified by the Placement Officer, your offer letter details will appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {placements.map((p) => (
              <div
                key={p._id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{p.companyId?.name}</span>
                    <Badge status={p.verificationStatus} />
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Role: <span className="font-semibold text-slate-800">{p.jobRole}</span> • Package:{' '}
                    <span className="font-bold text-emerald-600">
                      {p.packageDisplay || `${p.packageCTC} LPA`}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Drive Year: {p.driveId?.academicYear} • Selection Date:{' '}
                    {new Date(p.selectionDate).toLocaleDateString()}
                  </p>
                </div>

                {p.verificationStatus === 'Verified' && (
                  <span className="text-emerald-700 font-bold bg-emerald-100/70 px-3 py-1 rounded-xl text-[11px] self-start sm:self-center">
                    Verified Eligible
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Form & Password Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Academic Details</h2>
              <p className="text-xs text-slate-500">Official student identity</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                disabled
                value={user?.rollNumber || ''}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-xl cursor-not-allowed uppercase font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student Name</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-xl cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registered Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-xl cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  disabled
                  value={user?.department || ''}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-xl cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="mt-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Information
            </button>
          </form>
        </div>

        {/* Password Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Change Password</h2>
              <p className="text-xs text-slate-500">Update your login security</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="mt-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
