import type { TextareaField as TextareaFieldType } from '../../../types/decisionAid'

type TextareaFieldProps = {
  field: TextareaFieldType
  value: string
  readOnly: boolean
  onChange: (value: string) => void
}

const TextareaField = ({
  field,
  value,
  readOnly,
  onChange,
}: TextareaFieldProps) => (
  <label className="field-card">
    <span className="field-label">{field.label}</span>
    {field.helpText ? <span className="field-help">{field.helpText}</span> : null}
    <textarea
      className="input-textarea"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder}
      maxLength={field.maxLength}
      readOnly={readOnly}
      rows={5}
    />
  </label>
)

export default TextareaField
