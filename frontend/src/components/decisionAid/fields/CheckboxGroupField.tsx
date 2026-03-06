import type { CheckboxField } from '../../../types/decisionAid'

type CheckboxGroupFieldProps = {
  field: CheckboxField
  value: string[]
  readOnly: boolean
  onChange: (value: string[]) => void
}

const CheckboxGroupField = ({
  field,
  value,
  readOnly,
  onChange,
}: CheckboxGroupFieldProps) => (
  <fieldset className="field-card" disabled={readOnly}>
    <legend>{field.label}</legend>
    {field.helpText ? <p className="field-help">{field.helpText}</p> : null}
    <div className="field-stack">
      {field.options.map((option) => {
        const checked = value.includes(option.value)
        return (
          <label key={option.value} className="choice-row">
            <input
              type="checkbox"
              checked={checked}
              onChange={() =>
                onChange(
                  checked
                    ? value.filter((item) => item !== option.value)
                    : [...value, option.value],
                )
              }
            />
            <span>
              {option.label}
              {option.description ? (
                <small className="choice-description">{option.description}</small>
              ) : null}
            </span>
          </label>
        )
      })}
    </div>
  </fieldset>
)

export default CheckboxGroupField
