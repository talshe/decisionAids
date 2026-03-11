import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import FlowShell from '../components/decisionAid/FlowShell'
import StepRenderer from '../components/decisionAid/StepRenderer'
import { apiRequest } from '../lib/api'
import type { DecisionAid, DecisionAidResponse } from '../types/decisionAid'

const DecisionAidPage = () => {
  const { slug } = useParams()
  const { t } = useTranslation()
  const { role, token } = useAuth()
  const [decisionAid, setDecisionAid] = useState<DecisionAid | null>(null)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [response, setResponse] = useState<DecisionAidResponse | null>(null)
  const [favorite, setFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const readOnly = role === 'guest'

  useEffect(() => {
    if (!slug) {
      return
    }

    setLoading(true)
    setError(null)

    apiRequest<{ item: DecisionAid }>(`/api/decision-aids/${slug}`)
      .then((result) => setDecisionAid(result.item))
      .catch((err) =>
        setError(err instanceof Error ? err.message : t('common.failedLoadDecisionAid')),
      )
      .finally(() => setLoading(false))
  }, [slug, t])

  useEffect(() => {
    if (!decisionAid || !token || readOnly) {
      return
    }

    apiRequest<{ response: DecisionAidResponse | null }>(
      `/api/decision-aids/${decisionAid.id}/responses`,
      { token },
    )
      .then((result) => {
        setResponse(result.response)
        if (result.response) {
          setAnswers(result.response.answers)
          setCurrentStepIndex(result.response.currentStepIndex)
        }
      })
      .catch(() => {
        setResponse(null)
      })
  }, [decisionAid, readOnly, token])

  const currentStep = useMemo(
    () => decisionAid?.steps[currentStepIndex] ?? null,
    [currentStepIndex, decisionAid],
  )

  const saveProgress = async (status: 'in_progress' | 'completed') => {
    if (!decisionAid || !token || readOnly) {
      return
    }

    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      const result = await apiRequest<{ response: DecisionAidResponse }>(
        `/api/decision-aids/${decisionAid.id}/responses`,
        {
          method: 'POST',
          token,
          body: {
            answers,
            currentStepIndex,
            status,
          },
        },
      )
      setResponse(result.response)
      setMessage(
        status === 'completed'
          ? t('decisionAid.responsesSaved')
          : t('decisionAid.progressSaved'),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.failedSaveProgress'))
    } finally {
      setSaving(false)
    }
  }

  const toggleFavorite = async () => {
    if (!decisionAid || !token || readOnly) {
      return
    }

    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      const nextFavorite = !favorite
      await apiRequest<{ favorite: boolean }>(
        `/api/decision-aids/${decisionAid.id}/favorite`,
        {
          method: 'POST',
          token,
          body: { favorite: nextFavorite },
        },
      )
      setFavorite(nextFavorite)
      setMessage(
        nextFavorite
          ? t('decisionAid.addedToFavorites')
          : t('decisionAid.removedFromFavorites'),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.failedUpdateFavorite'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="card">{t('decisionAid.loading')}</div>
  }

  if (error && !decisionAid) {
    return <div className="card error-text">{error}</div>
  }

  if (!decisionAid || !currentStep) {
    return <div className="card">{t('decisionAid.notFound')}</div>
  }

  return (
    <div className="stack-lg">
      <section className="card hero-card">
        <div>
          <p className="eyebrow">{t('decisionAid.eyebrow')}</p>
          <h2>{decisionAid.title}</h2>
          <p className="subtitle">{decisionAid.summary}</p>
        </div>
        <div className="hero-actions">
          <span className="status-badge">
            {t('decisionAid.minutes', { count: decisionAid.estimatedMinutes })}
          </span>
          {readOnly ? (
            <span className="status-badge status-badge-muted">
              {t('decisionAid.guestViewOnly')}
            </span>
          ) : (
            <button
              type="button"
              className="ghost-button"
              onClick={toggleFavorite}
              disabled={saving}
            >
              {favorite
                ? t('decisionAid.removeFavorite')
                : t('decisionAid.saveToFavorites')}
            </button>
          )}
        </div>
      </section>

      <FlowShell
        currentStepIndex={currentStepIndex}
        totalSteps={decisionAid.steps.length}
        canGoBack={currentStepIndex > 0}
        canGoForward={currentStepIndex < decisionAid.steps.length - 1}
        onBack={() => setCurrentStepIndex((current) => Math.max(current - 1, 0))}
        onForward={() =>
          setCurrentStepIndex((current) =>
            Math.min(current + 1, decisionAid.steps.length - 1),
          )
        }
        footer={
          <div className="card footer-card">
            {message ? <p className="success-text">{message}</p> : null}
            {error ? <p className="error-text">{error}</p> : null}
            {readOnly ? (
              <p className="subtitle">{t('decisionAid.guestHint')}</p>
            ) : (
              <div className="toolbar">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => saveProgress('in_progress')}
                  disabled={saving}
                >
                  {saving ? t('decisionAid.saving') : t('decisionAid.saveProgress')}
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => saveProgress('completed')}
                  disabled={saving}
                >
                  {t('decisionAid.markComplete')}
                </button>
                {response ? (
                  <span className="status-badge">
                    {t('decisionAid.savedStep', {
                      step: response.currentStepIndex + 1,
                    })}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        }
      >
        <StepRenderer
          step={currentStep}
          answers={answers}
          readOnly={readOnly}
          onAnswerChange={(fieldId, value) =>
            setAnswers((current) => ({
              ...current,
              [fieldId]: value,
            }))
          }
        />
      </FlowShell>
    </div>
  )
}

export default DecisionAidPage
