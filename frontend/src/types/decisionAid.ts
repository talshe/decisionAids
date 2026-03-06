export type UserRole = 'guest' | 'user' | 'admin'

export type PublishStatus = 'draft' | 'published'

export type DecisionAidContentBlock =
  | {
      type: 'paragraph'
      id: string
      text: string
    }
  | {
      type: 'bulletList'
      id: string
      title?: string
      items: string[]
    }
  | {
      type: 'callout'
      id: string
      tone: 'info' | 'warning' | 'success'
      title: string
      text: string
    }

export type DecisionAidFieldOption = {
  value: string
  label: string
  description?: string
}

type DecisionAidFieldBase = {
  id: string
  label: string
  helpText?: string
  required?: boolean
}

export type CheckboxField = DecisionAidFieldBase & {
  type: 'checkbox'
  options: DecisionAidFieldOption[]
}

export type RadioField = DecisionAidFieldBase & {
  type: 'radio'
  options: DecisionAidFieldOption[]
}

export type TextareaField = DecisionAidFieldBase & {
  type: 'textarea'
  placeholder?: string
  maxLength?: number
}

export type SliderField = DecisionAidFieldBase & {
  type: 'slider'
  min: number
  max: number
  step: number
  minLabel?: string
  maxLabel?: string
}

export type DecisionAidField =
  | CheckboxField
  | RadioField
  | TextareaField
  | SliderField

export type DecisionAidStep = {
  id: string
  title: string
  description?: string
  mode: 'content' | 'questions' | 'mixed'
  contentBlocks: DecisionAidContentBlock[]
  fields: DecisionAidField[]
}

export type DecisionAid = {
  id: string
  slug: string
  title: string
  summary: string
  tags: string[]
  estimatedMinutes: number
  publishStatus: PublishStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  steps: DecisionAidStep[]
}

export type DecisionAidSummary = Pick<
  DecisionAid,
  'id' | 'slug' | 'title' | 'summary' | 'tags' | 'estimatedMinutes' | 'publishStatus' | 'updatedAt'
>

export type UserProfile = {
  uid: string
  email: string | null
  name: string | null
  photoUrl: string | null
  role: Exclude<UserRole, 'guest'>
  providers: string[]
  createdAt: string
  updatedAt: string
  lastLoginAt: string
}

export type ExploreResponse = {
  items: DecisionAidSummary[]
  availableTags: string[]
}

export type DecisionAidResponse = {
  id: string
  userId: string
  decisionAidId: string
  currentStepIndex: number
  answers: Record<string, unknown>
  status: 'in_progress' | 'completed'
  createdAt: string
  updatedAt: string
}

export type MyDecisionAidsResponse = {
  assigned: DecisionAidSummary[]
  favorites: DecisionAidSummary[]
}

export type AuthSessionResponse = {
  uid: string
  email?: string | null
  name?: string | null
  provider?: string | null
  role: Exclude<UserRole, 'guest'>
  profile: UserProfile
}

export type AdminAssignmentsResponse = {
  assignments: {
    id: string
    userId: string
    decisionAidId: string
    assignedBy: string
    createdAt: string
  }[]
}
