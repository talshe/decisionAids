import type { RadioField } from '../../../types/decisionAid'

type RadioGroupFieldProps = {
  field: RadioField
  value: string
  readOnly: boolean
  onChange: (value: string) => void
}

const RadioGroupField = ({
  field,
  value,
  readOnly,
  onChange,
}: RadioGroupFieldProps) => (
  <fieldset className="field-card" disabled={readOnly}>
    <legend>{field.label}</legend>
    {field.helpText ? <p className="field-help">{field.helpText}</p> : null}
    <div className="field-stack">
      {field.options.map((option) => (
        <label key={option.value} className="choice-row">
          <input
            type="radio"
            name={field.id}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>
            {option.label}
            {option.description ? (
              <small className="choice-description">{option.description}</small>
            ) : null}
          </span>
        </label>
      ))}
    </div>
  </fieldset>
)

export default RadioGroupField
