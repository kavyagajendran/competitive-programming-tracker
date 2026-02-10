
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Tracker from './pages/Tracker'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import HODDashboard from './pages/HODDashboard';

// Helper to redirect based on role
function NavigateToDashboard() {
  const role = localStorage.getItem('role') || 'student';
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'hod') return <Navigate to="/hod" replace />;
  if (role === 'staff') return <Navigate to="/staff" replace />;
  return <Navigate to="/student" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ProtectedRoute><NavigateToDashboard /></ProtectedRoute>} />

          <Route path="student" element={
            <ProtectedRoute allowedRoles={['student', 'admin', 'hod']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="staff" element={
            <ProtectedRoute allowedRoles={['staff', 'admin', 'hod']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />

          <Route path="hod" element={
            <ProtectedRoute allowedRoles={['hod', 'admin']}>
              <HODDashboard />
            </ProtectedRoute>
          } />

          <Route path="tracker" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <Tracker />
            </ProtectedRoute>
          } />

          <Route path="login" element={<Login />} />
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Admin />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
