import { useState, useEffect } from 'react'
import Dropdown from '../Dropdown'
import './FilterBar.css'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: '#64748b' },
  { value: 'review', label: 'Under Review', color: '#f59e0b' },
  { value: 'approved', label: 'Approved', color: '#10b981' },
  { value: 'rejected', label: 'Rejected', color: '#ef4444' },
  { value: 'locked', label: 'Locked', color: '#8b5cf6' }
]

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: '#ef4444' },
  { value: 'high', label: 'High', color: '#f59e0b' },
  { value: 'medium', label: 'Medium', color: '#3b82f6' },
  { value: 'low', label: 'Low', color: '#94a3b8' }
]

const TYPE_OPTIONS = [
  { value: 'functional', label: 'Functional', icon: 'code' },
  { value: 'non-functional', label: 'Non-Functional', icon: 'settings' }
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', icon: 'arrow_downward' },
  { value: 'oldest', label: 'Oldest First', icon: 'arrow_upward' },
  { value: 'priority-high', label: 'Priority (High to Low)', icon: 'priority_high' },
  { value: 'priority-low', label: 'Priority (Low to High)', icon: 'low_priority' },
  { value: 'deadline', label: 'Deadline', icon: 'event' }
]

function FilterBar({
  filters = {},
  onFilterChange,
  assignees = [],
  showAssignee = true,
  showType = true,
  showSort = true,
  compact = false
}) {
  const [localFilters, setLocalFilters] = useState({
    status: [],
    priority: [],
    type: [],
    assignee: [],
    sort: 'newest',
    ...filters
  })

  // Sync with external filters
  useEffect(() => {
    setLocalFilters(prev => ({ ...prev, ...filters }))
  }, [filters])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      priority: [],
      type: [],
      assignee: [],
      sort: 'newest'
    }
    setLocalFilters(clearedFilters)
    onFilterChange?.(clearedFilters)
  }

  const activeFilterCount = [
    localFilters.status?.length || 0,
    localFilters.priority?.length || 0,
    localFilters.type?.length || 0,
    localFilters.assignee?.length || 0
  ].reduce((a, b) => a + b, 0)

  const assigneeOptions = assignees.map(user => ({
    value: user.id,
    label: user.name,
    icon: 'person'
  }))

  return (
    <div className={`filter-bar ${compact ? 'filter-bar--compact' : ''}`}>
      <div className="filter-bar__filters">
        <Dropdown
          placeholder="Status"
          icon="flag"
          options={STATUS_OPTIONS}
          value={localFilters.status}
          onChange={(value) => handleFilterChange('status', value)}
          multiple
        />

        <Dropdown
          placeholder="Priority"
          icon="priority_high"
          options={PRIORITY_OPTIONS}
          value={localFilters.priority}
          onChange={(value) => handleFilterChange('priority', value)}
          multiple
        />

        {showType && (
          <Dropdown
            placeholder="Type"
            icon="category"
            options={TYPE_OPTIONS}
            value={localFilters.type}
            onChange={(value) => handleFilterChange('type', value)}
            multiple
          />
        )}

        {showAssignee && assigneeOptions.length > 0 && (
          <Dropdown
            placeholder="Assignee"
            icon="person"
            options={assigneeOptions}
            value={localFilters.assignee}
            onChange={(value) => handleFilterChange('assignee', value)}
            multiple
            searchable
          />
        )}
      </div>

      <div className="filter-bar__actions">
        {activeFilterCount > 0 && (
          <button
            type="button"
            className="filter-bar__clear"
            onClick={handleClearAll}
          >
            <span className="material-symbols-outlined">close</span>
            Clear filters ({activeFilterCount})
          </button>
        )}

        {showSort && (
          <Dropdown
            placeholder="Sort by"
            icon="sort"
            options={SORT_OPTIONS}
            value={localFilters.sort}
            onChange={(value) => handleFilterChange('sort', value)}
          />
        )}
      </div>
    </div>
  )
}

export default FilterBar
