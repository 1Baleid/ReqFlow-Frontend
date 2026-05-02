import { useState } from 'react'
import './Charts.css'

function BarChart({
  data = [],
  height = 200,
  showValues = true,
  showLabels = true,
  animate = true,
  horizontal = false
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  if (!data.length) return null

  const maxValue = Math.max(...data.map(d => d.value))

  if (horizontal) {
    return (
      <div className="chart chart--bar-horizontal" style={{ minHeight: height }}>
        <div className="chart__bars-horizontal">
          {data.map((item, index) => {
            const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
            const isHovered = hoveredIndex === index

            return (
              <div
                key={index}
                className="chart__bar-row"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {showLabels && (
                  <span className="chart__bar-label">{item.label}</span>
                )}
                <div className="chart__bar-track">
                  <div
                    className={`chart__bar-fill ${animate ? 'chart__bar-fill--animate' : ''}`}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color || 'var(--color-primary, #1353d8)',
                      animationDelay: animate ? `${index * 0.1}s` : '0s'
                    }}
                  />
                </div>
                {showValues && (
                  <span className={`chart__bar-value ${isHovered ? 'chart__bar-value--visible' : ''}`}>
                    {item.value}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="chart chart--bar" style={{ height }}>
      <div className="chart__bars">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
          const isHovered = hoveredIndex === index

          return (
            <div
              key={index}
              className="chart__bar-container"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="chart__bar-wrapper">
                {showValues && (
                  <span className={`chart__bar-value-top ${isHovered ? 'chart__bar-value--visible' : ''}`}>
                    {item.value}
                  </span>
                )}
                <div
                  className={`chart__bar ${animate ? 'chart__bar--animate' : ''}`}
                  style={{
                    height: `${percentage}%`,
                    backgroundColor: item.color || 'var(--color-primary, #1353d8)',
                    animationDelay: animate ? `${index * 0.1}s` : '0s'
                  }}
                />
              </div>
              {showLabels && (
                <span className="chart__bar-label-bottom">{item.label}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BarChart
