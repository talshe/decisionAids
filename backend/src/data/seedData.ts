import type { DecisionAid } from '../domain/models'

const now = '2026-03-06T00:00:00.000Z'

export const sampleDecisionAids: DecisionAid[] = [
  {
    id: 'decision-aid-lower-back-pain',
    slug: 'lower-back-pain-options',
    title: 'Lower Back Pain Treatment Options',
    summary:
      'Compare conservative treatment paths for ongoing lower back pain before choosing the next step with your clinician.',
    tags: ['physiotherapy', 'pain-management', 'mobility'],
    estimatedMinutes: 8,
    publishStatus: 'published',
    createdBy: 'system',
    createdAt: now,
    updatedAt: now,
    steps: [
      {
        id: 'overview',
        title: 'Understand your options',
        description: 'Review the main pathways before you start answering questions.',
        mode: 'content',
        contentBlocks: [
          {
            type: 'paragraph',
            id: 'intro',
            text: 'Most people begin with education, targeted exercises, and symptom management before considering more invasive treatments.',
          },
          {
            type: 'bulletList',
            id: 'options',
            title: 'Common paths discussed in clinic',
            items: [
              'Home exercise and self-management',
              'Supervised physiotherapy',
              'Pain-relief medication',
              'Referral for specialist review when symptoms persist',
            ],
          },
        ],
        fields: [],
      },
      {
        id: 'priorities',
        title: 'Your priorities',
        description: 'Share what matters most so the next discussion can focus on your goals.',
        mode: 'mixed',
        contentBlocks: [
          {
            type: 'callout',
            id: 'tip',
            tone: 'info',
            title: 'There is no single best treatment',
            text: 'The right choice depends on your goals, pain tolerance, daily routine, and how much support you want.',
          },
        ],
        fields: [
          {
            type: 'checkbox',
            id: 'goals',
            label: 'Which outcomes matter most to you?',
            helpText: 'Choose any that apply.',
            options: [
              { value: 'pain-relief', label: 'Reduce pain quickly' },
              { value: 'mobility', label: 'Improve movement and flexibility' },
              { value: 'avoid-meds', label: 'Avoid medication if possible' },
              { value: 'low-cost', label: 'Keep treatment low cost' },
            ],
          },
          {
            type: 'slider',
            id: 'confidence',
            label: 'How confident do you feel about doing a home programme?',
            min: 0,
            max: 10,
            step: 1,
            minLabel: 'Not confident',
            maxLabel: 'Very confident',
          },
        ],
      },
      {
        id: 'notes',
        title: 'Questions for your clinician',
        description: 'Capture any concerns or preferences you want to discuss at your next appointment.',
        mode: 'questions',
        contentBlocks: [],
        fields: [
          {
            type: 'radio',
            id: 'support-level',
            label: 'What level of support would you prefer?',
            options: [
              { value: 'self-guided', label: 'Mostly self-guided' },
              { value: 'blended', label: 'A mix of self-guided and supervised' },
              { value: 'supervised', label: 'Regular supervised sessions' },
            ],
          },
          {
            type: 'textarea',
            id: 'notes',
            label: 'Anything else you want your clinician to know?',
            placeholder: 'Write any concerns, barriers, or goals here.',
            maxLength: 600,
          },
        ],
      },
    ],
  },
]
