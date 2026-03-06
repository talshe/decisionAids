import type { DecodedIdToken } from 'firebase-admin/auth'
import type {
  AdminDecisionAidInput,
  DecisionAid,
  DecisionAidAssignment,
  DecisionAidFavorite,
  DecisionAidResponse,
  ExploreQuery,
  MyDecisionAidsResult,
  UserProfile,
  UserRole,
} from '../domain/models'
import { toDecisionAidSummary, nowIso, sanitizeSearch } from './helpers'
import { sampleDecisionAids } from './seedData'
import type { AppStore } from './appStore'

const buildAssignmentId = (userId: string, decisionAidId: string) =>
  `${userId}:${decisionAidId}`

const buildFavoriteId = (userId: string, decisionAidId: string) =>
  `${userId}:${decisionAidId}`

const buildResponseId = (userId: string, decisionAidId: string) =>
  `${userId}:${decisionAidId}`

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const defaultRoleForUser = (token: DecodedIdToken): UserRole =>
  token.role === 'admin' ? 'admin' : 'user'

export class MemoryAppStore implements AppStore {
  private seeded = false
  private decisionAids = new Map<string, DecisionAid>()
  private users = new Map<string, UserProfile>()
  private assignments = new Map<string, DecisionAidAssignment>()
  private favorites = new Map<string, DecisionAidFavorite>()
  private responses = new Map<string, DecisionAidResponse>()

  async ensureSeedData() {
    if (this.seeded) {
      return
    }

    sampleDecisionAids.forEach((decisionAid) => {
      this.decisionAids.set(decisionAid.id, clone(decisionAid))
    })
    this.seeded = true
  }

  async bootstrapUser(token: DecodedIdToken) {
    const timestamp = nowIso()
    const existing = this.users.get(token.uid)
    const providers = token.firebase?.sign_in_provider
      ? [token.firebase.sign_in_provider]
      : []

    const profile: UserProfile = {
      uid: token.uid,
      email: token.email ?? null,
      name: token.name ?? null,
      photoUrl: token.picture ?? null,
      role: existing?.role ?? defaultRoleForUser(token),
      providers,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
      lastLoginAt: timestamp,
    }

    this.users.set(profile.uid, profile)
    return clone(profile)
  }

  async listUsers(search?: string) {
    const normalized = sanitizeSearch(search)
    return [...this.users.values()]
      .filter((user) => {
        if (!normalized) {
          return true
        }

        const haystack = [user.email, user.name, user.uid]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return haystack.includes(normalized)
      })
      .sort((a, b) => a.email?.localeCompare(b.email ?? '') ?? 0)
      .map((user) => clone(user))
  }

  async getUserById(uid: string) {
    return clone(this.users.get(uid) ?? null)
  }

  async setUserRole(uid: string, role: UserRole) {
    const existing = this.users.get(uid)
    if (!existing) {
      return null
    }

    const updated: UserProfile = {
      ...existing,
      role,
      updatedAt: nowIso(),
    }

    this.users.set(uid, updated)
    return clone(updated)
  }

  async listExploreDecisionAids(query: ExploreQuery) {
    await this.ensureSeedData()

    const normalizedSearch = sanitizeSearch(query.search)
    const normalizedTag = sanitizeSearch(query.tag)

    return [...this.decisionAids.values()]
      .filter((decisionAid) => decisionAid.publishStatus === 'published')
      .filter((decisionAid) => {
        if (!normalizedSearch) {
          return true
        }

        const haystack = [
          decisionAid.title,
          decisionAid.summary,
          decisionAid.tags.join(' '),
        ]
          .join(' ')
          .toLowerCase()

        return haystack.includes(normalizedSearch)
      })
      .filter((decisionAid) => {
        if (!normalizedTag) {
          return true
        }

        return decisionAid.tags.some((tag) => tag.toLowerCase() === normalizedTag)
      })
      .map((decisionAid) => clone(decisionAid))
  }

  async getPublishedDecisionAidBySlug(slug: string) {
    await this.ensureSeedData()

    const match = [...this.decisionAids.values()].find(
      (decisionAid) =>
        decisionAid.slug === slug && decisionAid.publishStatus === 'published',
    )

    return clone(match ?? null)
  }

  async getDecisionAidById(id: string) {
    await this.ensureSeedData()
    return clone(this.decisionAids.get(id) ?? null)
  }

  async listAdminDecisionAids() {
    await this.ensureSeedData()
    return [...this.decisionAids.values()].map((decisionAid) => clone(decisionAid))
  }

  async saveDecisionAid(input: AdminDecisionAidInput) {
    await this.ensureSeedData()

    const timestamp = nowIso()
    const id = input.id ?? `decision-aid-${input.slug}`
    const existing = this.decisionAids.get(id)

    const decisionAid: DecisionAid = {
      ...input,
      id,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }

    this.decisionAids.set(id, clone(decisionAid))
    return clone(decisionAid)
  }

  async assignDecisionAid(userId: string, decisionAidId: string, assignedBy: string) {
    const assignmentId = buildAssignmentId(userId, decisionAidId)
    const existing = this.assignments.get(assignmentId)
    if (existing) {
      return clone(existing)
    }

    const assignment: DecisionAidAssignment = {
      id: assignmentId,
      userId,
      decisionAidId,
      assignedBy,
      createdAt: nowIso(),
    }

    this.assignments.set(assignmentId, assignment)
    return clone(assignment)
  }

  async removeAssignment(assignmentId: string) {
    this.assignments.delete(assignmentId)
  }

  async listAssignmentsForUser(userId: string) {
    return [...this.assignments.values()]
      .filter((assignment) => assignment.userId === userId)
      .map((assignment) => clone(assignment))
  }

  async listAllAssignments() {
    return [...this.assignments.values()].map((assignment) => clone(assignment))
  }

  async toggleFavorite(userId: string, decisionAidId: string, favorite: boolean) {
    const favoriteId = buildFavoriteId(userId, decisionAidId)
    if (!favorite) {
      this.favorites.delete(favoriteId)
      return
    }

    this.favorites.set(favoriteId, {
      id: favoriteId,
      userId,
      decisionAidId,
      createdAt: nowIso(),
    })
  }

  async listFavoriteIdsForUser(userId: string) {
    return [...this.favorites.values()]
      .filter((favorite) => favorite.userId === userId)
      .map((favorite) => favorite.decisionAidId)
  }

  async getMyDecisionAids(userId: string): Promise<MyDecisionAidsResult> {
    await this.ensureSeedData()

    const assignments = await this.listAssignmentsForUser(userId)
    const favoriteIds = await this.listFavoriteIdsForUser(userId)

    const assigned = assignments
      .map((assignment) => this.decisionAids.get(assignment.decisionAidId))
      .filter((decisionAid): decisionAid is DecisionAid => Boolean(decisionAid))
      .map(toDecisionAidSummary)

    const favorites = favoriteIds
      .map((decisionAidId) => this.decisionAids.get(decisionAidId))
      .filter((decisionAid): decisionAid is DecisionAid => Boolean(decisionAid))
      .map(toDecisionAidSummary)

    return {
      assigned,
      favorites,
    }
  }

  async getResponse(userId: string, decisionAidId: string) {
    const responseId = buildResponseId(userId, decisionAidId)
    return clone(this.responses.get(responseId) ?? null)
  }

  async saveResponse(
    userId: string,
    decisionAidId: string,
    payload: Pick<DecisionAidResponse, 'answers' | 'currentStepIndex' | 'status'>,
  ) {
    const timestamp = nowIso()
    const responseId = buildResponseId(userId, decisionAidId)
    const existing = this.responses.get(responseId)
    const response: DecisionAidResponse = {
      id: responseId,
      userId,
      decisionAidId,
      answers: payload.answers,
      currentStepIndex: payload.currentStepIndex,
      status: payload.status,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }

    this.responses.set(responseId, response)
    return clone(response)
  }
}
