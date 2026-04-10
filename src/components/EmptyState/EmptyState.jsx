import './EmptyState.css'

function EmptyState({
  icon = 'post_add',
  title = 'No items found',
  description,
  actionLabel,
  onAction
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon-wrapper">
        <span className="material-symbols-outlined empty-state__icon">{icon}</span>
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      {actionLabel && onAction && (
        <button className="empty-state__action" onClick={onAction}>
          <span className="material-symbols-outlined">add_circle</span>
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  )
}

export default EmptyState
