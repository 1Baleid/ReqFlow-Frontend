import './StatCard.css'

function StatCard({ title, children, className = '' }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-card__blur"></div>
      <h4 className="stat-card__title">{title}</h4>
      <div className="stat-card__content">
        {children}
      </div>
    </div>
  )
}

// Progress bar sub-component
function StatCardProgress({ label, value, percentage }) {
  return (
    <div className="stat-card__progress">
      <div className="stat-card__progress-header">
        <span className="stat-card__progress-label">{label}</span>
        <span className="stat-card__progress-value">{value}</span>
      </div>
      <div className="stat-card__progress-bar">
        <div
          className="stat-card__progress-fill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

// Mini stat sub-component
function StatCardMini({ label, value }) {
  return (
    <div className="stat-card__mini">
      <span className="stat-card__mini-label">{label}</span>
      <span className="stat-card__mini-value">{value}</span>
    </div>
  )
}

StatCard.Progress = StatCardProgress
StatCard.Mini = StatCardMini

export default StatCard
