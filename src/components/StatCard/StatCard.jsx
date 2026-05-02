import { useState } from 'react'
import './StatCard.css'

/**
 * StatCard - Enhanced dashboard card with hover effects and interactions
 * @param {string} title - Card title
 * @param {ReactNode} children - Card content
 * @param {string} className - Additional classes
 * @param {string} variant - Card variant: 'default', 'highlight', 'success', 'warning', 'danger'
 * @param {boolean} clickable - Whether card is clickable
 * @param {function} onClick - Click handler
 * @param {string} icon - Optional icon name
 * @param {object} action - Optional action button { label, onClick }
 * @param {boolean} collapsible - Whether card content can be collapsed
 * @param {boolean} defaultCollapsed - Whether card starts collapsed
 */
function StatCard({
  title,
  children,
  className = '',
  variant = 'default',
  clickable = false,
  onClick,
  icon,
  action,
  collapsible = false,
  defaultCollapsed = false
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (clickable && onClick) {
      onClick()
    }
  }

  const handleKeyDown = (e) => {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick?.()
    }
  }

  const toggleCollapse = (e) => {
    e.stopPropagation()
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div
      className={`stat-card stat-card--${variant} ${clickable ? 'stat-card--clickable' : ''} ${isHovered ? 'stat-card--hovered' : ''} ${isCollapsed ? 'stat-card--collapsed' : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="stat-card__blur"></div>
      <div className="stat-card__header">
        {icon && (
          <span className="stat-card__icon material-symbols-outlined">{icon}</span>
        )}
        <h4 className="stat-card__title">{title}</h4>
        <div className="stat-card__header-actions">
          {action && (
            <button
              className="stat-card__action"
              onClick={(e) => { e.stopPropagation(); action.onClick?.() }}
            >
              {action.label}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          )}
          {collapsible && (
            <button
              className="stat-card__collapse-btn"
              onClick={toggleCollapse}
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            >
              <span className="material-symbols-outlined">
                {isCollapsed ? 'expand_more' : 'expand_less'}
              </span>
            </button>
          )}
        </div>
      </div>
      <div className={`stat-card__content ${isCollapsed ? 'stat-card__content--collapsed' : ''}`}>
        {children}
      </div>
      {clickable && (
        <div className="stat-card__hover-indicator">
          <span className="material-symbols-outlined">arrow_forward</span>
        </div>
      )}
    </div>
  )
}

// Progress bar sub-component
function StatCardProgress({ label, value, percentage, color }) {
  return (
    <div className="stat-card__progress">
      <div className="stat-card__progress-header">
        <span className="stat-card__progress-label">{label}</span>
        <span className="stat-card__progress-value">{value}</span>
      </div>
      <div className="stat-card__progress-bar">
        <div
          className={`stat-card__progress-fill ${color ? `stat-card__progress-fill--${color}` : ''}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

// Mini stat sub-component with optional trend
function StatCardMini({ label, value, trend, trendValue, icon, clickable, onClick }) {
  const getTrendClass = () => {
    if (!trend) return ''
    return trend === 'up' ? 'stat-card__mini--trend-up' : 'stat-card__mini--trend-down'
  }

  return (
    <div
      className={`stat-card__mini ${getTrendClass()} ${clickable ? 'stat-card__mini--clickable' : ''}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {icon && (
        <span className="stat-card__mini-icon material-symbols-outlined">{icon}</span>
      )}
      <span className="stat-card__mini-label">{label}</span>
      <div className="stat-card__mini-row">
        <span className="stat-card__mini-value">{value}</span>
        {trend && trendValue && (
          <span className={`stat-card__mini-trend stat-card__mini-trend--${trend}`}>
            <span className="material-symbols-outlined">
              {trend === 'up' ? 'trending_up' : 'trending_down'}
            </span>
            {trendValue}
          </span>
        )}
      </div>
    </div>
  )
}

// Large metric display
function StatCardMetric({ value, label, trend, trendValue, prefix, suffix, color }) {
  return (
    <div className={`stat-card__metric ${color ? `stat-card__metric--${color}` : ''}`}>
      <div className="stat-card__metric-value">
        {prefix && <span className="stat-card__metric-prefix">{prefix}</span>}
        <span className="stat-card__metric-number">{value}</span>
        {suffix && <span className="stat-card__metric-suffix">{suffix}</span>}
      </div>
      {label && <span className="stat-card__metric-label">{label}</span>}
      {trend && trendValue && (
        <div className={`stat-card__metric-trend stat-card__metric-trend--${trend}`}>
          <span className="material-symbols-outlined">
            {trend === 'up' ? 'trending_up' : 'trending_down'}
          </span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  )
}

// List item for stat cards
function StatCardListItem({ icon, label, value, status, onClick }) {
  return (
    <div
      className={`stat-card__list-item ${onClick ? 'stat-card__list-item--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && (
        <span className="stat-card__list-icon material-symbols-outlined">{icon}</span>
      )}
      <span className="stat-card__list-label">{label}</span>
      {value && <span className="stat-card__list-value">{value}</span>}
      {status && (
        <span className={`stat-card__list-status stat-card__list-status--${status}`}>
          {status}
        </span>
      )}
      {onClick && (
        <span className="stat-card__list-arrow material-symbols-outlined">chevron_right</span>
      )}
    </div>
  )
}

// Divider
function StatCardDivider() {
  return <div className="stat-card__divider" />
}

StatCard.Progress = StatCardProgress
StatCard.Mini = StatCardMini
StatCard.Metric = StatCardMetric
StatCard.ListItem = StatCardListItem
StatCard.Divider = StatCardDivider

export default StatCard
