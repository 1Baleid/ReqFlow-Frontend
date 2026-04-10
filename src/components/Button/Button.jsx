import './Button.css'

function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const baseClass = 'btn'
  const variantClass = `btn--${variant}`
  const sizeClass = `btn--${size}`
  const widthClass = fullWidth ? 'btn--full' : ''
  const iconOnlyClass = !children && icon ? 'btn--icon-only' : ''

  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    widthClass,
    iconOnlyClass,
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="btn__icon material-symbols-outlined">{icon}</span>
      )}
      {children && <span className="btn__text">{children}</span>}
      {icon && iconPosition === 'right' && (
        <span className="btn__icon material-symbols-outlined">{icon}</span>
      )}
    </button>
  )
}

export default Button
