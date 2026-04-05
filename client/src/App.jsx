import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Auth Pages
import Login        from './pages/auth/Login'
import Register     from './pages/auth/Register'
import VerifyEmail  from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'

// Student Pages
import StudentDashboard  from './pages/student/Dashboard'
import StudentProfile    from './pages/student/Profile'
import StudentJobs       from './pages/student/Jobs'
import StudentApplications from './pages/student/Applications'
import ResumeChecker    from './pages/student/ResumeChecker'

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard'
import PostJob            from './pages/recruiter/PostJob'
import RecruiterJobs      from './pages/recruiter/Jobs'
import Applicants         from './pages/recruiter/Applicants'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers     from './pages/admin/Users'
import AdminJobs      from './pages/admin/Jobs'

// Shared
import Landing      from './pages/Landing'
import NotFound     from './pages/NotFound'
import Layout       from './components/Layout'
import LoadingScreen from './components/LoadingScreen'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user)    return <Navigate to={`/${user.role}/dashboard`} replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password"       element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token"   element={<VerifyEmail />} />

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard"      element={<StudentDashboard />} />
            <Route path="profile"        element={<StudentProfile />} />
            <Route path="jobs"           element={<StudentJobs />} />
            <Route path="applications"   element={<StudentApplications />} />
            <Route path="resume-check"   element={<ResumeChecker />} />
          </Route>

          {/* Recruiter */}
          <Route path="/recruiter" element={<ProtectedRoute roles={['recruiter']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard"         element={<RecruiterDashboard />} />
            <Route path="post-job"          element={<PostJob />} />
            <Route path="jobs"              element={<RecruiterJobs />} />
            <Route path="applicants/:jobId" element={<Applicants />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users"     element={<AdminUsers />} />
            <Route path="jobs"      element={<AdminJobs />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
