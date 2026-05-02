import './EmptyState.css'

// Preset configurations for common empty states
const PRESETS = {
  noData: {
    icon: 'inbox',
    title: 'No data yet',
    description: 'There\'s nothing here yet. Get started by adding your first item.'
  },
  noResults: {
    icon: 'search_off',
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria.'
  },
  noRequirements: {
    icon: 'assignment',
    title: 'No requirements',
    description: 'Create your first requirement to get started with tracking.'
  },
  noProjects: {
    icon: 'folder_off',
    title: 'No projects',
    description: 'Create a project to start organizing your requirements.'
  },
  noNotifications: {
    icon: 'notifications_off',
    title: 'All caught up!',
    description: 'You have no new notifications.'
  },
  noAccess: {
    icon: 'lock',
    title: 'Access denied',
    description: 'You don\'t have permission to view this content.'
  },
  error: {
    icon: 'error_outline',
    title: 'Something went wrong',
    description: 'An error occurred while loading. Please try again.'
  },
  offline: {
    icon: 'cloud_off',
    title: 'You\'re offline',
    description: 'Check your internet connection and try again.'
  },
  comingSoon: {
    icon: 'construction',
    title: 'Coming soon',
    description: 'This feature is under development. Stay tuned!'
  },
  noTeam: {
    icon: 'group_off',
    title: 'No team members',
    description: 'Invite team members to collaborate on this project.'
  },
  noComments: {
    icon: 'chat_bubble_outline',
    title: 'No comments yet',
    description: 'Start the conversation by adding the first comment.'
  },
  noActivity: {
    icon: 'history',
    title: 'No recent activity',
    description: 'Activity will appear here as changes are made.'
  }
}

function EmptyState({
  preset,
  icon,
  title,
  description,
  actionLabel,
  actionIcon = 'add_circle',
  onAction,
  secondaryLabel,
  onSecondaryAction,
  variant = 'default',
  size = 'md',
  illustration,
  className = ''
}) {
  // Apply preset if provided
  const presetConfig = preset ? PRESETS[preset] : {}
  const finalIcon = icon || presetConfig.icon || 'inbox'
  const finalTitle = title || presetConfig.title || 'No items found'
  const finalDescription = description || presetConfig.description

  const variantClass = `empty-state--${variant}`
  const sizeClass = `empty-state--${size}`

  return (
    <div className={`empty-state ${variantClass} ${sizeClass} ${className}`}>
      {/* Illustration or Icon */}
      {illustration ? (
        <div className="empty-state__illustration">
          {typeof illustration === 'string' ? (
            <img src={illustration} alt="" className="empty-state__illustration-img" />
          ) : (
            illustration
          )}
        </div>
      ) : (
        <div className="empty-state__icon-wrapper">
          <span className="material-symbols-outlined empty-state__icon">{finalIcon}</span>
        </div>
      )}

      {/* Text Content */}
      <h3 className="empty-state__title">{finalTitle}</h3>
      {finalDescription && (
        <p className="empty-state__description">{finalDescription}</p>
      )}

      {/* Actions */}
      {(actionLabel || secondaryLabel) && (
        <div className="empty-state__actions">
          {actionLabel && onAction && (
            <button className="empty-state__action empty-state__action--primary" onClick={onAction}>
              <span className="material-symbols-outlined">{actionIcon}</span>
              <span>{actionLabel}</span>
            </button>
          )}
          {secondaryLabel && onSecondaryAction && (
            <button className="empty-state__action empty-state__action--secondary" onClick={onSecondaryAction}>
              <span>{secondaryLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Sub-components for specific use cases
function NoRequirements({ onAction }) {
  return (
    <EmptyState
      preset="noRequirements"
      actionLabel="Create Requirement"
      actionIcon="add"
      onAction={onAction}
    />
  )
}

function NoResults({ searchTerm, onClear }) {
  return (
    <EmptyState
      preset="noResults"
      description={searchTerm ? `No results for "${searchTerm}"` : 'Try adjusting your search or filter criteria.'}
      actionLabel="Clear filters"
      actionIcon="filter_alt_off"
      onAction={onClear}
    />
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      preset="error"
      variant="error"
      description={message}
      actionLabel="Try again"
      actionIcon="refresh"
      onAction={onRetry}
    />
  )
}

function NoAccess({ onGoBack }) {
  return (
    <EmptyState
      preset="noAccess"
      variant="warning"
      actionLabel="Go back"
      actionIcon="arrow_back"
      onAction={onGoBack}
    />
  )
}

function ComingSoon() {
  return (
    <EmptyState
      preset="comingSoon"
      variant="info"
    />
  )
}

EmptyState.NoRequirements = NoRequirements
EmptyState.NoResults = NoResults
EmptyState.Error = ErrorState
EmptyState.NoAccess = NoAccess
EmptyState.ComingSoon = ComingSoon
EmptyState.PRESETS = PRESETS

export default EmptyState
