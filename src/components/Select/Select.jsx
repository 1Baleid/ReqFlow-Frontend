import './Select.css'

function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  error,
  disabled = false,
  required = false,
  icon,
  id,
  name,
  className = '',
  ...props
}) {
  const containerClasses = [
    'select',
    error ? 'select--error' : '',
    disabled ? 'select--disabled' : '',
    icon ? 'select--with-icon' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      {label && (
        <label className="select__label" htmlFor={id}>
          {label}
          {required && <span className="select__required">*</span>}
        </label>
      )}

      <div className="select__wrapper">
        {icon && (
          <span className="material-symbols-outlined select__icon">{icon}</span>
        )}
        <select
          id={id}
          name={name}
          className="select__field"
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined select__arrow">expand_more</span>
      </div>

      {error && (
        <div className="select__error">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default Select
