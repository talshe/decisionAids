export type UserRole = 'user' | 'admin'

export type PublishStatus = 'draft' | 'published'

export type DecisionAidStepMode = 'content' | 'questions' | 'mixed'

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
  mode: DecisionAidStepMode
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
  role: UserRole
  providers: string[]
  createdAt: string
  updatedAt: string
  lastLoginAt: string
}

export type DecisionAidAssignment = {
  id: string
  userId: string
  decisionAidId: string
  assignedBy: string
  createdAt: string
}

export type DecisionAidFavorite = {
  id: string
  userId: string
  decisionAidId: string
  createdAt: string
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

export type ExploreQuery = {
  search?: string
  tag?: string
}

export type MyDecisionAidsResult = {
  assigned: DecisionAidSummary[]
  favorites: DecisionAidSummary[]
}

export type AdminDecisionAidInput = Omit<
  DecisionAid,
  'id' | 'createdAt' | 'updatedAt'
> & {
  id?: string
}
