import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import { useProjectData } from '../../context/ProjectDataContext'
import './RequirementDetail.css'

const EXTENDED_REQUIREMENT_DETAILS = {
  'REQ-042': {
    originalDescription:
      'The system needs a way to handle sudden spikes in traffic. It should automatically add more servers when load is high and remove them when load drops to save costs.',
    acceptanceCriteria: [
      'Auto-scaling policy activates within 60 seconds of threshold breach.',
      'Scale-in respects a minimum healthy instance pool of 3 nodes.',
      'Monitoring metrics are sampled every 1 minute.',
      'The service remains available if one scaling action fails.'
    ],
    linkedRequirements: ['REQ-039', 'REQ-038'],
    discussion: [
      {
        id: 'comment-1',
        author: 'Marcus Chen',
        role: 'Lead Architect',
        timestampLabel: '2 hours ago',
        message:
          'Could we add a cooldown period to reduce scale flapping when traffic oscillates around thresholds?'
      }
    ]
  }
}

const DEFAULT_REQUIREMENT_DETAIL = {
  originalDescription: 'No extended description is available for this requirement yet.',
  acceptanceCriteria: [],
  linkedRequirements: [],
  discussion: []
}

const STATUS_STYLE_CONFIG = {
  draft: { className: 'req-detail__status--draft' },
  review: { className: 'req-detail__status--review' },
  approved: { className: 'req-detail__status--approved' },
  rejected: { className: 'req-detail__status--rejected' },
  locked: { className: 'req-detail__status--locked' }
}

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

function RequirementDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    currentUser,
    activeRequirements,
    projectUsers,
    workflowStageMap,
    getRequirementById,
    assignRequirement,
    setRequirementDeadline,
    setRequirementStatus
  } = useProjectData()

  const requirement = getRequirementById(id)
  const detailSnapshot = EXTENDED_REQUIREMENT_DETAILS[id] || DEFAULT_REQUIREMENT_DETAIL

  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState(detailSnapshot.discussion)
  const [criteriaList, setCriteriaList] = useState(detailSnapshot.acceptanceCriteria)
  const [newCriteria, setNewCriteria] = useState('')
  const [showAddCriteria, setShowAddCriteria] = useState(false)
  const [linkedRequirementIds, setLinkedRequirementIds] = useState(detailSnapshot.linkedRequirements)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkSearchQuery, setLinkSearchQuery] = useState('')

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('')
  const [showDeadlineModal, setShowDeadlineModal] = useState(false)
  const [deadlineInput, setDeadlineInput] = useState(requirement?.deadline || '')
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showLockConfirm, setShowLockConfirm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionError, setActionError] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [savedRejectReason, setSavedRejectReason] = useState('')

  const assignee = useMemo(
    () => projectUsers.find((user) => user.id === requirement?.assigneeId) || null,
    [projectUsers, requirement?.assigneeId]
  )

  const availableTeamMembers = useMemo(
    () => projectUsers.filter((user) => user.role === 'member'),
    [projectUsers]
  )

  const availableLinkedRequirements = useMemo(() => {
    return activeRequirements.filter((candidateRequirement) => {
      if (candidateRequirement.id === id) {
        return false
      }

      if (linkedRequirementIds.includes(candidateRequirement.id)) {
        return false
      }

      if (!linkSearchQuery.trim()) {
        return true
      }

      const normalizedQuery = linkSearchQuery.toLowerCase()
      return (
        candidateRequirement.id.toLowerCase().includes(normalizedQuery) ||
        candidateRequirement.title.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [activeRequirements, id, linkedRequirementIds, linkSearchQuery])

  if (!requirement) {
    return (
      <MainLayout user={currentUser} role={currentUser.role}>
        <div className="req-detail">
          <div className="req-detail__card">
            <h2 className="req-detail__title">Requirement Not Found</h2>
            <p className="req-detail__description">
              This requirement may have been archived after a duplicate merge.
            </p>
            <div className="req-detail__header-actions">
              <Button variant="secondary" onClick={() => navigate('/manager/requirements')}>
                Back to Requirements
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  const isManager = currentUser.role === 'manager'
  const isLocked = requirement.status === 'locked'
  const canEditRequirement = !isLocked && ['draft', 'review', 'rejected'].includes(requirement.status)
  const canApproveOrReject = currentUser.role === 'client' && !isLocked && requirement.status === 'review'
  const canAssign = isManager && !isLocked
  const canSetDeadline = isManager && !isLocked

  const statusDisplayName =
    requirement.status === 'locked'
      ? 'Locked'
      : workflowStageMap[requirement.status] || requirement.status

  const statusStyle = STATUS_STYLE_CONFIG[requirement.status] || STATUS_STYLE_CONFIG.draft

  const showFeedback = (message) => {
    setFeedbackMessage(message)
    window.setTimeout(() => setFeedbackMessage(''), 3000)
  }

  const handleBack = () => {
    if (currentUser.role === 'manager') {
      navigate('/manager/requirements')
      return
    }
    navigate('/requirements')
  }

  const handleEdit = () => {
    navigate(`/requirements/${id}/edit`)
  }

  const handleAddComment = () => {
    if (!commentText.trim() || isLocked) {
      return
    }

    const newComment = {
      id: `comment-${Date.now()}`,
      author: currentUser.name,
      role: currentUser.role,
      timestampLabel: 'Just now',
      message: commentText.trim()
    }

    setComments((previousComments) => [...previousComments, newComment])
    setCommentText('')
  }

  const handleAddCriteria = () => {
    if (!newCriteria.trim() || isLocked) {
      return
    }

    setCriteriaList((previousCriteria) => [...previousCriteria, newCriteria.trim()])
    setNewCriteria('')
    setShowAddCriteria(false)
  }

  const handleLinkRequirement = (requirementId) => {
    if (isLocked) {
      return
    }
    setLinkedRequirementIds((previousIds) => [...previousIds, requirementId])
    setShowLinkModal(false)
    setLinkSearchQuery('')
  }

  const openAssignModal = () => {
    setActionError('')
    setSelectedAssigneeId(requirement.assigneeId || availableTeamMembers[0]?.id || '')
    setShowAssignModal(true)
  }

  const handleAssignConfirm = () => {
    const assignmentResult = assignRequirement({
      requirementId: requirement.id,
      memberId: selectedAssigneeId,
      actorName: currentUser.name
    })

    if (!assignmentResult.ok) {
      setActionError(assignmentResult.error || 'Unable to assign requirement.')
      return
    }

    setShowAssignModal(false)
    setActionError('')
    showFeedback(requirement.assigneeId ? 'Requirement reassigned successfully.' : 'Requirement assigned successfully.')
  }

  const openDeadlineModal = () => {
    setActionError('')
    setDeadlineInput(requirement.deadline || '')
    setShowDeadlineModal(true)
  }

  const handleDeadlineConfirm = () => {
    const deadlineResult = setRequirementDeadline({
      requirementId: requirement.id,
      deadline: deadlineInput,
      actorName: currentUser.name
    })

    if (!deadlineResult.ok) {
      setActionError(deadlineResult.error || 'Unable to save deadline.')
      return
    }

    setShowDeadlineModal(false)
    setActionError('')
    showFeedback('Deadline updated.')
  }

  const handleApprove = () => {
    const approveResult = setRequirementStatus({
      requirementId: requirement.id,
      status: 'approved',
      actorName: currentUser.name
    })

    if (!approveResult.ok) {
      setActionError(approveResult.error || 'Unable to approve requirement.')
      return
    }

    setShowApproveConfirm(false)
    setActionError('')
    showFeedback('Requirement approved.')
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setActionError('Rejection reason is required.')
      return
    }

    setSavedRejectReason(rejectReason.trim())

    const rejectResult = setRequirementStatus({
      requirementId: requirement.id,
      status: 'rejected',
      actorName: currentUser.name,
      reason: rejectReason
    })

    if (!rejectResult.ok) {
      setActionError(rejectResult.error || 'Unable to reject requirement.')
      return
    }
    setShowRejectModal(false)
    setRejectReason('')
    setActionError('')
    showFeedback('Requirement rejected.')
  }

  const handleLock = () => {
    const lockResult = setRequirementStatus({
      requirementId: requirement.id,
      status: 'locked',
      actorName: currentUser.name
    })

    if (!lockResult.ok) {
      setActionError(lockResult.error || 'Unable to lock requirement.')
      return
    }

    setShowLockConfirm(false)
    setActionError('')
    showFeedback('Requirement locked. Editing disabled for all roles.')
  }

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
      <div className="req-detail">
        {feedbackMessage && (
          <div className="req-detail__feedback">
            <span className="material-symbols-outlined">check_circle</span>
            <span>{feedbackMessage}</span>
          </div>
        )}

        <div className="req-detail__header">
          <div className="req-detail__header-left">
            <div className="req-detail__header-meta">
              <span className="req-detail__id">{requirement.id}</span>
              <span className={`req-detail__status ${statusStyle.className}`}>
                <span className="req-detail__status-dot"></span>
                {statusDisplayName}
              </span>
            </div>
            <h1 className="req-detail__title">{requirement.title}</h1>
          </div>
          <div className="req-detail__header-actions">
            <Button variant="secondary" icon="arrow_back" iconPosition="left" onClick={handleBack}>
              Back
            </Button>

            {canAssign && (
              <button className="req-detail__assign-btn" onClick={openAssignModal}>
                <span className="material-symbols-outlined">
                  {assignee ? 'sync_alt' : 'person_add'}
                </span>
                {assignee ? 'Reassign' : 'Assign'}
              </button>
            )}

            {canSetDeadline && (
              <button className="req-detail__deadline-btn" onClick={openDeadlineModal}>
                <span className="material-symbols-outlined">calendar_month</span>
                {requirement.deadline ? `Due: ${formatDateForDisplay(requirement.deadline)}` : 'Set Deadline'}
              </button>
            )}

            {canApproveOrReject && (
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

            {isManager && !isLocked && requirement.status === 'approved' && (
              <button className="req-detail__lock-btn" onClick={() => setShowLockConfirm(true)}>
                <span className="material-symbols-outlined">lock</span>
                Lock Requirement
              </button>
            )}

            {canEditRequirement && (
              <Button variant="primary" icon="edit" iconPosition="left" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </div>
        </div>

        <div className="req-detail__grid">
          <div className="req-detail__main">
            <section className="req-detail__card">
              <div className="req-detail__card-header">
                <h3 className="req-detail__card-title">Original Description</h3>
                <span className="material-symbols-outlined req-detail__card-icon">history_edu</span>
              </div>
              <p className="req-detail__description">{detailSnapshot.originalDescription}</p>
            </section>

            {requirement.status === 'rejected' && savedRejectReason && (
              <section className="req-detail__card">
                <div className="req-detail__card-header">
                  <h3 className="req-detail__card-title">Rejection Reason</h3>
                  <span className="material-symbols-outlined req-detail__card-icon">cancel</span>
                </div>
                <p className="req-detail__description">{savedRejectReason}</p>
              </section>
            )}


            <section className="req-detail__card">
              <div className="req-detail__card-header">
                <h3 className="req-detail__card-title">Acceptance Criteria</h3>
                {!isLocked && (
                  <button className="req-detail__add-criteria-btn" onClick={() => setShowAddCriteria(true)}>
                    <span className="material-symbols-outlined">add</span>
                    Add Criteria
                  </button>
                )}
              </div>

              <ul className="req-detail__criteria-list">
                {criteriaList.map((criteria, index) => (
                  <li key={`${criteria}-${index}`} className="req-detail__criteria-item">
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
                    onChange={(event) => setNewCriteria(event.target.value)}
                  />
                  <div className="req-detail__criteria-form-actions">
                    <button
                      className="req-detail__criteria-cancel"
                      onClick={() => {
                        setShowAddCriteria(false)
                        setNewCriteria('')
                      }}
                    >
                      Cancel
                    </button>
                    <button className="req-detail__criteria-save" onClick={handleAddCriteria}>
                      Add
                    </button>
                  </div>
                </div>
              )}
            </section>

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
                        <span className="req-detail__comment-time">{comment.timestampLabel}</span>
                      </div>
                      <p className="req-detail__comment-text">{comment.message}</p>
                    </div>
                  </div>
                ))}

                <div className="req-detail__reply">
                  <div className="req-detail__reply-avatar">
                    {currentUser.name.split(' ').map((name) => name[0]).join('')}
                  </div>
                  <div className="req-detail__reply-input-wrapper">
                    <textarea
                      className="req-detail__reply-input"
                      placeholder={isLocked ? 'Requirement is locked. Discussion is read-only.' : 'Add a comment or request clarification...'}
                      rows="3"
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      disabled={isLocked}
                    />
                    <div className="req-detail__reply-actions">
                      <button
                        className="req-detail__reply-btn"
                        onClick={handleAddComment}
                        disabled={isLocked || !commentText.trim()}
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="req-detail__sidebar">
            <section className="req-detail__sidebar-card">
              <h3 className="req-detail__sidebar-title">Assignment</h3>
              <p className="req-detail__assignment-text">
                Current Assignee:{' '}
                <strong>{assignee ? assignee.name : 'Unassigned'}</strong>
              </p>
              <p className="req-detail__assignment-text">
                Deadline: <strong>{formatDateForDisplay(requirement.deadline)}</strong>
              </p>
            </section>

            <section className="req-detail__sidebar-card">
              <h3 className="req-detail__sidebar-title">Linked Requirements</h3>
              <div className="req-detail__links">
                {linkedRequirementIds.map((linkedRequirementId) => (
                  <button
                    key={linkedRequirementId}
                    className="req-detail__link-tag"
                    onClick={() => navigate(`/requirements/${linkedRequirementId}`)}
                  >
                    <span className="material-symbols-outlined">link</span>
                    {linkedRequirementId}
                  </button>
                ))}
                {linkedRequirementIds.length === 0 && (
                  <span className="req-detail__empty-text">No linked requirements</span>
                )}
                {!isLocked && (
                  <button className="req-detail__link-add" onClick={() => setShowLinkModal(true)}>
                    + Link
                  </button>
                )}
              </div>
            </section>

            <section className="req-detail__sidebar-card req-detail__sidebar-card--white">
              <h3 className="req-detail__sidebar-title">Requirement History</h3>
              <div className="req-detail__timeline">
                {requirement.history.slice(-5).reverse().map((historyItem) => (
                  <div key={historyItem.id} className="req-detail__timeline-item">
                    <div className="req-detail__timeline-icon req-detail__timeline-icon--created">
                      <span className="material-symbols-outlined">history</span>
                    </div>
                    <div className="req-detail__timeline-content">
                      <p className="req-detail__timeline-title">{historyItem.description}</p>
                      <p className="req-detail__timeline-meta">
                        {formatDateForDisplay(historyItem.timestamp)} • by {historyItem.actorName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        {showAssignModal && (
          <div className="req-detail__modal-overlay" onClick={() => setShowAssignModal(false)}>
            <div className="req-detail__modal req-detail__modal--sm" onClick={(event) => event.stopPropagation()}>
              <div className="req-detail__modal-header">
                <h3>{assignee ? 'Reassign Requirement' : 'Assign Requirement'}</h3>
                <button className="req-detail__modal-close" onClick={() => setShowAssignModal(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="req-detail__modal-body">
                <label className="req-detail__modal-label">Select Team Member</label>
                <select
                  className="req-detail__assignment-select"
                  value={selectedAssigneeId}
                  onChange={(event) => setSelectedAssigneeId(event.target.value)}
                >
                  <option value="">Choose a team member...</option>
                  {availableTeamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <p className="req-detail__modal-helper">
                  Only users with the Team Member role are available for assignment.
                </p>
                {actionError && <p className="req-detail__modal-error">{actionError}</p>}
              </div>
              <div className="req-detail__modal-footer">
                <button className="req-detail__modal-cancel" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button
                  className="req-detail__modal-confirm"
                  onClick={handleAssignConfirm}
                  disabled={!selectedAssigneeId}
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeadlineModal && (
          <div className="req-detail__modal-overlay" onClick={() => setShowDeadlineModal(false)}>
            <div className="req-detail__modal req-detail__modal--sm" onClick={(event) => event.stopPropagation()}>
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
                  value={deadlineInput}
                  onChange={(event) => setDeadlineInput(event.target.value)}
                />
                {actionError && <p className="req-detail__modal-error">{actionError}</p>}
              </div>
              <div className="req-detail__modal-footer">
                <button className="req-detail__modal-cancel" onClick={() => setShowDeadlineModal(false)}>Cancel</button>
                <button className="req-detail__modal-confirm" onClick={handleDeadlineConfirm} disabled={!deadlineInput}>
                  Confirm Deadline
                </button>
              </div>
            </div>
          </div>
        )}

        {showApproveConfirm && (
          <div className="req-detail__modal-overlay" onClick={() => setShowApproveConfirm(false)}>
            <div className="req-detail__modal req-detail__modal--sm" onClick={(event) => event.stopPropagation()}>
              <div className="req-detail__modal-header">
                <h3>Approve Requirement</h3>
                <button className="req-detail__modal-close" onClick={() => setShowApproveConfirm(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="req-detail__modal-body">
                <p className="req-detail__modal-text">
                  Confirm approving <strong>{requirement.id}</strong>.
                </p>
                {actionError && <p className="req-detail__modal-error">{actionError}</p>}
              </div>
              <div className="req-detail__modal-footer">
                <button className="req-detail__modal-cancel" onClick={() => setShowApproveConfirm(false)}>Cancel</button>
                <button className="req-detail__modal-confirm" onClick={handleApprove}>Confirm Approval</button>
              </div>
            </div>
          </div>
        )}

        {showRejectModal && (
          <div className="req-detail__modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="req-detail__modal req-detail__modal--sm" onClick={(event) => event.stopPropagation()}>
              <div className="req-detail__modal-header">
                <h3>Reject Requirement</h3>
                <button className="req-detail__modal-close" onClick={() => setShowRejectModal(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="req-detail__modal-body">
                <label className="req-detail__modal-label">Rejection reason</label>
                <textarea
                  className="req-detail__modal-textarea"
                  rows="4"
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Explain why this requirement is rejected..."
                />
                {actionError && <p className="req-detail__modal-error">{actionError}</p>}
              </div>
              <div className="req-detail__modal-footer">
                <button className="req-detail__modal-cancel" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button className="req-detail__modal-confirm req-detail__modal-confirm--reject" onClick={handleReject}>
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {showLockConfirm && (
          <div className="req-detail__modal-overlay" onClick={() => setShowLockConfirm(false)}>
            <div className="req-detail__modal req-detail__modal--sm" onClick={(event) => event.stopPropagation()}>
              <div className="req-detail__modal-header">
                <h3>Lock Requirement</h3>
                <button className="req-detail__modal-close" onClick={() => setShowLockConfirm(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="req-detail__modal-body">
                <p className="req-detail__modal-text">
                  Confirm locking <strong>{requirement.id}</strong>. Editing will be disabled for all roles.
                </p>
                {actionError && <p className="req-detail__modal-error">{actionError}</p>}
              </div>
              <div className="req-detail__modal-footer">
                <button className="req-detail__modal-cancel" onClick={() => setShowLockConfirm(false)}>Cancel</button>
                <button className="req-detail__modal-confirm req-detail__modal-confirm--lock" onClick={handleLock}>
                  Confirm Lock
                </button>
              </div>
            </div>
          </div>
        )}

        {showLinkModal && (
          <div className="req-detail__modal-overlay" onClick={() => setShowLinkModal(false)}>
            <div className="req-detail__modal" onClick={(event) => event.stopPropagation()}>
              <div className="req-detail__modal-header">
                <h3>Link Requirement</h3>
                <button className="req-detail__modal-close" onClick={() => setShowLinkModal(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <input
                type="text"
                className="req-detail__modal-search"
                placeholder="Search requirements..."
                value={linkSearchQuery}
                onChange={(event) => setLinkSearchQuery(event.target.value)}
              />
              <div className="req-detail__modal-list">
                {availableLinkedRequirements.map((candidateRequirement) => (
                  <button
                    key={candidateRequirement.id}
                    className="req-detail__modal-item"
                    onClick={() => handleLinkRequirement(candidateRequirement.id)}
                  >
                    <span className="req-detail__modal-item-id">{candidateRequirement.id}</span>
                    <span className="req-detail__modal-item-title">{candidateRequirement.title}</span>
                  </button>
                ))}
                {availableLinkedRequirements.length === 0 && (
                  <p className="req-detail__modal-empty">No requirements available to link.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default RequirementDetail
