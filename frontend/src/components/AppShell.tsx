import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const AppShell = () => {
  const { profile, role, signOutUser } = useAuth()

  return (
    <div className="shell">
      <header className="shell-header">
        <div>
          <p className="eyebrow">Decision Aids</p>
          <h1 className="shell-title">Guided treatment choices for every patient</h1>
        </div>
        <div className="shell-user">
          <div>
            <span className="label">Signed in as</span>
            <p>{profile?.name || profile?.email || 'Guest'}</p>
          </div>
          {role === 'guest' ? null : (
            <button type="button" className="ghost-button" onClick={signOutUser}>
              Sign out
            </button>
          )}
        </div>
      </header>

      <nav className="shell-nav">
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            isActive ? 'nav-link nav-link-active' : 'nav-link'
          }
        >
          Explore
        </NavLink>
        <NavLink
          to="/my-decision-aids"
          className={({ isActive }) =>
            isActive ? 'nav-link nav-link-active' : 'nav-link'
          }
        >
          My Decision Aids
        </NavLink>
        {role === 'admin' ? (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Admin
          </NavLink>
        ) : null}
      </nav>

      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
