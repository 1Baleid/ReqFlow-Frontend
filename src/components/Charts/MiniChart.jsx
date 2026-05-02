import './Charts.css'

function MiniChart({
  data = [],
  type = 'line',
  height = 40,
  width = 100,
  color = '#1353d8',
  fillOpacity = 0.1,
  animate = true
}) {
  if (!data.length) return null

  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1

  const padding = 2
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Generate points for line/area chart
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth
    const y = padding + chartHeight - ((value - minValue) / range) * chartHeight
    return { x, y, value }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`

  if (type === 'bar') {
    const barWidth = (chartWidth / data.length) * 0.7
    const barGap = (chartWidth / data.length) * 0.3

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={`chart__mini ${animate ? 'chart__mini--animate' : ''}`}
      >
        {data.map((value, index) => {
          const barHeight = ((value - minValue) / range) * chartHeight
          const x = padding + index * (barWidth + barGap)
          const y = height - padding - barHeight

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={2}
              className="chart__mini-bar"
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          )
        })}
      </svg>
    )
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`chart__mini ${animate ? 'chart__mini--animate' : ''}`}
    >
      {/* Area fill */}
      <path
        d={areaPath}
        fill={color}
        fillOpacity={fillOpacity}
        className="chart__mini-area"
      />
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="chart__mini-line"
      />
      {/* End dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={3}
        fill={color}
        className="chart__mini-dot"
      />
    </svg>
  )
}

export default MiniChart
