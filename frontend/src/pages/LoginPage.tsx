import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

const providers = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'apple', label: 'Continue with Apple' },
  { id: 'microsoft', label: 'Continue with Microsoft' },
  { id: 'facebook', label: 'Continue with Facebook' },
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
    <div className="page-center">
      <div className="card">
        <h1>Sign in</h1>
        <p className="subtitle">
          Use your preferred provider to access the app.
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
                ? 'Signing in...'
                : provider.label}
            </button>
          ))}
        </div>
        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </div>
  )
}

export default LoginPage
