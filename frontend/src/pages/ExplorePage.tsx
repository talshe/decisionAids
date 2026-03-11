import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiRequest } from '../lib/api'
import { useLocalePath } from '../hooks/useLocale'
import type { ExploreResponse } from '../types/decisionAid'

const ExplorePage = () => {
  const { t } = useTranslation()
  const localePath = useLocalePath()
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<ExploreResponse>({ items: [], availableTags: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const search = searchParams.get('search') ?? ''
  const tag = searchParams.get('tag') ?? ''

  useEffect(() => {
    const query = new URLSearchParams()
    if (search) query.set('search', search)
    if (tag) query.set('tag', tag)

    setLoading(true)
    setError(null)

    apiRequest<ExploreResponse>(`/api/explore?${query.toString()}`)
      .then((response) => setData(response))
      .catch((err) =>
        setError(err instanceof Error ? err.message : t('common.failedLoadDecisionAids')),
      )
      .finally(() => setLoading(false))
  }, [search, tag, t])

  const heading = useMemo(() => {
    if (search) {
      return t('explore.headingSearch', { search })
    }
    if (tag) {
      return t('explore.headingTag', { tag })
    }
    return t('explore.headingDefault')
  }, [search, tag, t])

  return (
    <div className="stack-lg">
      <section className="card hero-card">
        <div>
          <p className="eyebrow">{t('explore.eyebrow')}</p>
          <h2>{heading}</h2>
          <p className="subtitle">{t('explore.subtitle')}</p>
        </div>

        <div className="toolbar">
          <label className="search-input">
            <span className="sr-only">{t('explore.searchLabel')}</span>
            <input
              value={search}
              onChange={(event) => {
                const next = new URLSearchParams(searchParams)
                if (event.target.value) {
                  next.set('search', event.target.value)
                } else {
                  next.delete('search')
                }
                setSearchParams(next)
              }}
              placeholder={t('explore.searchPlaceholder')}
            />
          </label>
          <select
            className="select-input"
            value={tag}
            onChange={(event) => {
              const next = new URLSearchParams(searchParams)
              if (event.target.value) {
                next.set('tag', event.target.value)
              } else {
                next.delete('tag')
              }
              setSearchParams(next)
            }}
          >
            <option value="">{t('explore.allTopics')}</option>
            {data.availableTags.map((availableTag) => (
              <option key={availableTag} value={availableTag}>
                {availableTag}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? <div className="card">{t('explore.loading')}</div> : null}
      {error ? <div className="card error-text">{error}</div> : null}

      {!loading && !error ? (
        <section className="card-grid">
          {data.items.map((item) => (
            <article key={item.id} className="card decision-aid-card">
              <div className="tag-row">
                {item.tags.map((itemTag) => (
                  <span key={itemTag} className="tag">
                    {itemTag}
                  </span>
                ))}
              </div>
              <h3>{item.title}</h3>
              <p className="subtitle">{item.summary}</p>
              <p className="meta-copy">
                {t('explore.minuteReview', { count: item.estimatedMinutes })}
              </p>
              <Link
                className="inline-link"
                to={localePath(`decision-aids/${item.slug}`)}
              >
                {t('explore.openDecisionAid')}
              </Link>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  )
}

export default ExplorePage
