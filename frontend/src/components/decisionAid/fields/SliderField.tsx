import type { SliderField as SliderFieldType } from '../../../types/decisionAid'

type SliderFieldProps = {
  field: SliderFieldType
  value: number
  readOnly: boolean
  onChange: (value: number) => void
}

const SliderField = ({
  field,
  value,
  readOnly,
  onChange,
}: SliderFieldProps) => (
  <label className="field-card">
    <span className="field-label">{field.label}</span>
    {field.helpText ? <span className="field-help">{field.helpText}</span> : null}
    <input
      className="input-range"
      type="range"
      min={field.min}
      max={field.max}
      step={field.step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      disabled={readOnly}
    />
    <div className="range-meta">
      <span>{field.minLabel || field.min}</span>
      <strong>{value}</strong>
      <span>{field.maxLabel || field.max}</span>
    </div>
  </label>
)

export default SliderField
