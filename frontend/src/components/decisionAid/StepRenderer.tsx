import CheckboxGroupField from './fields/CheckboxGroupField'
import RadioGroupField from './fields/RadioGroupField'
import SliderField from './fields/SliderField'
import TextareaField from './fields/TextareaField'
import type {
  DecisionAidField,
  DecisionAidStep,
} from '../../types/decisionAid'

type StepRendererProps = {
  step: DecisionAidStep
  answers: Record<string, unknown>
  readOnly: boolean
  onAnswerChange: (fieldId: string, value: unknown) => void
}

const getCheckboxValue = (value: unknown) => (Array.isArray(value) ? value : [])

const getStringValue = (value: unknown) => (typeof value === 'string' ? value : '')

const getNumberValue = (value: unknown, fallback: number) =>
  typeof value === 'number' ? value : fallback

const renderField = (
  field: DecisionAidField,
  value: unknown,
  readOnly: boolean,
  onAnswerChange: (fieldId: string, value: unknown) => void,
) => {
  switch (field.type) {
    case 'checkbox':
      return (
        <CheckboxGroupField
          field={field}
          value={getCheckboxValue(value)}
          readOnly={readOnly}
          onChange={(nextValue) => onAnswerChange(field.id, nextValue)}
        />
      )
    case 'radio':
      return (
        <RadioGroupField
          field={field}
          value={getStringValue(value)}
          readOnly={readOnly}
          onChange={(nextValue) => onAnswerChange(field.id, nextValue)}
        />
      )
    case 'textarea':
      return (
        <TextareaField
          field={field}
          value={getStringValue(value)}
          readOnly={readOnly}
          onChange={(nextValue) => onAnswerChange(field.id, nextValue)}
        />
      )
    case 'slider':
      return (
        <SliderField
          field={field}
          value={getNumberValue(value, field.min)}
          readOnly={readOnly}
          onChange={(nextValue) => onAnswerChange(field.id, nextValue)}
        />
      )
    default:
      return null
  }
}

const StepRenderer = ({
  step,
  answers,
  readOnly,
  onAnswerChange,
}: StepRendererProps) => (
  <section className="step-card">
    <header className="step-header">
      <div>
        <h2>{step.title}</h2>
        {step.description ? <p className="subtitle">{step.description}</p> : null}
      </div>
      {readOnly && step.fields.length ? (
        <span className="status-badge">Guest view only</span>
      ) : null}
    </header>

    <div className="content-stack">
      {step.contentBlocks.map((block) => {
        if (block.type === 'paragraph') {
          return (
            <p key={block.id} className="body-copy">
              {block.text}
            </p>
          )
        }

        if (block.type === 'bulletList') {
          return (
            <div key={block.id} className="callout">
              {block.title ? <h3>{block.title}</h3> : null}
              <ul className="bullet-list">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )
        }

        return (
          <div key={block.id} className={`callout callout-${block.tone}`}>
            <h3>{block.title}</h3>
            <p>{block.text}</p>
          </div>
        )
      })}
    </div>

    {step.fields.length ? (
      <div className="field-stack">
        {step.fields.map((field) => (
          <div key={field.id}>
            {renderField(field, answers[field.id], readOnly, onAnswerChange)}
          </div>
        ))}
      </div>
    ) : null}
  </section>
)

export default StepRenderer
