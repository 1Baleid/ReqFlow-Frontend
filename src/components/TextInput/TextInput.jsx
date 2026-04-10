import { useState } from 'react'
import './TextInput.css'

function TextInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  iconPosition = 'left',
  disabled = false,
  required = false,
  id,
  name,
  autoComplete,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const containerClasses = [
    'text-input',
    error ? 'text-input--error' : '',
    disabled ? 'text-input--disabled' : '',
    icon ? `text-input--icon-${iconPosition}` : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      {label && (
        <label className="text-input__label" htmlFor={id}>
          {label}
          {required && <span className="text-input__required">*</span>}
        </label>
      )}

      <div className="text-input__wrapper">
        {icon && iconPosition === 'left' && (
          <span className="text-input__icon material-symbols-outlined">
            {icon}
          </span>
        )}

        <input
          type={inputType}
          id={id}
          name={name}
          className="text-input__field"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="text-input__toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <span className="material-symbols-outlined">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}

        {icon && iconPosition === 'right' && !isPassword && (
          <span className="text-input__icon text-input__icon--right material-symbols-outlined">
            {icon}
          </span>
        )}
      </div>

      {error && (
        <div className="text-input__error">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default TextInput
