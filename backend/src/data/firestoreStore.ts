import type { DecodedIdToken } from 'firebase-admin/auth'
import type { Firestore } from 'firebase-admin/firestore'
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

const collections = {
  users: 'users',
  decisionAids: 'decisionAids',
  assignments: 'decisionAidAssignments',
  favorites: 'decisionAidFavorites',
  responses: 'decisionAidResponses',
} as const

const defaultRoleForUser = (token: DecodedIdToken): UserRole =>
  token.role === 'admin' ? 'admin' : 'user'

const buildCompositeId = (userId: string, decisionAidId: string) =>
  `${userId}:${decisionAidId}`

export class FirestoreAppStore implements AppStore {
  constructor(private readonly db: Firestore) {}

  async ensureSeedData() {
    const existing = await this.db.collection(collections.decisionAids).limit(1).get()
    if (!existing.empty) {
      return
    }

    await Promise.all(
      sampleDecisionAids.map((decisionAid) =>
        this.db
          .collection(collections.decisionAids)
          .doc(decisionAid.id)
          .set(decisionAid),
      ),
    )
  }

  async bootstrapUser(token: DecodedIdToken) {
    const timestamp = nowIso()
    const ref = this.db.collection(collections.users).doc(token.uid)
    const snapshot = await ref.get()
    const existing = snapshot.exists ? (snapshot.data() as UserProfile) : null
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

    await ref.set(profile, { merge: true })
    return profile
  }

  async listUsers(search?: string) {
    const normalized = sanitizeSearch(search)
    const snapshot = await this.db.collection(collections.users).get()
    return snapshot.docs
      .map((doc) => doc.data() as UserProfile)
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
      .sort((a, b) => (a.email ?? '').localeCompare(b.email ?? ''))
  }

  async getUserById(uid: string) {
    const snapshot = await this.db.collection(collections.users).doc(uid).get()
    return snapshot.exists ? (snapshot.data() as UserProfile) : null
  }

  async setUserRole(uid: string, role: UserRole) {
    const existing = await this.getUserById(uid)
    if (!existing) {
      return null
    }

    const updated: UserProfile = {
      ...existing,
      role,
      updatedAt: nowIso(),
    }

    await this.db.collection(collections.users).doc(uid).set(updated)
    return updated
  }

  async listExploreDecisionAids(query: ExploreQuery) {
    await this.ensureSeedData()

    const snapshot = await this.db
      .collection(collections.decisionAids)
      .where('publishStatus', '==', 'published')
      .get()

    const normalizedSearch = sanitizeSearch(query.search)
    const normalizedTag = sanitizeSearch(query.tag)

    return snapshot.docs
      .map((doc) => doc.data() as DecisionAid)
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
  }

  async getPublishedDecisionAidBySlug(slug: string) {
    await this.ensureSeedData()

    const snapshot = await this.db
      .collection(collections.decisionAids)
      .where('slug', '==', slug)
      .where('publishStatus', '==', 'published')
      .limit(1)
      .get()

    if (snapshot.empty) {
      return null
    }

    return snapshot.docs[0].data() as DecisionAid
  }

  async getDecisionAidById(id: string) {
    await this.ensureSeedData()
    const snapshot = await this.db.collection(collections.decisionAids).doc(id).get()
    return snapshot.exists ? (snapshot.data() as DecisionAid) : null
  }

  async listAdminDecisionAids() {
    await this.ensureSeedData()
    const snapshot = await this.db.collection(collections.decisionAids).get()
    return snapshot.docs.map((doc) => doc.data() as DecisionAid)
  }

  async saveDecisionAid(input: AdminDecisionAidInput) {
    await this.ensureSeedData()

    const timestamp = nowIso()
    const id = input.id ?? `decision-aid-${input.slug}`
    const existing = await this.getDecisionAidById(id)
    const decisionAid: DecisionAid = {
      ...input,
      id,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }

    await this.db.collection(collections.decisionAids).doc(id).set(decisionAid)
    return decisionAid
  }

  async assignDecisionAid(userId: string, decisionAidId: string, assignedBy: string) {
    const id = buildCompositeId(userId, decisionAidId)
    const ref = this.db.collection(collections.assignments).doc(id)
    const snapshot = await ref.get()
    if (snapshot.exists) {
      return snapshot.data() as DecisionAidAssignment
    }

    const assignment: DecisionAidAssignment = {
      id,
      userId,
      decisionAidId,
      assignedBy,
      createdAt: nowIso(),
    }

    await ref.set(assignment)
    return assignment
  }

  async removeAssignment(assignmentId: string) {
    await this.db.collection(collections.assignments).doc(assignmentId).delete()
  }

  async listAssignmentsForUser(userId: string) {
    const snapshot = await this.db
      .collection(collections.assignments)
      .where('userId', '==', userId)
      .get()

    return snapshot.docs.map((doc) => doc.data() as DecisionAidAssignment)
  }

  async listAllAssignments() {
    const snapshot = await this.db.collection(collections.assignments).get()
    return snapshot.docs.map((doc) => doc.data() as DecisionAidAssignment)
  }

  async toggleFavorite(userId: string, decisionAidId: string, favorite: boolean) {
    const id = buildCompositeId(userId, decisionAidId)
    const ref = this.db.collection(collections.favorites).doc(id)
    if (!favorite) {
      await ref.delete()
      return
    }

    const payload: DecisionAidFavorite = {
      id,
      userId,
      decisionAidId,
      createdAt: nowIso(),
    }

    await ref.set(payload)
  }

  async listFavoriteIdsForUser(userId: string) {
    const snapshot = await this.db
      .collection(collections.favorites)
      .where('userId', '==', userId)
      .get()

    return snapshot.docs.map((doc) => (doc.data() as DecisionAidFavorite).decisionAidId)
  }

  async getMyDecisionAids(userId: string): Promise<MyDecisionAidsResult> {
    await this.ensureSeedData()

    const assignments = await this.listAssignmentsForUser(userId)
    const favoriteIds = await this.listFavoriteIdsForUser(userId)

    const decisionAids = await this.listAdminDecisionAids()
    const byId = new Map(decisionAids.map((decisionAid) => [decisionAid.id, decisionAid]))

    const assigned = assignments
      .map((assignment) => byId.get(assignment.decisionAidId))
      .filter((decisionAid): decisionAid is DecisionAid => Boolean(decisionAid))
      .map(toDecisionAidSummary)

    const favorites = favoriteIds
      .map((decisionAidId) => byId.get(decisionAidId))
      .filter((decisionAid): decisionAid is DecisionAid => Boolean(decisionAid))
      .map(toDecisionAidSummary)

    return {
      assigned,
      favorites,
    }
  }

  async getResponse(userId: string, decisionAidId: string) {
    const id = buildCompositeId(userId, decisionAidId)
    const snapshot = await this.db.collection(collections.responses).doc(id).get()
    return snapshot.exists ? (snapshot.data() as DecisionAidResponse) : null
  }

  async saveResponse(
    userId: string,
    decisionAidId: string,
    payload: Pick<DecisionAidResponse, 'answers' | 'currentStepIndex' | 'status'>,
  ) {
    const id = buildCompositeId(userId, decisionAidId)
    const existing = await this.getResponse(userId, decisionAidId)
    const response: DecisionAidResponse = {
      id,
      userId,
      decisionAidId,
      answers: payload.answers,
      currentStepIndex: payload.currentStepIndex,
      status: payload.status,
      createdAt: existing?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    }

    await this.db.collection(collections.responses).doc(id).set(response)
    return response
  }
}
