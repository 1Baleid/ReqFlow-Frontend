import './Charts.css'

function ProgressChart({
  value = 0,
  max = 100,
  label = '',
  showPercentage = true,
  size = 'md',
  color = 'primary',
  animate = true
}) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0

  const colorMap = {
    primary: '#1353d8',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  }

  const barColor = colorMap[color] || color

  return (
    <div className={`chart chart--progress chart--progress-${size}`}>
      {(label || showPercentage) && (
        <div className="chart__progress-header">
          {label && <span className="chart__progress-label">{label}</span>}
          {showPercentage && (
            <span className="chart__progress-percent">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="chart__progress-track">
        <div
          className={`chart__progress-fill ${animate ? 'chart__progress-fill--animate' : ''}`}
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor
          }}
        />
      </div>
    </div>
  )
}

export default ProgressChart
