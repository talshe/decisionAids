import type { DecodedIdToken } from 'firebase-admin/auth'
import type {
  AdminDecisionAidInput,
  DecisionAid,
  DecisionAidAssignment,
  DecisionAidResponse,
  ExploreQuery,
  MyDecisionAidsResult,
  UserProfile,
  UserRole,
} from '../domain/models'

export type ExploreResult = {
  items: DecisionAid[]
}

export type AppStore = {
  ensureSeedData: () => Promise<void>
  bootstrapUser: (token: DecodedIdToken) => Promise<UserProfile>
  listUsers: (search?: string) => Promise<UserProfile[]>
  getUserById: (uid: string) => Promise<UserProfile | null>
  setUserRole: (uid: string, role: UserRole) => Promise<UserProfile | null>
  listExploreDecisionAids: (query: ExploreQuery) => Promise<DecisionAid[]>
  getPublishedDecisionAidBySlug: (slug: string) => Promise<DecisionAid | null>
  getDecisionAidById: (id: string) => Promise<DecisionAid | null>
  listAdminDecisionAids: () => Promise<DecisionAid[]>
  saveDecisionAid: (input: AdminDecisionAidInput) => Promise<DecisionAid>
  assignDecisionAid: (
    userId: string,
    decisionAidId: string,
    assignedBy: string,
  ) => Promise<DecisionAidAssignment>
  removeAssignment: (assignmentId: string) => Promise<void>
  listAssignmentsForUser: (userId: string) => Promise<DecisionAidAssignment[]>
  listAllAssignments: () => Promise<DecisionAidAssignment[]>
  toggleFavorite: (
    userId: string,
    decisionAidId: string,
    favorite: boolean,
  ) => Promise<void>
  listFavoriteIdsForUser: (userId: string) => Promise<string[]>
  getMyDecisionAids: (userId: string) => Promise<MyDecisionAidsResult>
  getResponse: (userId: string, decisionAidId: string) => Promise<DecisionAidResponse | null>
  saveResponse: (
    userId: string,
    decisionAidId: string,
    payload: Pick<DecisionAidResponse, 'answers' | 'currentStepIndex' | 'status'>,
  ) => Promise<DecisionAidResponse>
}
