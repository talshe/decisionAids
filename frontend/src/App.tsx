import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import AppShell from './components/AppShell'
import { RouteGate } from './components/RouteGate'
import AdminPage from './pages/AdminPage'
import DecisionAidPage from './pages/DecisionAidPage'
import ExplorePage from './pages/ExplorePage'
import LoginPage from './pages/LoginPage'
import MyDecisionAidsPage from './pages/MyDecisionAidsPage'

function App() {
  const { loading, role, user } = useAuth()

  return (
    <div className="app">
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/my-decision-aids" replace /> : <LoginPage />}
        />
        <Route path="/decision-aids/:slug" element={<DecisionAidPage />} />
        <Route
          path="/"
          element={
            loading ? (
              <div className="page-center">Loading...</div>
            ) : (
              <AppShell />
            )
          }
        >
          <Route index element={<Navigate to="/explore" replace />} />
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
          path="/dashboard"
          element={<Navigate to={role === 'guest' ? '/explore' : '/my-decision-aids'} replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
