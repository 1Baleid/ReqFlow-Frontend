import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import './AllRequirementsManager.css'

// Mock data for all requirements
const mockRequirements = [
  {
    id: 'REQ-101',
    title: 'Global Authentication Middleware',
    version: '2.4',
    status: 'under-review',
    assignee: { name: 'Sarah Chen', initials: 'SC' },
    priority: 'high',
    type: 'Functional',
    deadline: 'Oct 24, 2023',
    hasDuplicate: true
  },
  {
    id: 'REQ-102',
    title: 'Batch Database Migration Schema',
    version: '1.1',
    status: 'approved',
    assignee: { name: 'Marcus Wright', initials: 'MW' },
    priority: 'medium',
    type: 'Non-Functional',
    deadline: 'Oct 21, 2023',
    isOverdue: true
  },
  {
    id: 'REQ-103',
    title: 'Data Privacy Compliance Header',
    version: '3.0',
    status: 'locked',
    assignee: { name: 'Elena Rodriguez', initials: 'ER' },
    priority: 'low',
    type: 'Functional',
    deadline: 'Nov 02, 2023'
  },
  {
    id: 'REQ-104',
    title: 'Audit Log API Implementation',
    version: '0.8',
    status: 'draft',
    assignee: { name: 'James Smith', initials: 'JS' },
    priority: 'medium',
    type: 'Functional',
    deadline: 'Nov 15, 2023'
  },
  {
    id: 'REQ-105',
    title: 'Legacy Support for IE11',
    version: '1.0',
    status: 'rejected',
    assignee: { name: 'David Miller', initials: 'DM' },
    priority: 'low',
    type: 'Non-Functional',
    deadline: 'Archived'
  }
]

function AllRequirementsManager() {
  const navigate = useNavigate()
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(mockRequirements.map(r => r.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id)
      }
      return [...prev, id]
    })
  }

  const handleRowClick = (id) => {
    navigate(`/requirements/${id}`)
  }

  const handleNewRequirement = () => {
    navigate('/requirements/new')
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'under-review': { label: 'Under Review', className: 'all-reqs__status--review' },
      'approved': { label: 'Approved', className: 'all-reqs__status--approved' },
      'rejected': { label: 'Rejected', className: 'all-reqs__status--rejected' },
      'draft': { label: 'Draft', className: 'all-reqs__status--draft' },
      'locked': { label: 'Locked', className: 'all-reqs__status--locked', icon: 'lock' }
    }
    const config = statusConfig[status] || statusConfig['draft']
    return (
      <span className={`all-reqs__status ${config.className}`}>
        {config.icon && <span className="material-symbols-outlined">{config.icon}</span>}
        {config.label}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'high': { label: 'High', className: 'all-reqs__priority--high' },
      'medium': { label: 'Medium', className: 'all-reqs__priority--medium' },
      'low': { label: 'Low', className: 'all-reqs__priority--low' }
    }
    const config = priorityConfig[priority] || priorityConfig['medium']
    return (
      <span className={`all-reqs__priority ${config.className}`}>
        {config.label}
      </span>
    )
  }

  return (
    <MainLayout>
      <div className="all-reqs">
        {/* Header */}
        <div className="all-reqs__header">
          <div className="all-reqs__header-content">
            <span className="all-reqs__label">Management Console</span>
            <h1 className="all-reqs__title">All Requirements</h1>
          </div>
          <div className="all-reqs__header-actions">
            <Button variant="secondary" icon="filter_list">
              Filters
            </Button>
            <Button variant="primary" icon="add" onClick={handleNewRequirement}>
              New Requirement
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="all-reqs__table-container">
          <table className="all-reqs__table">
            <thead>
              <tr>
                <th className="all-reqs__th all-reqs__th--checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === mockRequirements.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="all-reqs__th">ID</th>
                <th className="all-reqs__th">Title</th>
                <th className="all-reqs__th">Status</th>
                <th className="all-reqs__th">Assignee</th>
                <th className="all-reqs__th">Priority</th>
                <th className="all-reqs__th">Type</th>
                <th className="all-reqs__th">Deadline</th>
                <th className="all-reqs__th all-reqs__th--actions"></th>
              </tr>
            </thead>
            <tbody>
              {mockRequirements.map((req) => (
                <tr
                  key={req.id}
                  className={`all-reqs__row ${selectedIds.includes(req.id) ? 'all-reqs__row--selected' : ''}`}
                >
                  <td className="all-reqs__td all-reqs__td--checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(req.id)}
                      onChange={() => handleSelectRow(req.id)}
                    />
                  </td>
                  <td className="all-reqs__td" onClick={() => handleRowClick(req.id)}>
                    <div className="all-reqs__id-cell">
                      <span className="all-reqs__id">{req.id}</span>
                      {req.hasDuplicate && (
                        <span className="material-symbols-outlined all-reqs__duplicate-icon" title="Duplicate detected">
                          content_copy
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="all-reqs__td all-reqs__td--title" onClick={() => handleRowClick(req.id)}>
                    <p className="all-reqs__req-title">{req.title}</p>
                    <span className="all-reqs__version">Version {req.version}</span>
                  </td>
                  <td className="all-reqs__td">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="all-reqs__td">
                    <div className="all-reqs__assignee">
                      <div className="all-reqs__assignee-avatar">
                        {req.assignee.initials}
                      </div>
                      <span className="all-reqs__assignee-name">{req.assignee.name}</span>
                    </div>
                  </td>
                  <td className="all-reqs__td">
                    {getPriorityBadge(req.priority)}
                  </td>
                  <td className="all-reqs__td">
                    <span className="all-reqs__type">{req.type}</span>
                  </td>
                  <td className="all-reqs__td">
                    <span className={`all-reqs__deadline ${req.isOverdue ? 'all-reqs__deadline--overdue' : ''}`}>
                      {req.deadline}
                    </span>
                  </td>
                  <td className="all-reqs__td all-reqs__td--actions">
                    <button className="all-reqs__more-btn">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="all-reqs__pagination">
          <p className="all-reqs__pagination-info">
            Showing 1-5 of 148 Requirements
          </p>
          <div className="all-reqs__pagination-controls">
            <button className="all-reqs__page-btn" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="all-reqs__page-btn all-reqs__page-btn--active">1</button>
            <button className="all-reqs__page-btn">2</button>
            <button className="all-reqs__page-btn">3</button>
            <span className="all-reqs__page-ellipsis">...</span>
            <button className="all-reqs__page-btn">12</button>
            <button className="all-reqs__page-btn">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="all-reqs__bulk-bar">
            <div className="all-reqs__bulk-content">
              <div className="all-reqs__bulk-info">
                <span className="all-reqs__bulk-count">{selectedIds.length} Selected</span>
                <div className="all-reqs__bulk-divider" />
                <p className="all-reqs__bulk-text">Apply actions to selected requirements</p>
              </div>
              <div className="all-reqs__bulk-actions">
                <button className="all-reqs__bulk-action">
                  <span className="material-symbols-outlined">person_outline</span>
                  Reassign
                </button>
                <button className="all-reqs__bulk-action all-reqs__bulk-action--warning">
                  <span className="material-symbols-outlined">content_copy</span>
                  Mark as Duplicate
                </button>
                <button className="all-reqs__bulk-action all-reqs__bulk-action--danger">
                  <span className="material-symbols-outlined">delete</span>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default AllRequirementsManager
