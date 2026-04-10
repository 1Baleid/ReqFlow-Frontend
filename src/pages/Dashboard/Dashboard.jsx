import { useState } from 'react'
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
import {
  getCurrentUser,
  requirements,
  activities,
  projectStats,
  statusFilters,
  getCurrentProject
} from '../../data/mockData'
import './Dashboard.css'

function Dashboard() {
  const currentUser = getCurrentUser()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const currentProject = getCurrentProject()

  // Filter requirements
  const filteredRequirements = requirements.filter(req => {
    const matchesFilter = activeFilter === 'all' || req.status === activeFilter
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleCreateRequirement = () => {
    navigate('/requirements/new')
  }

  const handleViewAllLogs = () => {
    // TODO: Navigate to activity logs
    console.log('View all logs')
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
            {filteredRequirements.length > 0 ? (
              filteredRequirements.map(req => (
                <RequirementCard key={req.id} requirement={req} />
              ))
            ) : (
              <EmptyState
                icon="post_add"
                title="No active drafts found"
                description={`It looks like you haven't started any requirements for the "Enterprise Portal" project yet. Ready to build something great?`}
                actionLabel="Create First Requirement"
                onAction={handleCreateRequirement}
              />
            )}
          </div>
        </div>

        {/* Right Column - Stats & Activity */}
        <div className="dashboard__sidebar">
          {/* Project Health */}
          <StatCard title="Project Health">
            <StatCard.Progress
              label="Completion Rate"
              value={`${projectStats.completionRate}%`}
              percentage={projectStats.completionRate}
            />
            <div className="stat-card__grid">
              <StatCard.Mini label="Total" value={projectStats.total} />
              <StatCard.Mini label="Pending" value={projectStats.pending} />
            </div>
          </StatCard>

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
