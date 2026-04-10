import './PriorityBadge.css'

const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    icon: 'keyboard_arrow_down'
  },
  medium: {
    label: 'Medium',
    icon: 'remove'
  },
  high: {
    label: 'High',
    icon: 'keyboard_arrow_up'
  },
  critical: {
    label: 'Critical',
    icon: 'priority_high'
  }
}

function PriorityBadge({ priority, showIcon = true, showLabel = true, size = 'md', className = '' }) {
  const normalizedPriority = priority?.toLowerCase() || 'medium'
  const config = PRIORITY_CONFIG[normalizedPriority] || PRIORITY_CONFIG.medium

  const classes = [
    'priority-badge',
    `priority-badge--${normalizedPriority}`,
    `priority-badge--${size}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <span className={classes}>
      {showIcon && (
        <span className="priority-badge__icon material-symbols-outlined">
          {config.icon}
        </span>
      )}
      {showLabel && <span className="priority-badge__label">{config.label}</span>}
    </span>
  )
}

export default PriorityBadge
