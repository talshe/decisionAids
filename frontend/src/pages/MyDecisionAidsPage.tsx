import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { apiRequest } from '../lib/api'
import type { DecisionAidSummary, MyDecisionAidsResponse } from '../types/decisionAid'

const DecisionAidList = ({
  title,
  items,
}: {
  title: string
  items: DecisionAidSummary[]
}) => (
  <section className="card">
    <div className="section-header">
      <h2>{title}</h2>
      <span className="status-badge">{items.length}</span>
    </div>
    {items.length ? (
      <div className="list-stack">
        {items.map((item) => (
          <article key={item.id} className="list-row">
            <div>
              <h3>{item.title}</h3>
              <p className="subtitle">{item.summary}</p>
            </div>
            <Link className="inline-link" to={`/decision-aids/${item.slug}`}>
              Continue
            </Link>
          </article>
        ))}
      </div>
    ) : (
      <p className="subtitle">No decision aids in this section yet.</p>
    )}
  </section>
)

const MyDecisionAidsPage = () => {
  const { token, role } = useAuth()
  const [data, setData] = useState<MyDecisionAidsResponse>({
    assigned: [],
    favorites: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || role === 'guest') {
      return
    }

    setLoading(true)
    setError(null)

    apiRequest<MyDecisionAidsResponse>('/api/my-decision-aids', { token })
      .then((response) => setData(response))
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : 'Failed to load your decision aids.',
        ),
      )
      .finally(() => setLoading(false))
  }, [role, token])

  return (
    <div className="stack-lg">
      <section className="card hero-card">
        <div>
          <p className="eyebrow">My Decision Aids</p>
          <h2>Your assigned and saved decision aids</h2>
          <p className="subtitle">
            This page combines items assigned by an admin and decision aids you have
            favorited for quick access.
          </p>
        </div>
      </section>

      {loading ? <div className="card">Loading your decision aids...</div> : null}
      {error ? <div className="card error-text">{error}</div> : null}

      {!loading && !error ? (
        <>
          <DecisionAidList title="Assigned by admin" items={data.assigned} />
          <DecisionAidList title="Saved or favorited" items={data.favorites} />
        </>
      ) : null}
    </div>
  )
}

export default MyDecisionAidsPage
