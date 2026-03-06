import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import type { ExploreResponse } from '../types/decisionAid'

const ExplorePage = () => {
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
        setError(err instanceof Error ? err.message : 'Failed to load decision aids.'),
      )
      .finally(() => setLoading(false))
  }, [search, tag])

  const heading = useMemo(() => {
    if (search) {
      return `Results for "${search}"`
    }

    if (tag) {
      return `Decision aids tagged "${tag}"`
    }

    return 'Explore decision aids'
  }, [search, tag])

  return (
    <div className="stack-lg">
      <section className="card hero-card">
        <div>
          <p className="eyebrow">Explore</p>
          <h2>{heading}</h2>
          <p className="subtitle">
            Browse published decision aids and open any item in guest mode or sign
            in to save progress.
          </p>
        </div>

        <div className="toolbar">
          <label className="search-input">
            <span className="sr-only">Search decision aids</span>
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
              placeholder="Search by title, topic, or tag"
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
            <option value="">All topics</option>
            {data.availableTags.map((availableTag) => (
              <option key={availableTag} value={availableTag}>
                {availableTag}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? <div className="card">Loading decision aids...</div> : null}
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
              <p className="meta-copy">{item.estimatedMinutes} minute guided review</p>
              <Link className="inline-link" to={`/decision-aids/${item.slug}`}>
                Open decision aid
              </Link>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  )
}

export default ExplorePage
