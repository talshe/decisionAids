import { useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

const getApiBaseUrl = () =>
  import.meta.env.VITE_API_BASE_URL?.toString() || 'http://localhost:5000'

const DashboardPage = () => {
  const { user, token, signOutUser } = useAuth()
  const [apiResponse, setApiResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const profile = useMemo(
    () => ({
      name: user?.displayName,
      email: user?.email,
      provider: user?.providerData?.[0]?.providerId,
      uid: user?.uid,
    }),
    [user],
  )

  const handleCallApi = async () => {
    setLoading(true)
    setError(null)
    setApiResponse('')

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Failed to fetch /api/me')
      }
      const json = await response.json()
      setApiResponse(JSON.stringify(json, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to call API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Welcome{profile.name ? `, ${profile.name}` : ''}</h1>
          <p className="subtitle">You are signed in with Firebase.</p>
        </div>
        <button type="button" className="ghost-button" onClick={signOutUser}>
          Sign out
        </button>
      </header>

      <section className="card">
        <h2>Profile</h2>
        <div className="detail-grid">
          <div>
            <span className="label">Email</span>
            <span>{profile.email || 'Not available'}</span>
          </div>
          <div>
            <span className="label">Provider</span>
            <span>{profile.provider || 'Not available'}</span>
          </div>
          <div>
            <span className="label">UID</span>
            <span>{profile.uid || 'Not available'}</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>API test</h2>
        <p className="subtitle">
          Calls the protected backend endpoint with your ID token.
        </p>
        <button
          type="button"
          className="primary-button"
          onClick={handleCallApi}
          disabled={loading}
        >
          {loading ? 'Calling API...' : 'Call /api/me'}
        </button>
        {error ? <p className="error-text">{error}</p> : null}
        {apiResponse ? (
          <pre className="code-block">{apiResponse}</pre>
        ) : null}
      </section>
    </div>
  )
}

export default DashboardPage
