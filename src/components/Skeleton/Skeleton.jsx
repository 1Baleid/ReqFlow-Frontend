import './Skeleton.css'

function Skeleton({ variant = 'text', width, height, className = '' }) {
  const baseClass = 'skeleton'
  const variantClass = `skeleton--${variant}`

  const style = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      style={style}
    />
  )
}

function SkeletonCard({ opacity = 1 }) {
  return (
    <div className="skeleton-card" style={{ opacity }}>
      <div className="skeleton-card__left">
        <Skeleton variant="rectangular" width={48} height={48} />
        <div className="skeleton-card__text">
          <Skeleton variant="text" width="33%" height={16} />
          <Skeleton variant="text" width="25%" height={12} />
        </div>
      </div>
      <div className="skeleton-card__right">
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={80} height={32} />
      </div>
    </div>
  )
}

function SkeletonList({ count = 3 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} opacity={1 - (index * 0.3)} />
      ))}
    </div>
  )
}

Skeleton.Card = SkeletonCard
Skeleton.List = SkeletonList

export default Skeleton
