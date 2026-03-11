import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { useLocale, useLocalePath } from '../hooks/useLocale'

const AppShell = () => {
  const { t } = useTranslation()
  const locale = useLocale()
  const localePath = useLocalePath()
  const { profile, role, signOutUser } = useAuth()
  const location = useLocation()

  const otherLocale = locale === 'he' ? 'en' : 'he'
  const pathWithoutLocale = location.pathname.replace(new RegExp(`^/${locale}`), '') || '/explore'
  const switchPath = `/${otherLocale}${pathWithoutLocale}`

  return (
    <div className="shell">
      <header className="shell-header">
        <div>
          <p className="eyebrow">{t('appShell.eyebrow')}</p>
          <h1 className="shell-title">{t('appShell.title')}</h1>
        </div>
        <div className="shell-user">
          <div>
            <span className="label">
              {role === 'guest' ? t('appShell.guest') : t('appShell.signedInAs')}
            </span>
            <p>{profile?.name || profile?.email || t('appShell.guest')}</p>
          </div>
          <div className="shell-user-actions">
            <Link
              to={switchPath}
              className="ghost-button link-as-button language-switcher"
              aria-label={locale === 'he' ? t('language.en') : t('language.he')}
            >
              {locale === 'he' ? 'EN' : 'עברית'}
            </Link>
            {role === 'guest' ? (
              <Link
                to={localePath('login')}
                className="ghost-button link-as-button"
              >
                {t('appShell.signIn')}
              </Link>
            ) : (
              <button type="button" className="ghost-button" onClick={signOutUser}>
                {t('appShell.signOut')}
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className="shell-nav">
        <NavLink
          to={localePath('explore')}
          className={({ isActive }) =>
            isActive ? 'nav-link nav-link-active' : 'nav-link'
          }
        >
          {t('nav.explore')}
        </NavLink>
        <NavLink
          to={localePath('my-decision-aids')}
          className={({ isActive }) =>
            isActive ? 'nav-link nav-link-active' : 'nav-link'
          }
        >
          {t('nav.myDecisionAids')}
        </NavLink>
        {role === 'admin' ? (
          <NavLink
            to={localePath('admin')}
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            {t('nav.admin')}
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
