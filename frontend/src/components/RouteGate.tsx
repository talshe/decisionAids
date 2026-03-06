import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { UserRole } from '../types/decisionAid'

type RouteGateProps = {
  minimumRole: Extract<UserRole, 'user' | 'admin'>
  children: React.ReactNode
}

export const RouteGate = ({ minimumRole, children }: RouteGateProps) => {
  const { loading, role } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="page-center">Loading...</div>
  }

  if (minimumRole === 'user' && role === 'guest') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (minimumRole === 'admin' && role !== 'admin') {
    return <Navigate to="/explore" replace />
  }

  return <>{children}</>
}
