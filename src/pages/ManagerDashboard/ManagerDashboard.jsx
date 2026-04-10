import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { demoUsers, teamMembers as allTeamMembers, organization } from '../../data/mockData'
import './ManagerDashboard.css'

// Get manager user from centralized data
const managerUser = demoUsers['khalid@kfupm.edu.sa']

// KPI data
const kpiStats = {
  total: 1284,
  draft: 142,
  underReview: 89,
  approved: 924,
  overdue: 12
}

// Action items
const actionItems = [
  {
    id: 'act-1',
    type: 'overdue',
    title: 'Data Privacy Protocol v3.1',
    description: 'Review missed for compliance requirements. Deadline was 48h ago.',
    status: 'overdue'
  },
  {
    id: 'act-2',
    type: 'unassigned',
    title: 'UI Design System - Logic',
    description: 'New requirement ingested from SWE363 Project. Needs owner.',
    status: 'unassigned'
  }
]

// Use team members from centralized data
const teamMembers = allTeamMembers.slice(0, 3)

// Activity data with unified names
const activityData = [
  {
    id: 'rec-1',
    title: 'User Authentication v2',
    project: 'Core API Service',
    status: 'approved',
    owner: { name: 'Abdullah Al-Rashid', avatar: null },
    time: '12 mins ago'
  },
  {
    id: 'rec-2',
    title: 'Offline Sync Latency',
    project: 'Mobile SDK',
    status: 'commented',
    owner: { name: 'Omar Faisal', avatar: null },
    time: '2 hours ago'
  },
  {
    id: 'rec-3',
    title: 'Legacy Export Patch',
    project: 'Migration Project',
    status: 'archived',
    owner: { name: 'Nora Ahmed', avatar: null },
    time: 'Yesterday'
  }
]

const STATUS_BADGE_CONFIG = {
  approved: { label: 'Approved', className: 'manager-dash__badge--approved' },
  commented: { label: 'Commented', className: 'manager-dash__badge--commented' },
  archived: { label: 'Archived', className: 'manager-dash__badge--archived' },
  'under-review': { label: 'Under Review', className: 'manager-dash__badge--review' }
}

function ManagerDashboard() {
  const navigate = useNavigate()

  return (
    <MainLayout user={managerUser} role="manager">
      <div className="manager-dash">
        {/* Header */}
        <div className="manager-dash__header">
          <div className="manager-dash__header-left">
            <h1 className="manager-dash__title">Team Overview</h1>
            <p className="manager-dash__subtitle">Operations management dashboard for {organization.project}.</p>
          </div>
          <div className="manager-dash__status-badge">
            <span className="manager-dash__status-dot"></span>
            <span className="manager-dash__status-text">All systems operational</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="manager-dash__kpi-grid">
          <div className="manager-dash__kpi-card">
            <span className="manager-dash__kpi-label">Total Req</span>
            <div className="manager-dash__kpi-value">{kpiStats.total.toLocaleString()}</div>
            <div className="manager-dash__kpi-trend manager-dash__kpi-trend--up">
              <span className="material-symbols-outlined">trending_up</span>
              +12%
            </div>
          </div>

          <div className="manager-dash__kpi-card">
            <span className="manager-dash__kpi-label">Draft</span>
            <div className="manager-dash__kpi-value">{kpiStats.draft}</div>
            <div className="manager-dash__kpi-meta">Pending initial review</div>
          </div>

          <div className="manager-dash__kpi-card manager-dash__kpi-card--primary">
            <span className="manager-dash__kpi-label manager-dash__kpi-label--primary">Under Review</span>
            <div className="manager-dash__kpi-value manager-dash__kpi-value--primary">{kpiStats.underReview}</div>
            <div className="manager-dash__kpi-meta manager-dash__kpi-meta--primary">Active cycles</div>
          </div>

          <div className="manager-dash__kpi-card manager-dash__kpi-card--success">
            <span className="manager-dash__kpi-label manager-dash__kpi-label--success">Approved</span>
            <div className="manager-dash__kpi-value manager-dash__kpi-value--success">{kpiStats.approved}</div>
            <div className="manager-dash__kpi-meta manager-dash__kpi-meta--success">Baseline locked</div>
          </div>

          <div className="manager-dash__kpi-card manager-dash__kpi-card--error">
            <span className="manager-dash__kpi-label manager-dash__kpi-label--error">Overdue</span>
            <div className="manager-dash__kpi-value manager-dash__kpi-value--error">{kpiStats.overdue}</div>
            <div className="manager-dash__kpi-trend manager-dash__kpi-trend--warning">
              <span className="material-symbols-outlined">warning</span>
              Requires action
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <section className="manager-dash__content-grid">
          {/* Action Required */}
          <div className="manager-dash__main-content">
            <div className="manager-dash__section-header">
              <h2 className="manager-dash__section-title">
                <span className="material-symbols-outlined manager-dash__section-icon--error">priority_high</span>
                Action Required
              </h2>
              <button className="manager-dash__link-btn">View All Tasks</button>
            </div>

            <div className="manager-dash__alerts">
              {actionItems.map((item) => (
                <div key={item.id} className="manager-dash__alert-card">
                  <div className={`manager-dash__alert-icon ${item.type === 'overdue' ? 'manager-dash__alert-icon--error' : 'manager-dash__alert-icon--primary'}`}>
                    <span className="material-symbols-outlined">
                      {item.type === 'overdue' ? 'alarm_on' : 'person_add'}
                    </span>
                  </div>
                  <div className="manager-dash__alert-content">
                    <div className="manager-dash__alert-header">
                      <h3 className="manager-dash__alert-title">{item.title}</h3>
                      <span className={`manager-dash__alert-badge ${item.type === 'overdue' ? 'manager-dash__alert-badge--error' : 'manager-dash__alert-badge--secondary'}`}>
                        {item.status === 'overdue' ? 'Overdue' : 'Unassigned'}
                      </span>
                    </div>
                    <p className="manager-dash__alert-desc">{item.description}</p>
                  </div>
                  <div className="manager-dash__alert-action">
                    <select className="manager-dash__assign-select">
                      <option>Assign Owner...</option>
                      {teamMembers.map((member) => (
                        <option key={member.id}>{member.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined manager-dash__select-arrow">expand_more</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Performance */}
          <div className="manager-dash__sidebar-widget">
            <h3 className="manager-dash__widget-title">Team Performance</h3>
            <div className="manager-dash__metrics">
              <div className="manager-dash__metric">
                <div className="manager-dash__metric-left">
                  <div className="manager-dash__metric-icon manager-dash__metric-icon--blue">
                    <span className="material-symbols-outlined">speed</span>
                  </div>
                  <span className="manager-dash__metric-label">Cycle Time</span>
                </div>
                <span className="manager-dash__metric-value">4.2 Days</span>
              </div>
              <div className="manager-dash__metric">
                <div className="manager-dash__metric-left">
                  <div className="manager-dash__metric-icon manager-dash__metric-icon--green">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <span className="manager-dash__metric-label">Quality Rate</span>
                </div>
                <span className="manager-dash__metric-value">98.4%</span>
              </div>
            </div>
            <div className="manager-dash__team-section">
              <div className="manager-dash__team-avatars">
                {teamMembers.slice(0, 2).map((member, index) => (
                  <div key={member.id} className="manager-dash__team-avatar">
                    {member.name.charAt(0)}
                  </div>
                ))}
                <div className="manager-dash__team-more">+8</div>
              </div>
              <p className="manager-dash__team-info">11 active members • 4 projects</p>
            </div>
          </div>
        </section>

        {/* Activity Feed */}
        <section className="manager-dash__activity">
          <div className="manager-dash__activity-header">
            <h2 className="manager-dash__section-title">Recent Activity</h2>
            <div className="manager-dash__tabs">
              <button className="manager-dash__tab manager-dash__tab--active">Global</button>
              <button className="manager-dash__tab">Personal</button>
            </div>
          </div>

          <div className="manager-dash__table-wrapper">
            <table className="manager-dash__table">
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th className="manager-dash__th--center">Status</th>
                  <th>Current Owner</th>
                  <th>Timeline</th>
                  <th className="manager-dash__th--right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activityData.map((activity) => {
                  const badgeConfig = STATUS_BADGE_CONFIG[activity.status] || STATUS_BADGE_CONFIG.approved
                  return (
                    <tr key={activity.id}>
                      <td>
                        <div className="manager-dash__req-title">{activity.title}</div>
                        <div className="manager-dash__req-project">{activity.project}</div>
                      </td>
                      <td className="manager-dash__td--center">
                        <span className={`manager-dash__badge ${badgeConfig.className}`}>
                          {badgeConfig.label}
                        </span>
                      </td>
                      <td>
                        <div className="manager-dash__owner">
                          <div className="manager-dash__owner-avatar">
                            {activity.owner.name.charAt(0)}
                          </div>
                          <span className="manager-dash__owner-name">{activity.owner.name}</span>
                        </div>
                      </td>
                      <td className="manager-dash__timeline">{activity.time}</td>
                      <td className="manager-dash__td--right">
                        <div className="manager-dash__actions">
                          <button className="manager-dash__reassign-btn">
                            <span className="material-symbols-outlined">sync_alt</span>
                            Reassign
                          </button>
                          <button className="manager-dash__open-btn">
                            <span className="material-symbols-outlined">open_in_new</span>
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
