import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import heroIllustration from '../assets/physio-illustration.svg'
import supportIllustration from '../assets/supporting-hands.svg'

const providers = [
  { id: 'google', label: 'המשך עם Google' },
  { id: 'apple', label: 'המשך עם Apple' },
  { id: 'microsoft', label: 'המשך עם Microsoft' },
  { id: 'facebook', label: 'המשך עם Facebook' },
] as const

const LoginPage = () => {
  const { signInWithProvider, error } = useAuth()
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleSignIn = async (providerId: (typeof providers)[number]['id']) => {
    setLoadingProvider(providerId)
    try {
      await signInWithProvider(providerId)
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <div className="login-page">
      <div className="login-grid">
        <section className="login-hero">
          <div className="login-pill">Alice | עזרי החלטה</div>
          <h1>משתפים אפשרויות פיזיותרפיה בבהירות.</h1>
          <p className="login-description">
            זה המקום שבו אליס משתפת מסמכי עזר להחלטה עם מטופלים, כדי שיוכלו
            להשוות טיפולי פיזיותרפיה, להבין תוצאות ולבחור יחד את הצעד הבא.
          </p>
          <div className="login-badges">
            <span className="login-badge">הכוונה מבוססת ראיות</span>
            <span className="login-badge">סיכומים ידידותיים למטופל</span>
            <span className="login-badge">קבלת החלטות משותפת</span>
          </div>
          <div className="login-visuals">
            <img
              src={heroIllustration}
              alt="איור עזרי החלטה לפיזיותרפיה"
              className="login-illustration"
            />
            <div className="login-info-card">
              <img
                src={supportIllustration}
                alt="סמל לטיפול תומך"
                className="login-info-icon"
              />
              <div>
                <p className="login-info-title">מוכנים לכל מפגש</p>
                <p className="login-info-text">
                  שלחו עזרי החלטה מותאמים בתוך שניות.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="login-panel">
          <div className="card login-card">
            <h2>כניסה</h2>
            <p className="subtitle">
              המשיכו עם הספק המועדף כדי לגשת לספרייה.
            </p>
            <div className="button-group">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  className="primary-button"
                  onClick={() => handleSignIn(provider.id)}
                  disabled={loadingProvider === provider.id}
                >
                  {loadingProvider === provider.id
                    ? 'מתחברים...'
                    : provider.label}
                </button>
              ))}
            </div>
            {error ? <p className="error-text">{error}</p> : null}
          </div>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
