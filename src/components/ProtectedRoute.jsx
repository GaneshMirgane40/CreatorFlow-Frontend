import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  // Not authenticated -> redirect to login, preserve current location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role-based protection (optional)
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  // Authorized -> render nested routes
  return <Outlet />
}

