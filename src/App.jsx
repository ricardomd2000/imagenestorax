import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Quiz from './pages/Quiz'
import ImageIdentification from './pages/ImageIdentification'
import ClinicalCases from './pages/ClinicalCases'
import TeacherDashboard from './pages/TeacherDashboard'

const ProtectedRoute = ({ children, role }) => {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-deep text-white">
      <div className="animate-pulse">Cargando aplicación...</div>
    </div>
  )
  
  if (!user) return <Navigate to="/login" />
  
  if (role && profile?.rol !== role) return <Navigate to="/dashboard" />
  
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/quiz" element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        } />

        <Route path="/identificacion" element={
          <ProtectedRoute>
            <ImageIdentification />
          </ProtectedRoute>
        } />

        <Route path="/casos" element={
          <ProtectedRoute>
            <ClinicalCases />
          </ProtectedRoute>
        } />

        <Route path="/teacher" element={
          <ProtectedRoute role="docente">
            <TeacherDashboard />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
