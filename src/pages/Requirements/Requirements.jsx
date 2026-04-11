import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import FilterChips from '../../components/FilterChips'
import { getCurrentUser, requirements, statusFilters } from '../../data/mockData'
import './Requirements.css'

const STATUS_CONFIG = {
  draft: { label: 'Draft', className: 'requirements__status--draft' },
  'under-review': { label: 'Under Review', className: 'requirements__status--review' },
  approved: { label: 'Approved', className: 'requirements__status--approved' },
  rejected: { label: 'Rejected', className: 'requirements__status--rejected' },
  locked: { label: 'Locked', className: 'requirements__status--locked' }
}

function Requirements() {
  const currentUser = getCurrentUser()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('updated')
  const itemsPerPage = 10

  // Filter requirements
  const filteredRequirements = requirements.filter(req => {
    if (currentUser.role === 'client' && req.createdBy?.id !== currentUser.id) return false
    if (activeFilter === 'all') return true
    return req.status === activeFilter
  })

  const statusOrder = ['draft', 'under-review', 'approved', 'rejected', 'locked']
  const sortedRequirements = [...filteredRequirements].sort((a, b) => {
    if (sortBy === 'status') return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    return 0
  })

  const totalPages = Math.ceil(sortedRequirements.length / itemsPerPage)
  const paginatedRequirements = sortedRequirements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleNewRequirement = () => {
    navigate('/requirements/new')
  }

  const handleViewRequirement = (id) => {
    navigate(`/requirements/${id}`)
  }

  const handleEditRequirement = (id, e) => {
    e.stopPropagation()
    navigate(`/requirements/${id}/edit`)
  }

  const handleDeleteRequirement = (id, e) => {
    e.stopPropagation()
    // TODO: Show delete confirmation modal
    console.log('Delete requirement:', id)
  }

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
      <div className="requirements">
        {/* Header */}
        <div className="requirements__header">
          <div className="requirements__header-left">
            <nav className="requirements__breadcrumb">
              <span>WORKSPACE</span>
              <span className="material-symbols-outlined">chevron_right</span>
              <span className="requirements__breadcrumb--active">MY REQUIREMENTS</span>
            </nav>
            <h1 className="requirements__title">Requirements Tracking</h1>
          </div>
          <div className="requirements__header-actions">
            <Button variant="secondary" icon="download" iconPosition="left">
              Export CSV
            </Button>
            <Button variant="primary" icon="add" iconPosition="left" onClick={handleNewRequirement}>
              New Requirement
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="requirements__filters">
          <FilterChips
            filters={statusFilters}
            activeFilter={activeFilter}
            onFilterChange={(value) => {
              setActiveFilter(value)
              setCurrentPage(1)
            }}
          />
          <div className="requirements__sort">
            <span className="material-symbols-outlined">filter_list</span>
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1) }}
              className="requirements__sort-select"
            >
              <option value="updated">Recently Updated</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="requirements__table">
          {/* Table Header */}
          <div className="requirements__table-header">
            <div className="requirements__col requirements__col--id">ID</div>
            <div className="requirements__col requirements__col--title">TITLE & DESCRIPTION</div>
            <div className="requirements__col requirements__col--status">STATUS</div>
            <div className="requirements__col requirements__col--date">LAST UPDATED</div>
            <div className="requirements__col requirements__col--actions"></div>
          </div>

          {/* Table Body */}
          <div className="requirements__table-body">
            {paginatedRequirements.map((req) => {
              const normalizedStatus = req.status?.toLowerCase().replace(/\s+/g, '-') || 'draft'
              const statusConfig = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.draft

              return (
                <div
                  key={req.id}
                  className={`requirements__row ${normalizedStatus === 'approved' ? 'requirements__row--approved' : ''}`}
                  onClick={() => handleViewRequirement(req.id)}
                >
                  <div className="requirements__col requirements__col--id">
                    <span className="requirements__id">{req.id}</span>
                  </div>
                  <div className="requirements__col requirements__col--title">
                    <h3 className="requirements__req-title">{req.title}</h3>
                    <p className="requirements__req-desc">{req.description || 'No description provided.'}</p>
                  </div>
                  <div className="requirements__col requirements__col--status">
                    <span className={`requirements__status ${statusConfig.className}`}>
                      <span className="requirements__status-dot"></span>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="requirements__col requirements__col--date">
                    <p className="requirements__date">{req.updatedAt}</p>
                    <p className="requirements__time">V {req.version}</p>
                  </div>
                  <div className="requirements__col requirements__col--actions">
                    <div className="requirements__actions">
                      <button
                        className="requirements__action-btn"
                        onClick={(e) => { e.stopPropagation(); handleViewRequirement(req.id) }}
                        aria-label="View"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      <button
                        className="requirements__action-btn"
                        onClick={(e) => handleEditRequirement(req.id, e)}
                        aria-label="Edit"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        className="requirements__action-btn requirements__action-btn--danger"
                        onClick={(e) => handleDeleteRequirement(req.id, e)}
                        aria-label="Delete"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pagination */}
        <div className="requirements__pagination">
          <p className="requirements__pagination-info">
            Showing <strong>{paginatedRequirements.length}</strong> of <strong>{sortedRequirements.length}</strong> requirements
          </p>
          <div className="requirements__pagination-controls">
            <button
              className="requirements__page-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`requirements__page-btn ${currentPage === page ? 'requirements__page-btn--active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="requirements__page-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* FAB */}
        <button className="requirements__fab" aria-label="Quick Analyze">
          <span className="material-symbols-outlined">bolt</span>
          <span className="requirements__fab-tooltip">Quick Analyze</span>
        </button>
      </div>
    </MainLayout>
  )
}

export default Requirements
