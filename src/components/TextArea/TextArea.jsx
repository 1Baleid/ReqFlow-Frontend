import './TextArea.css'

function TextArea({
  label,
  placeholder,
  value,
  onChange,
  error,
  rows = 6,
  showToolbar = true,
  disabled = false,
  required = false,
  id,
  name,
  className = '',
  ...props
}) {
  const containerClasses = [
    'textarea',
    error ? 'textarea--error' : '',
    disabled ? 'textarea--disabled' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      {label && (
        <label className="textarea__label" htmlFor={id}>
          {label}
          {required && <span className="textarea__required">*</span>}
        </label>
      )}

      {showToolbar && (
        <div className="textarea__toolbar">
          <button type="button" className="textarea__tool" title="Bold">
            <span style={{ fontWeight: 700 }}>B</span>
          </button>
          <button type="button" className="textarea__tool" title="Italic">
            <span style={{ fontStyle: 'italic' }}>I</span>
          </button>
          <button type="button" className="textarea__tool" title="List">
            <span className="material-symbols-outlined">format_list_bulleted</span>
          </button>
          <button type="button" className="textarea__tool" title="Link">
            <span className="material-symbols-outlined">link</span>
          </button>
        </div>
      )}

      <textarea
        id={id}
        name={name}
        className="textarea__field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        rows={rows}
        {...props}
      />

      {error && (
        <div className="textarea__error">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default TextArea
