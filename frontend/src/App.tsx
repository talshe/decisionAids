import './App.css'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import AppShell from './components/AppShell'
import { LocaleSync } from './components/LocaleSync'
import { PageCenterLoading } from './components/PageCenterLoading'
import { RouteGate } from './components/RouteGate'
import { isValidLocale } from './i18n'
import AdminPage from './pages/AdminPage'
import DecisionAidPage from './pages/DecisionAidPage'
import ExplorePage from './pages/ExplorePage'
import LoginPage from './pages/LoginPage'
import MyDecisionAidsPage from './pages/MyDecisionAidsPage'

function getPreferredLocale(): string {
  const lang = navigator.language?.toLowerCase()
  if (lang?.startsWith('he')) return 'he'
  return 'en'
}

function LocaleRoutes() {
  const { loading, role, user } = useAuth()
  const location = useLocation()
  const pathname = location.pathname
  const segments = pathname.split('/').filter(Boolean)
  const localeParam = segments[0]
  const locale = localeParam && isValidLocale(localeParam) ? localeParam : 'en'
  const basePath = `/${locale}`

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${getPreferredLocale()}`} replace />} />
      <Route
        path="/:locale"
        element={
          localeParam && !isValidLocale(localeParam) ? (
            <Navigate to={`/en${pathname.slice(localeParam.length + 1) || '/explore'}`} replace />
          ) : (
            <>
              <LocaleSync />
              <AppShell />
            </>
          )
        }
      >
        <Route
          path="login"
          element={
            user ? (
              <Navigate to={`${basePath}/my-decision-aids`} replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route path="decision-aids/:slug" element={<DecisionAidPage />} />
        <Route
          path=""
          element={loading ? <PageCenterLoading /> : <Outlet />}
        >
          <Route index element={<Navigate to="explore" replace />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route
            path="my-decision-aids"
            element={
              <RouteGate minimumRole="user">
                <MyDecisionAidsPage />
              </RouteGate>
            }
          />
          <Route
            path="admin"
            element={
              <RouteGate minimumRole="admin">
                <AdminPage />
              </RouteGate>
            }
          />
        </Route>
        <Route
          path="dashboard"
          element={
            <Navigate
              to={
                role === 'guest'
                  ? 'explore'
                  : 'my-decision-aids'
              }
              replace
            />
          }
        />
        <Route path="*" element={<Navigate to={basePath} replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <div className="app">
      <LocaleRoutes />
    </div>
  )
}

export default App
