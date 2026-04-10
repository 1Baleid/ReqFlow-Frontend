import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import { currentUser, requirements } from '../../data/mockData'
import './RequirementDetail.css'

// Extended mock data for the detail view
const requirementDetails = {
  'REQ-042': {
    originalDescription: 'The system needs a way to handle sudden spikes in traffic. It should automatically add more servers when load is high and remove them when load drops to save costs. This must work across all regions.',
    refinedDescription: {
      version: '2.4',
      content: [
        { type: 'text', value: 'The infrastructure ' },
        { type: 'removed', value: 'needs a way to handle' },
        { type: 'added', value: 'must implement an automated horizontal scaling mechanism to accommodate' },
        { type: 'text', value: ' sudden spikes in ' },
        { type: 'added', value: 'production' },
        { type: 'text', value: ' traffic. ' },
        { type: 'removed', value: 'It should automatically add more servers' },
        { type: 'added', value: 'Scaling policies will trigger additional compute nodes' },
        { type: 'text', value: ' when ' },
        { type: 'removed', value: 'load is high' },
        { type: 'added', value: 'CPU utilization exceeds 75% for 3 consecutive minutes' },
        { type: 'text', value: ' and ' },
        { type: 'removed', value: 'remove them' },
        { type: 'added', value: 'terminate idle instances' },
        { type: 'text', value: ' when load drops ' },
        { type: 'added', value: 'below 30%' },
        { type: 'text', value: ' to ' },
        { type: 'removed', value: 'save costs' },
        { type: 'added', value: 'optimize resource expenditure' },
        { type: 'text', value: '. This ' },
        { type: 'removed', value: 'must work across all regions' },
        { type: 'added', value: 'deployment must maintain high-availability parity across all active AWS regions (us-east-1, eu-central-1)' },
        { type: 'text', value: '.' }
      ]
    },
    acceptanceCriteria: [
      'Auto-scaling group (ASG) responds within 60 seconds of a metric threshold breach.',
      'Scale-in actions must respect the "Minimum Healthy Instances" setting of 3.',
      'Metrics are aggregated via CloudWatch with a 1-minute resolution.',
      'System remains operational if a single region scaling operation fails.'
    ],
    linkedRequirements: ['REQ-039', 'REQ-038'],
    discussion: [
      {
        id: 'disc-1',
        author: 'Marcus Chen',
        role: 'Lead Architect',
        avatar: null,
        time: '2 hours ago',
        message: 'Could you confirm if the 30% scale-in threshold is too aggressive? During testing, we noticed some "flapping" behavior where instances were being added and removed too frequently. Should we consider a cooldown period?'
      }
    ],
    timeline: [
      { id: 'tl-1', type: 'created', title: 'Requirement Created', date: 'Oct 12, 2023', author: 'Sarah J.', icon: 'add' },
      { id: 'tl-2', type: 'refined', title: 'Refined Version v2.0', date: 'Oct 14, 2023', author: 'Marcus C.', icon: 'auto_fix_high' },
      { id: 'tl-3', type: 'clarification', title: 'Clarification Requested', date: 'Oct 15, 2023', author: 'Client Team', icon: 'contact_support' },
      { id: 'tl-4', type: 'current', title: 'Awaiting Review', date: 'Now', author: 'v2.4 iteration', icon: 'pending' }
    ],
    impact: {
      complexity: 'High',
      riskScore: 8.4
    }
  }
}

// Default detail for requirements without specific details
const defaultDetail = {
  originalDescription: 'No original description available.',
  refinedDescription: null,
  acceptanceCriteria: [],
  linkedRequirements: [],
  discussion: [],
  timeline: [
    { id: 'tl-1', type: 'created', title: 'Requirement Created', date: 'Recently', author: 'System', icon: 'add' }
  ],
  impact: {
    complexity: 'Medium',
    riskScore: 5.0
  }
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', className: 'req-detail__status--draft' },
  'under-review': { label: 'Under Review', className: 'req-detail__status--review' },
  approved: { label: 'Approved', className: 'req-detail__status--approved' },
  rejected: { label: 'Rejected', className: 'req-detail__status--rejected' },
  locked: { label: 'Locked', className: 'req-detail__status--locked' }
}

function RequirementDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Find the requirement
  const requirement = requirements.find(r => r.id === id) || {
    id: id,
    title: 'Unknown Requirement',
    status: 'draft',
    version: '1.0'
  }

  // Get extended details
  const details = requirementDetails[id] || defaultDetail

  const normalizedStatus = requirement.status?.toLowerCase().replace(/\s+/g, '-') || 'draft'
  const statusConfig = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.draft

  const handleBack = () => {
    navigate('/requirements')
  }

  const handleEdit = () => {
    navigate(`/requirements/${id}/edit`)
  }

  const renderDiffContent = () => {
    if (!details.refinedDescription) return null

    return details.refinedDescription.content.map((part, index) => {
      if (part.type === 'added') {
        return <span key={index} className="req-detail__diff-added">{part.value}</span>
      }
      if (part.type === 'removed') {
        return <span key={index} className="req-detail__diff-removed">{part.value}</span>
      }
      return <span key={index}>{part.value}</span>
    })
  }

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
      <div className="req-detail">
        {/* Header */}
        <div className="req-detail__header">
          <div className="req-detail__header-left">
            <div className="req-detail__header-meta">
              <span className="req-detail__id">{requirement.id}</span>
              <span className={`req-detail__status ${statusConfig.className}`}>
                <span className="req-detail__status-dot"></span>
                {statusConfig.label}
              </span>
            </div>
            <h1 className="req-detail__title">{requirement.title}</h1>
          </div>
          <div className="req-detail__header-actions">
            <Button variant="secondary" icon="arrow_back" iconPosition="left" onClick={handleBack}>
              Back
            </Button>
            {normalizedStatus === 'under-review' && (
              <>
                <button className="req-detail__reject-btn">
                  <span className="material-symbols-outlined">close</span>
                  Reject
                </button>
                <button className="req-detail__approve-btn">
                  <span className="material-symbols-outlined">check_circle</span>
                  Approve
                </button>
              </>
            )}
            {(normalizedStatus === 'draft' || normalizedStatus === 'under-review' || normalizedStatus === 'rejected') && (
              <Button variant="primary" icon="edit" iconPosition="left" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Bento Grid */}
        <div className="req-detail__grid">
          {/* Main Content */}
          <div className="req-detail__main">
            {/* Original Description */}
            <section className="req-detail__card">
              <div className="req-detail__card-header">
                <h3 className="req-detail__card-title">Original Description</h3>
                <span className="material-symbols-outlined req-detail__card-icon">history_edu</span>
              </div>
              <p className="req-detail__description">
                {details.originalDescription}
              </p>
            </section>

            {/* Refined Version */}
            {details.refinedDescription && (
              <section className="req-detail__card req-detail__card--refined">
                <div className="req-detail__version-badge">
                  Current Iteration (v{details.refinedDescription.version})
                </div>
                <div className="req-detail__card-header">
                  <h3 className="req-detail__card-title">Refined Version</h3>
                  <span className="material-symbols-outlined req-detail__card-icon req-detail__card-icon--primary">auto_fix_high</span>
                </div>
                <div className="req-detail__refined-content">
                  <p className="req-detail__refined-text">
                    {renderDiffContent()}
                  </p>
                </div>
              </section>
            )}

            {/* Acceptance Criteria */}
            {details.acceptanceCriteria.length > 0 && (
              <section className="req-detail__card">
                <div className="req-detail__card-header">
                  <h3 className="req-detail__card-title">Acceptance Criteria</h3>
                  <span className="material-symbols-outlined req-detail__card-icon">rule</span>
                </div>
                <ul className="req-detail__criteria-list">
                  {details.acceptanceCriteria.map((criteria, index) => (
                    <li key={index} className="req-detail__criteria-item">
                      <span className="material-symbols-outlined req-detail__criteria-icon">task_alt</span>
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Discussion */}
            <section className="req-detail__card">
              <div className="req-detail__card-header">
                <h3 className="req-detail__card-title">Discussion & Clarification</h3>
                <span className="material-symbols-outlined req-detail__card-icon">forum</span>
              </div>
              <div className="req-detail__discussion">
                {details.discussion.map((comment) => (
                  <div key={comment.id} className="req-detail__comment">
                    <div className="req-detail__comment-avatar">
                      {comment.author.charAt(0)}
                    </div>
                    <div className="req-detail__comment-content">
                      <div className="req-detail__comment-header">
                        <span className="req-detail__comment-author">
                          {comment.author}
                          <span className="req-detail__comment-role">{comment.role}</span>
                        </span>
                        <span className="req-detail__comment-time">{comment.time}</span>
                      </div>
                      <p className="req-detail__comment-text">{comment.message}</p>
                    </div>
                  </div>
                ))}

                {/* Reply Field */}
                <div className="req-detail__reply">
                  <div className="req-detail__reply-avatar">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="req-detail__reply-input-wrapper">
                    <textarea
                      className="req-detail__reply-input"
                      placeholder="Add a comment..."
                      rows="3"
                    />
                    <div className="req-detail__reply-actions">
                      <button className="req-detail__reply-btn">Send Reply</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="req-detail__sidebar">
            {/* Linked Requirements */}
            <section className="req-detail__sidebar-card">
              <h3 className="req-detail__sidebar-title">Linked Requirements</h3>
              <div className="req-detail__links">
                {details.linkedRequirements.map((linkId) => (
                  <a
                    key={linkId}
                    href={`/requirements/${linkId}`}
                    className="req-detail__link-tag"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(`/requirements/${linkId}`)
                    }}
                  >
                    <span className="material-symbols-outlined">link</span>
                    {linkId}
                  </a>
                ))}
                <button className="req-detail__link-add">+ Link</button>
              </div>
            </section>

            {/* Activity Timeline */}
            <section className="req-detail__sidebar-card req-detail__sidebar-card--white">
              <div className="req-detail__sidebar-header">
                <h3 className="req-detail__sidebar-title">Activity History</h3>
                <button
                  className="req-detail__history-link"
                  onClick={() => navigate(`/requirements/${id}/versions`)}
                >
                  <span className="material-symbols-outlined">history</span>
                  View All Versions
                </button>
              </div>
              <div className="req-detail__timeline">
                {details.timeline.map((item, index) => (
                  <div
                    key={item.id}
                    className={`req-detail__timeline-item ${item.type === 'current' ? 'req-detail__timeline-item--current' : ''}`}
                  >
                    <div className={`req-detail__timeline-icon req-detail__timeline-icon--${item.type}`}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div className="req-detail__timeline-content">
                      <p className={`req-detail__timeline-title ${item.type === 'current' ? 'req-detail__timeline-title--primary' : ''}`}>
                        {item.title}
                      </p>
                      <p className="req-detail__timeline-meta">
                        {item.date} • by {item.author}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Impact Assessment */}
            <section className="req-detail__sidebar-card req-detail__sidebar-card--gradient">
              <div className="req-detail__impact-header">
                <span className="material-symbols-outlined">analytics</span>
                <h4 className="req-detail__impact-title">Impact Assessment</h4>
              </div>
              <div className="req-detail__impact-content">
                <div className="req-detail__impact-row">
                  <span className="req-detail__impact-label">Complexity</span>
                  <span className={`req-detail__impact-value req-detail__impact-value--${details.impact.complexity.toLowerCase()}`}>
                    {details.impact.complexity}
                  </span>
                </div>
                <div className="req-detail__impact-row">
                  <span className="req-detail__impact-label">Risk Score</span>
                  <span className="req-detail__impact-value">{details.impact.riskScore} / 10</span>
                </div>
                <div className="req-detail__impact-bar">
                  <div
                    className="req-detail__impact-bar-fill"
                    style={{ width: `${details.impact.riskScore * 10}%` }}
                  />
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </MainLayout>
  )
}

export default RequirementDetail
