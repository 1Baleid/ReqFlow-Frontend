import { useState } from 'react'
import './Charts.css'

function DonutChart({
  data = [],
  size = 160,
  strokeWidth = 24,
  showLegend = true,
  showCenter = true,
  centerLabel = '',
  centerValue = '',
  animate = true
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  if (!data.length) return null

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // Calculate stroke offsets for each segment
  let currentOffset = 0
  const segments = data.map((item, index) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0
    const strokeLength = (percentage / 100) * circumference
    const offset = currentOffset
    currentOffset += strokeLength

    return {
      ...item,
      percentage,
      strokeLength,
      offset,
      index
    }
  })

  return (
    <div className="chart chart--donut">
      <div className="chart__donut-wrapper">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="chart__donut-svg"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Data segments */}
          {segments.map((segment, index) => {
            const isHovered = hoveredIndex === index
            return (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={segment.color || '#1353d8'}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${segment.strokeLength} ${circumference}`}
                strokeDashoffset={-segment.offset}
                strokeLinecap="round"
                className={`chart__donut-segment ${animate ? 'chart__donut-segment--animate' : ''}`}
                style={{
                  transformOrigin: 'center',
                  transform: 'rotate(-90deg)',
                  transition: 'stroke-width 0.2s ease',
                  animationDelay: animate ? `${index * 0.15}s` : '0s'
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            )
          })}
        </svg>

        {/* Center content */}
        {showCenter && (
          <div className="chart__donut-center">
            {centerValue && (
              <span className="chart__donut-center-value">{centerValue}</span>
            )}
            {centerLabel && (
              <span className="chart__donut-center-label">{centerLabel}</span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="chart__legend">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`chart__legend-item ${hoveredIndex === index ? 'chart__legend-item--active' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className="chart__legend-dot"
                style={{ backgroundColor: segment.color || '#1353d8' }}
              />
              <span className="chart__legend-label">{segment.label}</span>
              <span className="chart__legend-value">{segment.value}</span>
              <span className="chart__legend-percent">
                {segment.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DonutChart
