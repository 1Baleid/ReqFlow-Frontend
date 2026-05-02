import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import FilterChips from '../../components/FilterChips'
import RequirementCard from '../../components/RequirementCard'
import { statusFilters } from '../../data/mockData'
import { useProjectData } from '../../context/ProjectDataContext'
import {
  archiveRequirement as archiveRequirementApi,
  listRequirements as listRequirementsApi
} from '../../services/requirementsApi'
import './Requirements.css'

function Requirements() {
  const { currentUser, currentProject, activeRequirements, deleteRequirement } = useProjectData()
  const navigate = useNavigate()

  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('updated')
  const [apiRequirements, setApiRequirements] = useState(null)
  const [apiError, setApiError] = useState('')
  const [isLoadingApiRequirements, setIsLoadingApiRequirements] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    let isMounted = true

    async function loadRequirements() {
      setIsLoadingApiRequirements(true)
      setApiError('')

      try {
        const result = await listRequirementsApi({
          projectId: currentProject?.id || 'proj-1'
        })

        if (isMounted) {
          setApiRequirements(result.requirements)
        }
      } catch (error) {
        if (isMounted && !(error instanceof TypeError)) {
          setApiError(error.message || 'Unable to load backend requirements.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingApiRequirements(false)
        }
      }
    }

    loadRequirements()

    return () => {
      isMounted = false
    }
  }, [currentProject?.id])

  const requirementSource = apiRequirements || activeRequirements

  // Filter requirements — client sees only their own
  const filteredRequirements = requirementSource
    .filter(req => {
      if (currentUser.role === 'client' && req.createdBy?.id !== currentUser.id) return false
      if (currentUser.role === 'member' && req.assigneeId !== currentUser.id) return false
      const displayStatus = req.status === 'review' ? 'under-review' : req.status
      if (activeFilter === 'all') return true
      return displayStatus === activeFilter
    })
    .map(req => ({ ...req, status: req.status === 'review' ? 'under-review' : req.status }))

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
    const requirement = sortedRequirements.find((item) => item.id === id)
    const linkedCount = requirement?.linkedRequirementIds?.length || 0
    const confirmationMessage = linkedCount > 0
      ? `${id} is linked to ${linkedCount} other requirement${linkedCount === 1 ? '' : 's'}. Deleting it will remove those links too. Are you sure?`
      : `Delete ${id}?`
    const shouldDelete = window.confirm(confirmationMessage)
    if (!shouldDelete) {
      return
    }

    if (apiRequirements) {
      archiveRequirementApi(id, {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role
      })
        .then(() => {
          setApiRequirements((requirements) =>
            requirements.filter((requirement) => requirement.id !== id)
          )
        })
        .catch((error) => {
          window.alert(error.message || 'Unable to delete requirement.')
        })
      return
    }

    const deleteResult = deleteRequirement({
      requirementId: id,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role
    })

    if (!deleteResult.ok) {
      window.alert(deleteResult.error || 'Unable to delete requirement.')
    }
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

        {/* Cards */}
        {isLoadingApiRequirements && (
          <p className="requirements__pagination-info">Loading backend requirements...</p>
        )}
        {apiError && (
          <p className="requirements__pagination-info" style={{ color: '#c62828' }}>
            {apiError}
          </p>
        )}
        <div className="requirements__list">
          {paginatedRequirements.map((req) => (
            <RequirementCard
              key={req.id}
              requirement={req}
              actions={
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
              }
            />
          ))}
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
