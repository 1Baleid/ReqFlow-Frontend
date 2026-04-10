import './Checkbox.css'

function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  id,
  name,
  className = '',
  ...props
}) {
  const containerClasses = [
    'checkbox',
    disabled ? 'checkbox--disabled' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <label className={containerClasses}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="checkbox__input"
        {...props}
      />
      <span className="checkbox__box">
        <span className="material-symbols-outlined checkbox__check">check</span>
      </span>
      {label && <span className="checkbox__label">{label}</span>}
    </label>
  )
}

export default Checkbox
