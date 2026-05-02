import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { useProjectData } from '../../context/ProjectDataContext'
import { listRequirements as listRequirementsApi } from '../../services/requirementsApi'
import './ManagerDashboard.css'

const STATUS_FILTERS = ['all', 'draft', 'review', 'approved', 'rejected']

function formatDateForDisplay(dateOnlyString) {
  if (!dateOnlyString) {
    return 'Not set'
  }

  const parsedDate = new Date(dateOnlyString)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date'
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function ManagerDashboard() {
  const navigate = useNavigate()
  const {
    currentUser,
    currentProject,
    activeRequirements,
    overdueRequirements,
    managerNotifications,
    workflowStageMap,
    projectUsers
  } = useProjectData()

  const [activeStatusFilter, setActiveStatusFilter] = useState('all')
  const [apiRequirements, setApiRequirements] = useState(null)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadRequirements() {
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
      }
    }

    loadRequirements()

    return () => {
      isMounted = false
    }
  }, [currentProject?.id])

  const requirementsSource = apiRequirements || activeRequirements
  const overdueRequirementsSource = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return requirementsSource.filter((requirement) => {
      if (!requirement.deadline || ['approved', 'locked'].includes(requirement.status)) {
        return false
      }
      return requirement.deadline < today
    })
  }, [requirementsSource])

  const assigneeById = useMemo(
    () =>
      projectUsers.reduce((accumulator, user) => {
        accumulator[user.id] = user
        return accumulator
      }, {}),
    [projectUsers]
  )

  const statusCounts = useMemo(() => {
    const counts = {
      draft: 0,
      review: 0,
      approved: 0,
      rejected: 0
    }

    requirementsSource.forEach((requirement) => {
      if (Object.prototype.hasOwnProperty.call(counts, requirement.status)) {
        counts[requirement.status] += 1
      }
    })

    return counts
  }, [requirementsSource])

  const overdueRequirementIdSet = useMemo(
    () => new Set((apiRequirements ? overdueRequirementsSource : overdueRequirements).map((requirement) => requirement.id)),
    [apiRequirements, overdueRequirements, overdueRequirementsSource]
  )

  const filteredRequirements = useMemo(() => {
    if (activeStatusFilter === 'all') {
      return requirementsSource
    }
    return requirementsSource.filter((requirement) => requirement.status === activeStatusFilter)
  }, [activeStatusFilter, requirementsSource])

  const renderStatusBadge = (status) => {
    const classMap = {
      draft: 'manager-dash__badge--archived',
      review: 'manager-dash__badge--review',
      approved: 'manager-dash__badge--approved',
      rejected: 'manager-dash__badge--rejected',
      locked: 'manager-dash__badge--archived'
    }

    const displayStatus = status === 'locked' ? 'Locked' : workflowStageMap[status] || status
    return (
      <span className={`manager-dash__badge ${classMap[status] || classMap.draft}`}>
        {displayStatus}
      </span>
    )
  }

  return (
    <MainLayout user={currentUser} role="manager">
      <div className="manager-dash">
        <div className="manager-dash__header">
          <div className="manager-dash__header-left">
            <h1 className="manager-dash__title">Overview Dashboard</h1>
            <p className="manager-dash__subtitle">
              Live requirement overview for <strong>{currentProject.name}</strong>.
            </p>
          </div>
          <div className="manager-dash__status-badge">
            <span className="manager-dash__status-dot"></span>
            <span className="manager-dash__status-text">
              {requirementsSource.length} active requirements
            </span>
          </div>
        </div>

        <div className="manager-dash__kpi-grid">
          <div className="manager-dash__kpi-card">
            <span className="manager-dash__kpi-label">Draft</span>
            <div className="manager-dash__kpi-value">{statusCounts.draft}</div>
          </div>
          <div className="manager-dash__kpi-card manager-dash__kpi-card--primary">
            <span className="manager-dash__kpi-label manager-dash__kpi-label--primary">Review</span>
            <div className="manager-dash__kpi-value manager-dash__kpi-value--primary">{statusCounts.review}</div>
          </div>
          <div className="manager-dash__kpi-card manager-dash__kpi-card--success">
            <span className="manager-dash__kpi-label manager-dash__kpi-label--success">Approved</span>
            <div className="manager-dash__kpi-value manager-dash__kpi-value--success">{statusCounts.approved}</div>
          </div>
          <div className="manager-dash__kpi-card manager-dash__kpi-card--error">
            <span className="manager-dash__kpi-label manager-dash__kpi-label--error">Rejected</span>
            <div className="manager-dash__kpi-value manager-dash__kpi-value--error">{statusCounts.rejected}</div>
          </div>
          <div className="manager-dash__kpi-card manager-dash__kpi-card--error">
            <span className="manager-dash__kpi-label manager-dash__kpi-label--error">Overdue</span>
            <div className="manager-dash__kpi-value manager-dash__kpi-value--error">
              {(apiRequirements ? overdueRequirementsSource : overdueRequirements).length}
            </div>
            <div className="manager-dash__kpi-trend manager-dash__kpi-trend--warning">
              <span className="material-symbols-outlined">warning</span>
              Needs manager action
            </div>
          </div>
        </div>

        <section className="manager-dash__content-grid">
          <div className="manager-dash__main-content">
            <div className="manager-dash__section-header">
              <h2 className="manager-dash__section-title">
                <span className="material-symbols-outlined manager-dash__section-icon--error">priority_high</span>
                Overdue Notifications
              </h2>
            </div>

            <div className="manager-dash__alerts">
              {apiError && (
                <div className="manager-dash__alert-card">
                  <div className="manager-dash__alert-icon manager-dash__alert-icon--error">
                    <span className="material-symbols-outlined">error</span>
                  </div>
                  <div className="manager-dash__alert-content">
                    <h3 className="manager-dash__alert-title">Backend requirements unavailable</h3>
                    <p className="manager-dash__alert-desc">{apiError}</p>
                  </div>
                </div>
              )}
              {managerNotifications.length === 0 && (
                <div className="manager-dash__alert-card">
                  <div className="manager-dash__alert-icon manager-dash__alert-icon--primary">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div className="manager-dash__alert-content">
                    <div className="manager-dash__alert-header">
                      <h3 className="manager-dash__alert-title">No overdue requirements</h3>
                    </div>
                    <p className="manager-dash__alert-desc">
                      Deadlines are currently within expected ranges.
                    </p>
                  </div>
                </div>
              )}

              {managerNotifications.map((notification) => (
                <div key={notification.id} className="manager-dash__alert-card">
                  <div className="manager-dash__alert-icon manager-dash__alert-icon--error">
                    <span className="material-symbols-outlined">alarm_on</span>
                  </div>
                  <div className="manager-dash__alert-content">
                    <div className="manager-dash__alert-header">
                      <h3 className="manager-dash__alert-title">{notification.requirementId}</h3>
                      <span className="manager-dash__alert-badge manager-dash__alert-badge--error">Overdue</span>
                    </div>
                    <p className="manager-dash__alert-desc">{notification.message}</p>
                  </div>
                  <div className="manager-dash__alert-action">
                    <button
                      className="manager-dash__reassign-btn"
                      onClick={() => navigate(`/requirements/${notification.requirementId}`)}
                    >
                      <span className="material-symbols-outlined">open_in_new</span>
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="manager-dash__sidebar-widget">
            <h3 className="manager-dash__widget-title">Status Filter</h3>
            <div className="manager-dash__tabs">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  className={`manager-dash__tab ${activeStatusFilter === status ? 'manager-dash__tab--active' : ''}`}
                  onClick={() => setActiveStatusFilter(status)}
                >
                  {status === 'all' ? 'All' : workflowStageMap[status] || status}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="manager-dash__activity">
          <div className="manager-dash__activity-header">
            <h2 className="manager-dash__section-title">Requirement Overview</h2>
          </div>

          <div className="manager-dash__table-wrapper">
            <table className="manager-dash__table">
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th className="manager-dash__th--center">Status</th>
                  <th>Assignee</th>
                  <th>Deadline</th>
                  <th className="manager-dash__th--right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequirements.map((requirement) => {
                  const assignee = requirement.assigneeId
                    ? assigneeById[requirement.assigneeId]
                    : null

                  return (
                    <tr key={requirement.id}>
                      <td>
                        <div className="manager-dash__req-title">{requirement.title}</div>
                        <div className="manager-dash__req-project">{requirement.id}</div>
                      </td>
                      <td className="manager-dash__td--center">
                        {renderStatusBadge(requirement.status)}
                      </td>
                      <td>
                        <div className="manager-dash__owner">
                          <div className="manager-dash__owner-avatar">
                            {assignee ? assignee.name.charAt(0) : '?'}
                          </div>
                          <span className="manager-dash__owner-name">
                            {assignee ? assignee.name : 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className={`manager-dash__timeline ${overdueRequirementIdSet.has(requirement.id) ? 'manager-dash__timeline--overdue' : ''}`}>
                        {formatDateForDisplay(requirement.deadline)}
                      </td>
                      <td className="manager-dash__td--right">
                        <div className="manager-dash__actions">
                          <button
                            className="manager-dash__reassign-btn"
                            onClick={() => navigate(`/requirements/${requirement.id}`)}
                          >
                            <span className="material-symbols-outlined">open_in_new</span>
                            Open
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default ManagerDashboard
