import './FilterChips.css'

function FilterChips({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="filter-chips">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={`filter-chips__item ${activeFilter === filter.value ? 'filter-chips__item--active' : ''}`}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.icon && (
            <span className="material-symbols-outlined filter-chips__icon">
              {filter.icon}
            </span>
          )}
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  )
}

export default FilterChips
