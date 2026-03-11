import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { useLocalePath } from '../hooks/useLocale'
import heroIllustration from '../assets/physio-illustration.svg'
import supportIllustration from '../assets/supporting-hands.svg'

const PROVIDER_IDS = ['google', 'apple', 'microsoft', 'facebook'] as const

const LoginPage = () => {
  const { t } = useTranslation()
  const localePath = useLocalePath()
  const { signInWithProvider, error } = useAuth()
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleSignIn = async (providerId: (typeof PROVIDER_IDS)[number]) => {
    setLoadingProvider(providerId)
    try {
      await signInWithProvider(providerId)
    } finally {
      setLoadingProvider(null)
    }
  }

  const providerLabels: Record<(typeof PROVIDER_IDS)[number], string> = {
    google: t('login.continueWithGoogle'),
    apple: t('login.continueWithApple'),
    microsoft: t('login.continueWithMicrosoft'),
    facebook: t('login.continueWithFacebook'),
  }

  return (
    <div className="login-page">
      <div className="login-grid">
        <section className="login-hero">
          <div className="login-pill">{t('login.pill')}</div>
          <h1>{t('login.heroTitle')}</h1>
          <p className="login-description">{t('login.heroDescription')}</p>
          <div className="login-badges">
            <span className="login-badge">{t('login.badge1')}</span>
            <span className="login-badge">{t('login.badge2')}</span>
            <span className="login-badge">{t('login.badge3')}</span>
          </div>
          <div className="login-visuals">
            <img
              src={heroIllustration}
              alt={t('login.heroIllustrationAlt')}
              className="login-illustration"
            />
            <div className="login-info-card">
              <img
                src={supportIllustration}
                alt={t('login.supportIconAlt')}
                className="login-info-icon"
              />
              <div>
                <p className="login-info-title">{t('login.infoTitle')}</p>
                <p className="login-info-text">{t('login.infoText')}</p>
              </div>
            </div>
          </div>
        </section>
        <section className="login-panel">
          <div className="card login-card">
            <h2>{t('login.heading')}</h2>
            <p className="subtitle">{t('login.subtitle')}</p>
            <div className="button-group">
              {PROVIDER_IDS.map((providerId) => (
                <button
                  key={providerId}
                  type="button"
                  className="primary-button"
                  onClick={() => handleSignIn(providerId)}
                  disabled={loadingProvider === providerId}
                >
                  {loadingProvider === providerId
                    ? t('login.signingIn')
                    : providerLabels[providerId]}
                </button>
              ))}
            </div>
            <Link
              className="inline-link inline-link-center"
              to={localePath('explore')}
            >
              {t('login.continueAsGuest')}
            </Link>
            {error ? <p className="error-text">{error}</p> : null}
          </div>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
