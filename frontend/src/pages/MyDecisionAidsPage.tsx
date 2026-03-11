import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { apiRequest } from '../lib/api'
import { useLocalePath } from '../hooks/useLocale'
import type { DecisionAidSummary, MyDecisionAidsResponse } from '../types/decisionAid'

const DecisionAidList = ({
  title,
  items,
  localePath,
  continueLabel,
  emptyLabel,
}: {
  title: string
  items: DecisionAidSummary[]
  localePath: (path: string) => string
  continueLabel: string
  emptyLabel: string
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
            <Link
              className="inline-link"
              to={localePath(`decision-aids/${item.slug}`)}
            >
              {continueLabel}
            </Link>
          </article>
        ))}
      </div>
    ) : (
      <p className="subtitle">{emptyLabel}</p>
    )}
  </section>
)

const MyDecisionAidsPage = () => {
  const { t } = useTranslation()
  const localePath = useLocalePath()
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
          err instanceof Error ? err.message : t('common.failedLoadMyDecisionAids'),
        ),
      )
      .finally(() => setLoading(false))
  }, [role, token, t])

  return (
    <div className="stack-lg">
      <section className="card hero-card">
        <div>
          <p className="eyebrow">{t('myDecisionAids.eyebrow')}</p>
          <h2>{t('myDecisionAids.title')}</h2>
          <p className="subtitle">{t('myDecisionAids.subtitle')}</p>
        </div>
      </section>

      {loading ? (
        <div className="card">{t('myDecisionAids.loading')}</div>
      ) : null}
      {error ? <div className="card error-text">{error}</div> : null}

      {!loading && !error ? (
        <>
          <DecisionAidList
            title={t('myDecisionAids.assigned')}
            items={data.assigned}
            localePath={localePath}
            continueLabel={t('myDecisionAids.continue')}
            emptyLabel={t('myDecisionAids.empty')}
          />
          <DecisionAidList
            title={t('myDecisionAids.favorites')}
            items={data.favorites}
            localePath={localePath}
            continueLabel={t('myDecisionAids.continue')}
            emptyLabel={t('myDecisionAids.empty')}
          />
        </>
      ) : null}
    </div>
  )
}

export default MyDecisionAidsPage
