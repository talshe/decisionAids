import type { DecisionAid, DecisionAidSummary } from '../domain/models'

export const toDecisionAidSummary = (decisionAid: DecisionAid): DecisionAidSummary => ({
  id: decisionAid.id,
  slug: decisionAid.slug,
  title: decisionAid.title,
  summary: decisionAid.summary,
  tags: decisionAid.tags,
  estimatedMinutes: decisionAid.estimatedMinutes,
  publishStatus: decisionAid.publishStatus,
  updatedAt: decisionAid.updatedAt,
})

export const nowIso = () => new Date().toISOString()

export const sanitizeSearch = (value?: string) => value?.trim().toLowerCase() ?? ''
