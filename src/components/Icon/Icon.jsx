import './Icon.css'

function Icon({ name, size = 'md', filled = false, className = '' }) {
  const classes = [
    'icon',
    'material-symbols-outlined',
    `icon--${size}`,
    filled ? 'icon--filled' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <span className={classes} data-icon={name}>
      {name}
    </span>
  )
}

export default Icon
