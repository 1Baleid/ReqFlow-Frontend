import './StatusBadge.css'

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    icon: 'edit_note'
  },
  'under-review': {
    label: 'Under Review',
    icon: 'pending'
  },
  approved: {
    label: 'Approved',
    icon: 'check_circle'
  },
  rejected: {
    label: 'Rejected',
    icon: 'cancel'
  },
  locked: {
    label: 'Locked',
    icon: 'lock'
  }
}

function StatusBadge({ status, showIcon = true, size = 'md', className = '' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '-') || 'draft'

  const classes = [
    'status-badge',
    `status-badge--${normalizedStatus}`,
    `status-badge--${size}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <span className={classes}>
      {showIcon && (
        <span className="status-badge__icon material-symbols-outlined">
          {config.icon}
        </span>
      )}
      <span className="status-badge__label">{config.label}</span>
    </span>
  )
}

export default StatusBadge
