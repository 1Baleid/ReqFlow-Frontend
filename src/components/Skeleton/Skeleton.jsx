import './Skeleton.css'

function Skeleton({ variant = 'text', width, height, className = '', animate = true }) {
  const baseClass = 'skeleton'
  const variantClass = `skeleton--${variant}`
  const animateClass = animate ? '' : 'skeleton--static'

  const style = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClass} ${variantClass} ${animateClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

// Card skeleton for requirement cards
function SkeletonCard({ opacity = 1 }) {
  return (
    <div className="skeleton-card" style={{ opacity }}>
      <div className="skeleton-card__left">
        <Skeleton variant="rectangular" width={48} height={48} />
        <div className="skeleton-card__text">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <div className="skeleton-card__right">
        <Skeleton variant="rounded" width={80} height={28} />
        <Skeleton variant="rounded" width={60} height={28} />
      </div>
    </div>
  )
}

// List of skeleton cards
function SkeletonList({ count = 3 }) {
  return (
    <div className="skeleton-list" role="status" aria-label="Loading content">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} opacity={1 - (index * 0.2)} />
      ))}
    </div>
  )
}

// Table skeleton
function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="skeleton-table" role="status" aria-label="Loading table">
      <div className="skeleton-table__header">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" height={12} width={`${60 + Math.random() * 40}%`} />
        ))}
      </div>
      <div className="skeleton-table__body">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="skeleton-table__row" style={{ opacity: 1 - (rowIndex * 0.15) }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" height={14} width={`${50 + Math.random() * 50}%`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Chart skeleton
function SkeletonChart({ type = 'bar', height = 200 }) {
  if (type === 'donut') {
    return (
      <div className="skeleton-chart skeleton-chart--donut" style={{ height }}>
        <Skeleton variant="circular" width={height * 0.7} height={height * 0.7} />
      </div>
    )
  }

  return (
    <div className="skeleton-chart skeleton-chart--bar" style={{ height }}>
      <div className="skeleton-chart__bars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            width={32}
            height={`${30 + Math.random() * 70}%`}
          />
        ))}
      </div>
    </div>
  )
}

// Dashboard skeleton
function SkeletonDashboard() {
  return (
    <div className="skeleton-dashboard">
      {/* Header */}
      <div className="skeleton-dashboard__header">
        <div className="skeleton-dashboard__title">
          <Skeleton variant="text" width={200} height={28} />
          <Skeleton variant="text" width={300} height={16} />
        </div>
        <div className="skeleton-dashboard__actions">
          <Skeleton variant="rounded" width={120} height={40} />
          <Skeleton variant="rounded" width={140} height={40} />
        </div>
      </div>

      {/* Filter chips */}
      <div className="skeleton-dashboard__filters">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={80 + Math.random() * 40} height={32} />
        ))}
      </div>

      {/* Content grid */}
      <div className="skeleton-dashboard__grid">
        <div className="skeleton-dashboard__main">
          <SkeletonList count={4} />
        </div>
        <div className="skeleton-dashboard__sidebar">
          <Skeleton variant="rectangular" width="100%" height={200} />
          <Skeleton variant="rectangular" width="100%" height={180} />
        </div>
      </div>
    </div>
  )
}

// Spinner component
function Spinner({ size = 'md', color = 'primary', className = '' }) {
  const sizeClass = `spinner--${size}`
  const colorClass = `spinner--${color}`

  return (
    <div className={`spinner ${sizeClass} ${colorClass} ${className}`} role="status" aria-label="Loading">
      <svg viewBox="0 0 50 50" className="spinner__svg">
        <circle
          className="spinner__track"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
        <circle
          className="spinner__progress"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

// Page loader (full page loading)
function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="page-loader">
      <div className="page-loader__content">
        <Spinner size="lg" />
        <p className="page-loader__message">{message}</p>
      </div>
    </div>
  )
}

// Inline loader
function InlineLoader({ text = 'Loading...', size = 'sm' }) {
  return (
    <div className="inline-loader">
      <Spinner size={size} />
      <span className="inline-loader__text">{text}</span>
    </div>
  )
}

// Button loader (for inside buttons)
function ButtonLoader({ color = 'white' }) {
  return <Spinner size="xs" color={color} className="button-loader" />
}

Skeleton.Card = SkeletonCard
Skeleton.List = SkeletonList
Skeleton.Table = SkeletonTable
Skeleton.Chart = SkeletonChart
Skeleton.Dashboard = SkeletonDashboard

export { Spinner, PageLoader, InlineLoader, ButtonLoader }
export default Skeleton
