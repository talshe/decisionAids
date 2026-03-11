import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { apiRequest } from '../lib/api'
import type {
  AdminAssignmentsResponse,
  DecisionAid,
  DecisionAidStep,
  UserProfile,
} from '../types/decisionAid'

const emptySteps: DecisionAidStep[] = [
  {
    id: 'step-1',
    title: 'New step',
    description: 'Describe this step.',
    mode: 'content',
    contentBlocks: [
      {
        type: 'paragraph',
        id: 'block-1',
        text: 'Add content for this step.',
      },
    ],
    fields: [],
  },
]

const createDraftDecisionAid = (): DecisionAid => ({
  id: '',
  slug: 'new-decision-aid',
  title: 'New decision aid',
  summary: 'Describe the purpose of this decision aid.',
  tags: ['draft'],
  estimatedMinutes: 5,
  publishStatus: 'draft',
  createdBy: 'admin',
  createdAt: '',
  updatedAt: '',
  steps: emptySteps,
})

const AdminPage = () => {
  const { t } = useTranslation()
  const { token, profile, refreshProfile } = useAuth()
  const [decisionAids, setDecisionAids] = useState<DecisionAid[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [assignments, setAssignments] = useState<AdminAssignmentsResponse['assignments']>([])
  const [search, setSearch] = useState('')
  const [selectedAidId, setSelectedAidId] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [editor, setEditor] = useState<DecisionAid>(createDraftDecisionAid())
  const [stepsJson, setStepsJson] = useState(JSON.stringify(emptySteps, null, 2))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadAdminData = async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [decisionAidResponse, userResponse, assignmentResponse] = await Promise.all([
        apiRequest<{ items: DecisionAid[] }>('/api/admin/decision-aids', { token }),
        apiRequest<{ users: UserProfile[] }>(
          `/api/admin/users?search=${encodeURIComponent(search)}`,
          { token },
        ),
        apiRequest<AdminAssignmentsResponse>('/api/admin/assignments', { token }),
      ])

      setDecisionAids(decisionAidResponse.items)
      setUsers(userResponse.users)
      setAssignments(assignmentResponse.assignments)
      if (!selectedAidId && decisionAidResponse.items[0]) {
        setSelectedAidId(decisionAidResponse.items[0].id)
      }
      if (!selectedUserId && userResponse.users[0]) {
        setSelectedUserId(userResponse.users[0].uid)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.failedLoadAdmin'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [search, token])

  const selectedAid = useMemo(
    () => decisionAids.find((item) => item.id === selectedAidId) ?? null,
    [decisionAids, selectedAidId],
  )

  const handleSaveDecisionAid = async () => {
    if (!token || !profile) {
      return
    }

    setError(null)
    setMessage(null)

    try {
      const parsedSteps = JSON.parse(stepsJson) as DecisionAidStep[]
      const payload = {
        ...editor,
        createdBy: profile.uid,
        steps: parsedSteps,
      }

      const response = editor.id
        ? await apiRequest<{ item: DecisionAid }>(`/api/admin/decision-aids/${editor.id}`, {
            method: 'PUT',
            token,
            body: payload,
          })
        : await apiRequest<{ item: DecisionAid }>('/api/admin/decision-aids', {
            method: 'POST',
            token,
            body: payload,
          })

      setEditor(response.item)
      setStepsJson(JSON.stringify(response.item.steps, null, 2))
      setMessage(t('admin.messageSaved'))
      await loadAdminData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('common.failedSaveDecisionAid'),
      )
    }
  }

  const handleAssign = async () => {
    if (!token || !selectedAidId || !selectedUserId) {
      return
    }

    setError(null)
    setMessage(null)

    try {
      await apiRequest('/api/admin/assignments', {
        method: 'POST',
        token,
        body: { userId: selectedUserId, decisionAidId: selectedAidId },
      })
      setMessage(t('admin.messageAssigned'))
      await loadAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.failedAssign'))
    }
  }

  const handleRolePromotion = async () => {
    if (!token || !selectedUserId) {
      return
    }

    setError(null)
    setMessage(null)

    try {
      await apiRequest(`/api/admin/users/${selectedUserId}/role`, {
        method: 'POST',
        token,
        body: { role: 'admin' },
      })
      setMessage(t('admin.messagePromoted'))
      await refreshProfile()
      await loadAdminData()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.failedUpdateRole'))
    }
  }

  const resetEditor = () => {
    const draft = createDraftDecisionAid()
    setEditor(draft)
    setStepsJson(JSON.stringify(draft.steps, null, 2))
  }

  return (
    <div className="stack-lg">
      <section className="card hero-card">
        <div>
          <p className="eyebrow">{t('admin.eyebrow')}</p>
          <h2>{t('admin.title')}</h2>
          <p className="subtitle">{t('admin.subtitle')}</p>
        </div>
        <button type="button" className="ghost-button" onClick={resetEditor}>
          {t('admin.newDecisionAid')}
        </button>
      </section>

      {loading ? <div className="card">{t('admin.loading')}</div> : null}
      {message ? <div className="card success-text">{message}</div> : null}
      {error ? <div className="card error-text">{error}</div> : null}

      <section className="card-grid admin-grid">
        <section className="card">
          <div className="section-header">
            <h2>{t('admin.decisionAidsSection')}</h2>
            <span className="status-badge">{decisionAids.length}</span>
          </div>
          <div className="list-stack">
            {decisionAids.map((item) => (
              <button
                key={item.id}
                type="button"
                className="list-row list-button"
                onClick={() => {
                  setEditor(item)
                  setStepsJson(JSON.stringify(item.steps, null, 2))
                  setSelectedAidId(item.id)
                }}
              >
                <span>
                  <strong>{item.title}</strong>
                  <small className="choice-description">{item.publishStatus}</small>
                </span>
                <span className="meta-copy">{item.slug}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <h2>{t('admin.assignmentCenter')}</h2>
            <span className="status-badge">{assignments.length}</span>
          </div>

          <label className="field-card">
            <span className="field-label">{t('admin.findUsers')}</span>
            <input
              className="input-text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('admin.searchPlaceholder')}
            />
          </label>

          <div className="toolbar">
            <select
              className="select-input"
              value={selectedAidId}
              onChange={(event) => setSelectedAidId(event.target.value)}
            >
              <option value="">{t('admin.chooseDecisionAid')}</option>
              {decisionAids.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>

            <select
              className="select-input"
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
            >
              <option value="">{t('admin.chooseUser')}</option>
              {users.map((user) => (
                <option key={user.uid} value={user.uid}>
                  {user.email || user.name || user.uid}
                </option>
              ))}
            </select>
          </div>

          <div className="toolbar">
            <button type="button" className="primary-button" onClick={handleAssign}>
              {t('admin.assign')}
            </button>
            <button type="button" className="ghost-button" onClick={handleRolePromotion}>
              {t('admin.promoteAdmin')}
            </button>
          </div>

          <div className="list-stack">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="list-row">
                <span>
                  <strong>{assignment.decisionAidId}</strong>
                  <small className="choice-description">
                    {t('admin.assignedTo')} {assignment.userId}
                  </small>
                </span>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={async () => {
                    if (!token) {
                      return
                    }
                    await apiRequest(`/api/admin/assignments/${assignment.id}`, {
                      method: 'DELETE',
                      token,
                    })
                    await loadAdminData()
                  }}
                >
                  {t('admin.remove')}
                </button>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>{t('admin.editorTitle')}</h2>
          {selectedAid ? <span className="status-badge">{selectedAid.slug}</span> : null}
        </div>

        <div className="form-grid">
          <label className="field-card">
            <span className="field-label">{t('admin.fieldTitle')}</span>
            <input
              className="input-text"
              value={editor.title}
              onChange={(event) =>
                setEditor((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>
          <label className="field-card">
            <span className="field-label">{t('admin.fieldSlug')}</span>
            <input
              className="input-text"
              value={editor.slug}
              onChange={(event) =>
                setEditor((current) => ({ ...current, slug: event.target.value }))
              }
            />
          </label>
          <label className="field-card">
            <span className="field-label">{t('admin.fieldEstimatedMinutes')}</span>
            <input
              className="input-text"
              type="number"
              value={editor.estimatedMinutes}
              onChange={(event) =>
                setEditor((current) => ({
                  ...current,
                  estimatedMinutes: Number(event.target.value),
                }))
              }
            />
          </label>
          <label className="field-card">
            <span className="field-label">{t('admin.fieldPublishStatus')}</span>
            <select
              className="select-input"
              value={editor.publishStatus}
              onChange={(event) =>
                setEditor((current) => ({
                  ...current,
                  publishStatus: event.target.value as DecisionAid['publishStatus'],
                }))
              }
            >
              <option value="draft">{t('admin.statusDraft')}</option>
              <option value="published">{t('admin.statusPublished')}</option>
            </select>
          </label>
        </div>

        <label className="field-card">
          <span className="field-label">{t('admin.fieldSummary')}</span>
          <textarea
            className="input-textarea"
            rows={3}
            value={editor.summary}
            onChange={(event) =>
              setEditor((current) => ({ ...current, summary: event.target.value }))
            }
          />
        </label>

        <label className="field-card">
          <span className="field-label">{t('admin.fieldTags')}</span>
          <input
            className="input-text"
            value={editor.tags.join(', ')}
            onChange={(event) =>
              setEditor((current) => ({
                ...current,
                tags: event.target.value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              }))
            }
          />
        </label>

        <label className="field-card">
          <span className="field-label">{t('admin.fieldStepsJson')}</span>
          <textarea
            className="input-textarea code-textarea"
            rows={18}
            value={stepsJson}
            onChange={(event) => setStepsJson(event.target.value)}
          />
        </label>

        <div className="toolbar">
          <button type="button" className="primary-button" onClick={handleSaveDecisionAid}>
            {t('admin.saveDecisionAid')}
          </button>
        </div>
      </section>
    </div>
  )
}

export default AdminPage
