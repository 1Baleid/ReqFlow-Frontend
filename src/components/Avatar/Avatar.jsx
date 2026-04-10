import './Avatar.css'

function Avatar({
  src,
  name,
  size = 'md',
  showStatus = false,
  status = 'offline',
  className = ''
}) {
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  // Generate consistent color from name
  const getColorIndex = (name) => {
    if (!name) return 0
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash) % 6
  }

  const classes = [
    'avatar',
    `avatar--${size}`,
    !src ? `avatar--color-${getColorIndex(name)}` : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {src ? (
        <img
          src={src}
          alt={name || 'User avatar'}
          className="avatar__image"
        />
      ) : (
        <span className="avatar__initials">{getInitials(name)}</span>
      )}
      {showStatus && (
        <span className={`avatar__status avatar__status--${status}`} />
      )}
    </div>
  )
}

export default Avatar
