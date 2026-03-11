import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { useLocalePath } from '../hooks/useLocale'
import type { UserRole } from '../types/decisionAid'

type RouteGateProps = {
  minimumRole: Extract<UserRole, 'user' | 'admin'>
  children: React.ReactNode
}

export const RouteGate = ({ minimumRole, children }: RouteGateProps) => {
  const { loading, role } = useAuth()
  const location = useLocation()
  const localePath = useLocalePath()
  const { t } = useTranslation()

  if (loading) {
    return <div className="page-center">{t('common.loading')}</div>
  }

  if (minimumRole === 'user' && role === 'guest') {
    return (
      <Navigate
        to={localePath('login')}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (minimumRole === 'admin' && role !== 'admin') {
    return <Navigate to={localePath('explore')} replace />
  }

  return <>{children}</>
}
