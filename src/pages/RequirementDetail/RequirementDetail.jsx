import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import { getCurrentUser, requirements } from '../../data/mockData'
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
  const currentUser = getCurrentUser()
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

  // State for interactive features
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState(details.discussion)
  const [criteriaList, setCriteriaList] = useState(details.acceptanceCriteria)
  const [newCriteria, setNewCriteria] = useState('')
  const [showAddCriteria, setShowAddCriteria] = useState(false)
  const [linkedReqs, setLinkedReqs] = useState(details.linkedRequirements)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkSearch, setLinkSearch] = useState('')
  const [showDeadlineModal, setShowDeadlineModal] = useState(false)
  const [deadline, setDeadline] = useState('')
  const [savedDeadline, setSavedDeadline] = useState('')
  const [reqStatus, setReqStatus] = useState(normalizedStatus)
  const [showLockConfirm, setShowLockConfirm] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)

  // Available requirements for linking
  const availableForLink = requirements
    .filter(r => r.id !== id && !linkedReqs.includes(r.id))
    .filter(r => linkSearch === '' || r.id.toLowerCase().includes(linkSearch.toLowerCase()) || r.title.toLowerCase().includes(linkSearch.toLowerCase()))

  const handleBack = () => {
    navigate('/requirements')
  }

  const handleEdit = () => {
    navigate(`/requirements/${id}/edit`)
  }

  const handlePostComment = () => {
    if (!commentText.trim()) return
    const newComment = {
      id: `disc-${Date.now()}`,
      author: currentUser.name,
      role: currentUser.role === 'client' ? 'Client' : currentUser.role === 'manager' ? 'Manager' : 'Team Member',
      avatar: null,
      time: 'Just now',
      message: commentText.trim()
    }
    setComments(prev => [...prev, newComment])
    setCommentText('')
  }

  const handleAddCriteria = () => {
    if (!newCriteria.trim()) return
    setCriteriaList(prev => [...prev, newCriteria.trim()])
    setNewCriteria('')
    setShowAddCriteria(false)
  }

  const handleLinkRequirement = (reqId) => {
    setLinkedReqs(prev => [...prev, reqId])
    setShowLinkModal(false)
    setLinkSearch('')
  }

  const handleSetDeadline = () => {
    if (!deadline) return
    setSavedDeadline(deadline)
    setShowDeadlineModal(false)
  }

  const handleLock = () => {
    setReqStatus('locked')
    setShowLockConfirm(false)
  }

  const handleApprove = () => {
    setReqStatus('approved')
    setShowApproveConfirm(false)
  }

  const handleReject = () => {
    if (!rejectReason.trim()) return
    setReqStatus('rejected')
    setShowRejectModal(false)
    setRejectReason('')
  }

  const activeStatusConfig = STATUS_CONFIG[reqStatus] || statusConfig

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
              <span className={`req-detail__status ${activeStatusConfig.className}`}>
                <span className="req-detail__status-dot"></span>
                {activeStatusConfig.label}
              </span>
            </div>
            <h1 className="req-detail__title">{requirement.title}</h1>
          </div>
          <div className="req-detail__header-actions">
            <Button variant="secondary" icon="arrow_back" iconPosition="left" onClick={handleBack}>
              Back
            </Button>
            {(currentUser.role === 'manager') && reqStatus !== 'locked' && (
              <button className="req-detail__deadline-btn" onClick={() => setShowDeadlineModal(true)}>
                <span className="material-symbols-outlined">calendar_month</span>
                {savedDeadline ? `Due: ${new Date(savedDeadline).toLocaleDateString()}` : 'Set Deadline'}
              </button>
            )}
            {reqStatus === 'under-review' && (
              <>
                <button className="req-detail__reject-btn" onClick={() => setShowRejectModal(true)}>
                  <span className="material-symbols-outlined">close</span>
                  Reject
                </button>
                <button className="req-detail__approve-btn" onClick={() => setShowApproveConfirm(true)}>
                  <span className="material-symbols-outlined">check_circle</span>
                  Approve
                </button>
              </>
            )}
            {reqStatus === 'approved' && currentUser.role === 'manager' && (
              <button className="req-detail__lock-btn" onClick={() => setShowLockConfirm(true)}>
                <span className="material-symbols-outlined">lock</span>
                Lock Requirement
              </button>
            )}
            {(reqStatus === 'draft' || reqStatus === 'under-review' || reqStatus === 'rejected') && (
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
            <section className="req-detail__card">
              <div className="req-detail__card-header">
                <h3 className="req-detail__card-title">Acceptance Criteria</h3>
                <div className="req-detail__card-header-right">
                  {reqStatus !== 'locked' && (
                    <button className="req-detail__add-criteria-btn" onClick={() => setShowAddCriteria(true)}>
                      <span className="material-symbols-outlined">add</span>
                      Add Criteria
                    </button>
                  )}
                  <span className="material-symbols-outlined req-detail__card-icon">rule</span>
                </div>
              </div>
              <ul className="req-detail__criteria-list">
                {criteriaList.map((criteria, index) => (
                  <li key={index} className="req-detail__criteria-item">
                    <span className="material-symbols-outlined req-detail__criteria-icon">task_alt</span>
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>
              {criteriaList.length === 0 && (
                <p className="req-detail__empty-text">No acceptance criteria defined yet.</p>
              )}
              {showAddCriteria && (
                <div className="req-detail__add-criteria-form">
                  <input
                    type="text"
                    className="req-detail__criteria-input"
                    placeholder="Enter acceptance criteria..."
                    value={newCriteria}
                    onChange={(e) => setNewCriteria(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCriteria()}
                  />
                  <div className="req-detail__criteria-form-actions">
                    <button className="req-detail__criteria-cancel" onClick={() => { setShowAddCriteria(false); setNewCriteria('') }}>Cancel</button>
                    <button className="req-detail__criteria-save" onClick={handleAddCriteria}>Add</button>
                  </div>
                </div>
              )}
            </section>

            {/* Discussion */}
            <section className="req-detail__card">
              <div className="req-detail__card-header">
                <h3 className="req-detail__card-title">Discussion & Clarification</h3>
                <span className="material-symbols-outlined req-detail__card-icon">forum</span>
              </div>
              <div className="req-detail__discussion">
                {comments.map((comment) => (
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
                {comments.length === 0 && (
                  <p className="req-detail__empty-text">No comments yet. Start the discussion below.</p>
                )}

                {/* Reply Field */}
                <div className="req-detail__reply">
                  <div className="req-detail__reply-avatar">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="req-detail__reply-input-wrapper">
                    <textarea
                      className="req-detail__reply-input"
                      placeholder="Add a comment or request clarification..."
                      rows="3"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="req-detail__reply-actions">
                      <button className="req-detail__clarify-btn" onClick={() => { setCommentText(prev => prev ? prev : '[Clarification Request] '); }}>
                        <span className="material-symbols-outlined">contact_support</span>
                        Request Clarification
                      </button>
                      <button className="req-detail__reply-btn" onClick={handlePostComment} disabled={!commentText.trim()}>
                        Send Reply
                      </button>
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
                {linkedReqs.map((linkId) => (
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
                {linkedReqs.length === 0 && <span className="req-detail__empty-text">No linked requirements</span>}
                {reqStatus !== 'locked' && (
                  <button className="req-detail__link-add" onClick={() => setShowLinkModal(true)}>+ Link</button>
                )}
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

        {/* Link Requirements Modal */}
        {showLinkModal && (
          <div className="req-detail__modal-overlay" onClick={() => setShowLinkModal(false)}>
            <div className="req-detail__modal" onClick={(e) => e.stopPropagation()}>
              <div className="req-detail__modal-header">
                <h3>Link Requirement</h3>
                <button className="req-detail__modal-close" onClick={() => setShowLinkModal(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <input
                type="text"
                className="req-detail__modal-search"
                placeholder="Search requirements by ID or title..."
                value={linkSearch}
                onChange={(e) => setLinkSearch(e.target.value)}
              />
              <div className="req-detail__modal-list">
                {availableForLink.map((req) => (
                  <button
                    key={req.id}
                    className="req-detail__modal-item"
                    onClick={() => handleLinkRequirement(req.id)}
                  >
                    <span className="req-detail__modal-item-id">{req.id}</span>
                    <span className="req-detail__modal-item-title">{req.title}</span>
                  </button>
                ))}
                {availableForLink.length === 0 && (
                  <p className="req-detail__modal-empty">No requirements available to link.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Set Deadline Modal */}
        {showDeadlineModal && (
          <div className="req-detail__modal-overlay" onClick={() => setShowDeadlineModal(false)}>
            <div className="req-detail__modal req-detail__modal--sm" onClick={(e) => e.stopPropagation()}>
              <div className="req-detail__modal-header">
                <h3>Set Deadline</h3>
                <button className="req-detail__modal-close" onClick={() => setShowDeadlineModal(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="req-detail__modal-body">
                <label className="req-detail__modal-label">Select deadline date</label>
                <input
                  type="date"
                  className="req-detail__date-input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="req-detail__modal-footer">
                <button className="req-detail__modal-cancel" onClick={() => setShowDeadlineModal(false)}>Cancel</button>
                <button className="req-detail__modal-confirm" onClick={handleSetDeadline} disabled={!deadline}>Set Deadline</button>
              </div>
            </div>
          </div>
        )}

        {/* Lock Confirmation Modal */}
        {showLockConfirm && (
          <div className="req-detail__modal-overlay" onClick={() => setShowLockConfirm(false)}>
            <div className="req-detail__modal req-detail__modal--sm" onClick={(e) => e.stopPropagation()}>
              <div className="req-detail__modal-header">
                <h3>Lock Requirement</h3>
                <button className="req-detail__modal-close" onClick={() => setShowLockConfirm(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="req-detail__modal-body">
                <div className="req-detail__modal-icon-wrapper">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <p className="req-detail__modal-text">Are you sure you want to lock <strong>{requirement.id}</strong>? This will disable editing for all roles.</p>
              </div>
              <div className="req-detail__modal-footer">
                <button className="req-detail__modal-cancel" onClick={() => setShowLockConfirm(false)}>Cancel</button>
                <button className="req-detail__modal-confirm req-detail__modal-confirm--lock" onClick={handleLock}>Lock Requirement</button>
              </div>
            </div>
          </div>
        )}

        {/* Approve Confirmation Modal */}
        {showApproveConfirm && (
          <div className="req-detail__modal-overlay" onClick={() => setShowApproveConfirm(false)}>
            <div className="req-detail__modal req-detail__modal--sm" onClick={(e) => e.stopPropagation()}>
              <div className="req-detail__modal-header">
                <h3>Approve Requirement</h3>
                <button className="req-detail__modal-close" onClick={() => setShowApproveConfirm(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="req-detail__modal-body">
                <p className="req-detail__modal-text">Are you sure you want to approve <strong>{requirement.id}</strong>? The status will change to Approved.</p>
              </div>
              <div className="req-detail__modal-footer">
                <button className="req-detail__modal-cancel" onClick={() => setShowApproveConfirm(false)}>Cancel</button>
                <button className="req-detail__modal-confirm" onClick={handleApprove}>Approve</button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="req-detail__modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="req-detail__modal req-detail__modal--sm" onClick={(e) => e.stopPropagation()}>
              <div className="req-detail__modal-header">
                <h3>Reject Requirement</h3>
                <button className="req-detail__modal-close" onClick={() => setShowRejectModal(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="req-detail__modal-body">
                <label className="req-detail__modal-label">Justification (required)</label>
                <textarea
                  className="req-detail__modal-textarea"
                  placeholder="Explain why this requirement is being rejected..."
                  rows="4"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className="req-detail__modal-footer">
                <button className="req-detail__modal-cancel" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button className="req-detail__modal-confirm req-detail__modal-confirm--reject" onClick={handleReject} disabled={!rejectReason.trim()}>Reject</button>
              </div>
            </div>
          </div>
        )}

        {/* Deadline Badge */}
        {savedDeadline && (
          <div className="req-detail__deadline-badge">
            <span className="material-symbols-outlined">schedule</span>
            Deadline: {new Date(savedDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default RequirementDetail
