import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import FilterChips from '../../components/FilterChips'
import SearchInput from '../../components/SearchInput'
import RequirementCard from '../../components/RequirementCard'
import EmptyState from '../../components/EmptyState'
import StatCard from '../../components/StatCard'
import ActivityFeed from '../../components/ActivityFeed'
import { DonutChart, ProgressChart, MiniChart } from '../../components/Charts'
import { getDashboardStats } from '../../services/dashboardApi'
import { listRequirements as listRequirementsApi } from '../../services/requirementsApi'
import {
  activities,
  statusFilters,
  getCurrentProject
} from '../../data/mockData'
import { useProjectData } from '../../context/ProjectDataContext'
import './Dashboard.css'

function Dashboard() {
  const { currentUser, activeRequirements } = useProjectData()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dashboardStats, setDashboardStats] = useState(null)
  const [apiRequirements, setApiRequirements] = useState(null)
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const currentProject = getCurrentProject()

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getDashboardStats(currentProject?.id)
      setDashboardStats(stats)
    }
    fetchStats()
  }, [currentProject?.id])

  // Fetch requirements from API
  useEffect(() => {
    let isMounted = true

    async function loadRequirements() {
      setIsLoadingApi(true)
      try {
        const result = await listRequirementsApi({
          projectId: currentProject?.id || 'proj-1'
        })
        if (isMounted) {
          setApiRequirements(result.requirements)
        }
      } catch (error) {
        // Silently fall back to context data on error
        if (isMounted) {
          setApiRequirements(null)
        }
      } finally {
        if (isMounted) {
          setIsLoadingApi(false)
        }
      }
    }

    loadRequirements()

    return () => {
      isMounted = false
    }
  }, [currentProject?.id])

  // Use API requirements if available, otherwise fall back to context
  const requirementSource = apiRequirements || activeRequirements

  // Calculate stats from requirements for charts
  const computedStats = useMemo(() => {
    const statusCounts = { draft: 0, review: 0, approved: 0, rejected: 0, locked: 0 }
    const priorityCounts = { low: 0, medium: 0, high: 0, critical: 0 }

    requirementSource.forEach(req => {
      if (statusCounts[req.status] !== undefined) statusCounts[req.status]++
      if (priorityCounts[req.priority] !== undefined) priorityCounts[req.priority]++
    })

    const total = activeRequirements.length
    const approved = statusCounts.approved + statusCounts.locked
    const completionRate = total > 0 ? Math.round((approved / total) * 100) : 0

    return {
      statusDistribution: [
        { label: 'Draft', value: statusCounts.draft, color: '#64748b' },
        { label: 'Review', value: statusCounts.review, color: '#f59e0b' },
        { label: 'Approved', value: statusCounts.approved, color: '#10b981' },
        { label: 'Rejected', value: statusCounts.rejected, color: '#ef4444' }
      ].filter(s => s.value > 0),
      priorityDistribution: [
        { label: 'Low', value: priorityCounts.low, color: '#94a3b8' },
        { label: 'Medium', value: priorityCounts.medium, color: '#3b82f6' },
        { label: 'High', value: priorityCounts.high, color: '#f59e0b' },
        { label: 'Critical', value: priorityCounts.critical, color: '#ef4444' }
      ].filter(p => p.value > 0),
      total,
      completionRate,
      pending: statusCounts.draft + statusCounts.review
    }
  }, [requirementSource])

  // Filter requirements — client sees only their own
  const filteredRequirements = requirementSource
    .filter(req => {
      if (currentUser.role === 'client' && req.createdBy?.id !== currentUser.id) return false
      if (currentUser.role === 'member' && req.assigneeId !== currentUser.id) return false
      const displayStatus = req.status === 'review' ? 'under-review' : req.status
      const matchesFilter = activeFilter === 'all' || displayStatus === activeFilter
      const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            req.id.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
    .map(req => ({ ...req, status: req.status === 'review' ? 'under-review' : req.status }))

  const activeFilterLabel = statusFilters.find((filter) => filter.value === activeFilter)?.label || 'Requirements'

  const emptyStateTitle = searchQuery.trim()
    ? 'No matching requirements found'
    : activeFilter === 'all'
      ? 'No requirements found'
      : `No ${activeFilterLabel.toLowerCase()} requirements found`

  const emptyStateDescription = searchQuery.trim()
    ? `No ${activeFilterLabel.toLowerCase()} requirements match "${searchQuery.trim()}" in the "${currentProject.name}" project.`
    : activeFilter === 'all'
      ? `It looks like there are no requirements in the "${currentProject.name}" project yet. Ready to build something great?`
      : `There are no ${activeFilterLabel.toLowerCase()} requirements in the "${currentProject.name}" project right now.`

  const emptyStateActionLabel = searchQuery.trim() || activeFilter !== 'all'
    ? 'Create Requirement'
    : 'Create First Requirement'

  const handleCreateRequirement = () => {
    navigate('/requirements/new')
  }

  const handleViewAllLogs = () => {
    navigate('/requirements')
  }

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
      <div className="dashboard">
      {/* Page Header */}
      <PageHeader
        title={`Hello, ${currentUser.name.split(' ')[0]}`}
        subtitle={`Working on ${currentProject.name} • Manage and track your requirements.`}
        actions={
          <>
            <Button variant="secondary" icon="file_download" iconPosition="left">
              Export List
            </Button>
            <Button variant="primary" icon="add" iconPosition="left" onClick={handleCreateRequirement}>
              New Requirement
            </Button>
          </>
        }
      />

      {/* Filter Bar */}
      <FilterChips
        filters={statusFilters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Main Grid */}
      <div className="dashboard__grid">
        {/* Left Column - Requirements List */}
        <div className="dashboard__main">
          {/* Search & Sort */}
          <div className="dashboard__toolbar">
            <SearchInput
              placeholder="Filter by ID or Keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="dashboard__sort-btn">
              <span className="material-symbols-outlined">sort</span>
            </button>
          </div>

          {/* Requirements List */}
          <div className="dashboard__list">
            {isLoadingApi ? (
              <p className="dashboard__loading">Loading requirements...</p>
            ) : filteredRequirements.length > 0 ? (
              filteredRequirements.map(req => (
                <RequirementCard key={req.id} requirement={req} />
              ))
            ) : (
              <EmptyState
                icon="post_add"
                title={emptyStateTitle}
                description={emptyStateDescription}
                actionLabel={emptyStateActionLabel}
                onAction={handleCreateRequirement}
              />
            )}
          </div>

        </div>

        {/* Right Column - Stats & Activity */}
        <div className="dashboard__sidebar">
          {/* Project Health */}
          <StatCard title="Project Health">
            <ProgressChart
              value={computedStats.completionRate}
              max={100}
              label="Completion Rate"
              color="success"
            />
            <div className="stat-card__grid">
              <StatCard.Mini label="Total" value={computedStats.total} />
              <StatCard.Mini label="Pending" value={computedStats.pending} />
            </div>
          </StatCard>

          {/* Status Distribution Chart */}
          {computedStats.statusDistribution.length > 0 && (
            <StatCard title="Status Overview">
              <DonutChart
                data={computedStats.statusDistribution}
                size={140}
                strokeWidth={20}
                showLegend={true}
                showCenter={true}
                centerValue={computedStats.total}
                centerLabel="Total"
              />
            </StatCard>
          )}

          {/* Priority Distribution */}
          {computedStats.priorityDistribution.length > 0 && (
            <StatCard title="Priority Breakdown">
              <div className="dashboard__priority-bars">
                {computedStats.priorityDistribution.map(p => (
                  <ProgressChart
                    key={p.label}
                    value={p.value}
                    max={computedStats.total}
                    label={p.label}
                    color={p.color}
                    size="sm"
                  />
                ))}
              </div>
            </StatCard>
          )}

          {/* Recent Activity */}
          <ActivityFeed
            activities={activities}
            onViewAll={handleViewAllLogs}
          />
        </div>
      </div>
      </div>
    </MainLayout>
  )
}

export default Dashboard
