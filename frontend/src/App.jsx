import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout & Protected Route Guard
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import UnauthorizedPage from './pages/public/UnauthorizedPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Director Pages
import DirectorDashboard from './pages/director/DirectorDashboard';
import CompanyManagement from './pages/director/CompanyManagement';
import PlacementDrives from './pages/director/PlacementDrives';
import PlacementAnalytics from './pages/director/PlacementAnalytics';
import PlacementReports from './pages/director/PlacementReports';
import DirectorSettings from './pages/director/DirectorSettings';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import StudentDirectory from './pages/officer/StudentDirectory';
import PlacementVerification from './pages/officer/PlacementVerification';
import ExperienceModeration from './pages/officer/ExperienceModeration';
import OfficerSettings from './pages/officer/OfficerSettings';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import CompanyDirectory from './pages/student/CompanyDirectory';
import CompanyDetail from './pages/student/CompanyDetail';
import ExperienceDirectory from './pages/student/ExperienceDirectory';
import ExperienceDetail from './pages/student/ExperienceDetail';
import SubmitExperience from './pages/student/SubmitExperience';
import MySubmissions from './pages/student/MySubmissions';
import PreparationTrackerPage from './pages/student/PreparationTrackerPage';
import BookmarksPage from './pages/student/BookmarksPage';
import StudentProfile from './pages/student/StudentProfile';

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Entry Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Public/Semi-public exploration wrapped in dashboard header for consistent navigation */}
            <Route element={<DashboardLayout />}>
              <Route path="/student/experiences" element={<ExperienceDirectory />} />
              <Route path="/student/experiences/:id" element={<ExperienceDetail />} />
              <Route path="/student/companies" element={<CompanyDirectory />} />
              <Route path="/student/companies/:id" element={<CompanyDetail />} />
            </Route>

            {/* Director Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['placement_director']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/director/dashboard" element={<DirectorDashboard />} />
                <Route path="/director/companies" element={<CompanyManagement />} />
                <Route path="/director/drives" element={<PlacementDrives />} />
                <Route path="/director/analytics" element={<PlacementAnalytics />} />
                <Route path="/director/reports" element={<PlacementReports />} />
                <Route path="/director/settings" element={<DirectorSettings />} />
              </Route>
            </Route>

            {/* Officer Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['placement_officer', 'placement_director']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/officer/dashboard" element={<OfficerDashboard />} />
                <Route path="/officer/students" element={<StudentDirectory />} />
                <Route path="/officer/placements" element={<PlacementVerification />} />
                <Route path="/officer/moderation" element={<ExperienceModeration />} />
                <Route path="/officer/settings" element={<OfficerSettings />} />
              </Route>
            </Route>

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/submit-experience" element={<SubmitExperience />} />
                <Route path="/student/my-submissions" element={<MySubmissions />} />
                <Route path="/student/prep-tracker" element={<PreparationTrackerPage />} />
                <Route path="/student/bookmarks" element={<BookmarksPage />} />
                <Route path="/student/profile" element={<StudentProfile />} />
              </Route>
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
