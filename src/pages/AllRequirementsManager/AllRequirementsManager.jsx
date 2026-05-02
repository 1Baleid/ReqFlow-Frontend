import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import { useProjectData } from '../../context/ProjectDataContext'
import {
  listRequirements as listRequirementsApi,
  markRequirementsAsDuplicates as markRequirementsAsDuplicatesApi,
  mergeDuplicateRequirements as mergeDuplicateRequirementsApi,
  setRequirementDeadline as setRequirementDeadlineApi,
  setRequirementStatus as setRequirementStatusApi
} from '../../services/requirementsApi'
import './AllRequirementsManager.css'

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

function AllRequirementsManager() {
  const navigate = useNavigate()
  const {
    currentUser,
    currentProject,
    activeRequirements,
    projectUsers,
    workflowStageMap,
    overdueRequirements,
    markRequirementsAsDuplicates,
    mergeDuplicateRequirements,
    setRequirementDeadline,
    setRequirementStatus
  } = useProjectData()

  const [selectedIds, setSelectedIds] = useState([])
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false)
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [showDeadlineModal, setShowDeadlineModal] = useState(false)
  const [showLockConfirm, setShowLockConfirm] = useState(false)
  const [deadlineRequirementId, setDeadlineRequirementId] = useState('')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [lockRequirementId, setLockRequirementId] = useState('')
  const [selectedDuplicateGroupId, setSelectedDuplicateGroupId] = useState('')
  const [primaryRequirementId, setPrimaryRequirementId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [apiRequirements, setApiRequirements] = useState(null)

  const refreshBackendRequirements = async () => {
    const result = await listRequirementsApi({
      projectId: currentProject?.id || 'proj-1'
    })
    setApiRequirements(result.requirements)
  }

  useEffect(() => {
    let isMounted = true

    async function loadRequirements() {
      try {
        const result = await listRequirementsApi({
          projectId: currentProject?.id || 'proj-1'
        })

        if (isMounted) {
          setApiRequirements(result.requirements)
        }
      } catch (error) {
        if (isMounted && !(error instanceof TypeError)) {
          setErrorMessage(error.message || 'Unable to load backend requirements.')
        }
      }
    }

    loadRequirements()

    return () => {
      isMounted = false
    }
  }, [currentProject?.id])

  const requirementsSource = apiRequirements || activeRequirements

  const assigneeById = useMemo(
    () =>
      projectUsers.reduce((accumulator, user) => {
        accumulator[user.id] = user
        return accumulator
      }, {}),
    [projectUsers]
  )

  const duplicateGroups = useMemo(() => {
    return requirementsSource.reduce((accumulator, requirement) => {
      if (!requirement.duplicateGroupId) {
        return accumulator
      }

      if (!accumulator[requirement.duplicateGroupId]) {
        accumulator[requirement.duplicateGroupId] = []
      }
      accumulator[requirement.duplicateGroupId].push(requirement)
      return accumulator
    }, {})
  }, [requirementsSource])

  const duplicateGroupOptions = useMemo(
    () => Object.keys(duplicateGroups),
    [duplicateGroups]
  )

  const selectedMergeGroupRequirements = useMemo(
    () => duplicateGroups[selectedDuplicateGroupId] || [],
    [duplicateGroups, selectedDuplicateGroupId]
  )

  const selectedRequirements = useMemo(
    () => requirementsSource.filter((requirement) => selectedIds.includes(requirement.id)),
    [requirementsSource, selectedIds]
  )

  const overdueRequirementIdSet = useMemo(
    () => {
      if (!apiRequirements) {
        return new Set(overdueRequirements.map((requirement) => requirement.id))
      }

      const today = new Date().toISOString().split('T')[0]
      return new Set(
        requirementsSource
          .filter((requirement) =>
            requirement.deadline &&
            !['approved', 'locked'].includes(requirement.status) &&
            requirement.deadline < today
          )
          .map((requirement) => requirement.id)
      )
    },
    [apiRequirements, overdueRequirements, requirementsSource]
  )

  const openRequirement = (requirementId) => {
    navigate(`/requirements/${requirementId}`)
  }

  const toggleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(requirementsSource.map((requirement) => requirement.id))
      return
    }
    setSelectedIds([])
  }

  const toggleSelectRequirement = (requirementId) => {
    setSelectedIds((previousSelection) => {
      if (previousSelection.includes(requirementId)) {
        return previousSelection.filter((selectedRequirementId) => selectedRequirementId !== requirementId)
      }
      return [...previousSelection, requirementId]
    })
  }

  const openDuplicateConfirmation = () => {
    if (selectedIds.length < 2) {
      setErrorMessage('Select at least two requirements before marking duplicates.')
      return
    }
    setErrorMessage('')
    setShowDuplicateConfirm(true)
  }

  const confirmMarkDuplicate = async () => {
    if (apiRequirements) {
      try {
        const result = await markRequirementsAsDuplicatesApi({
          requirementIds: selectedIds,
          actor: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role
          }
        })
        await refreshBackendRequirements()
        setShowDuplicateConfirm(false)
        setSelectedIds([])
        setErrorMessage('')
        setFeedbackMessage(`Selected requirements marked as duplicates (${result.duplicateGroupId}).`)
        window.setTimeout(() => setFeedbackMessage(''), 3000)
      } catch (error) {
        setErrorMessage(error.message || 'Unable to mark duplicates.')
      }
      return
    }

    const markResult = markRequirementsAsDuplicates({
      requirementIds: selectedIds,
      actorName: currentUser.name
    })

    if (!markResult.ok) {
      setErrorMessage(markResult.error || 'Unable to mark duplicates.')
      return
    }

    setShowDuplicateConfirm(false)
    setSelectedIds([])
    setErrorMessage('')
    setFeedbackMessage('Selected requirements marked as duplicates.')
    window.setTimeout(() => setFeedbackMessage(''), 3000)
  }

  const openMergeDuplicatesModal = () => {
    if (duplicateGroupOptions.length === 0) {
      setErrorMessage('No duplicate requirements are currently marked for merge.')
      return
    }

    const firstDuplicateGroupId = duplicateGroupOptions[0]
    setSelectedDuplicateGroupId(firstDuplicateGroupId)
    setPrimaryRequirementId(duplicateGroups[firstDuplicateGroupId][0].id)
    setErrorMessage('')
    setShowMergeModal(true)
  }

  const handleDuplicateGroupChange = (groupId) => {
    setSelectedDuplicateGroupId(groupId)
    const groupRequirements = duplicateGroups[groupId] || []
    setPrimaryRequirementId(groupRequirements[0]?.id || '')
  }

  const confirmMergeDuplicates = async () => {
    if (apiRequirements) {
      try {
        await mergeDuplicateRequirementsApi({
          duplicateGroupId: selectedDuplicateGroupId,
          primaryRequirementId,
          actor: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role
          }
        })
        await refreshBackendRequirements()
        setShowMergeModal(false)
        setSelectedDuplicateGroupId('')
        setPrimaryRequirementId('')
        setSelectedIds([])
        setErrorMessage('')
        setFeedbackMessage('Duplicate requirements merged and archived successfully.')
        window.setTimeout(() => setFeedbackMessage(''), 3000)
      } catch (error) {
        setErrorMessage(error.message || 'Unable to merge duplicates.')
      }
      return
    }

    const mergeResult = mergeDuplicateRequirements({
      duplicateGroupId: selectedDuplicateGroupId,
      primaryRequirementId,
      actorName: currentUser.name
    })

    if (!mergeResult.ok) {
      setErrorMessage(mergeResult.error || 'Unable to merge duplicates.')
      return
    }

    setShowMergeModal(false)
    setSelectedDuplicateGroupId('')
    setPrimaryRequirementId('')
    setErrorMessage('')
    setFeedbackMessage('Duplicate requirements merged and archived successfully.')
    window.setTimeout(() => setFeedbackMessage(''), 3000)
  }

  const openDeadlineModal = (requirementId) => {
    const selectedRequirement = requirementsSource.find(
      (requirement) => requirement.id === requirementId
    )
    if (!selectedRequirement) {
      return
    }

    setDeadlineRequirementId(requirementId)
    setDeadlineDate(selectedRequirement.deadline || '')
    setErrorMessage('')
    setShowDeadlineModal(true)
  }

  const confirmSetDeadline = async () => {
    if (apiRequirements) {
      try {
        await setRequirementDeadlineApi(deadlineRequirementId, {
          deadline: deadlineDate,
          actor: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role
          }
        })
        await refreshBackendRequirements()
        setShowDeadlineModal(false)
        setDeadlineRequirementId('')
        setDeadlineDate('')
        setErrorMessage('')
        setFeedbackMessage('Requirement deadline updated.')
        window.setTimeout(() => setFeedbackMessage(''), 3000)
      } catch (error) {
        setErrorMessage(error.message || 'Unable to save deadline.')
      }
      return
    }

    const setResult = setRequirementDeadline({
      requirementId: deadlineRequirementId,
      deadline: deadlineDate,
      actorName: currentUser.name
    })

    if (!setResult.ok) {
      setErrorMessage(setResult.error || 'Unable to save deadline.')
      return
    }

    setShowDeadlineModal(false)
    setDeadlineRequirementId('')
    setDeadlineDate('')
    setErrorMessage('')
    setFeedbackMessage('Requirement deadline updated.')
    window.setTimeout(() => setFeedbackMessage(''), 3000)
  }

  const openLockConfirmation = (requirementId) => {
    setLockRequirementId(requirementId)
    setErrorMessage('')
    setShowLockConfirm(true)
  }

  const confirmLockRequirement = async () => {
    if (apiRequirements) {
      try {
        await setRequirementStatusApi(lockRequirementId, {
          status: 'locked',
          actor: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role
          }
        })
        await refreshBackendRequirements()
        setShowLockConfirm(false)
        setLockRequirementId('')
        setErrorMessage('')
        setFeedbackMessage('Approved requirement locked successfully.')
        window.setTimeout(() => setFeedbackMessage(''), 3000)
      } catch (error) {
        setErrorMessage(error.message || 'Unable to lock requirement.')
      }
      return
    }

    const lockResult = setRequirementStatus({
      requirementId: lockRequirementId,
      status: 'locked',
      actorName: currentUser.name
    })

    if (!lockResult.ok) {
      setErrorMessage(lockResult.error || 'Unable to lock requirement.')
      return
    }

    setShowLockConfirm(false)
    setLockRequirementId('')
    setErrorMessage('')
    setFeedbackMessage('Approved requirement locked successfully.')
    window.setTimeout(() => setFeedbackMessage(''), 3000)
  }

  const getStatusBadge = (status) => {
    const statusClassMap = {
      draft: 'all-reqs__status--draft',
      review: 'all-reqs__status--review',
      approved: 'all-reqs__status--approved',
      rejected: 'all-reqs__status--rejected',
      locked: 'all-reqs__status--locked'
    }

    return (
      <span className={`all-reqs__status ${statusClassMap[status] || statusClassMap.draft}`}>
        {status === 'locked' && (
          <span className="material-symbols-outlined">lock</span>
        )}
        {status === 'locked' ? 'Locked' : workflowStageMap[status] || status}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const normalizedPriority = priority || 'medium'
    return (
      <span className={`all-reqs__priority all-reqs__priority--${normalizedPriority}`}>
        {normalizedPriority}
      </span>
    )
  }

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
      <div className="all-reqs">
        <div className="all-reqs__header">
          <div className="all-reqs__header-content">
            <span className="all-reqs__label">Management Console</span>
            <h1 className="all-reqs__title">All Requirements</h1>
          </div>
          <div className="all-reqs__header-actions">
            <Button variant="secondary" icon="merge_type" onClick={openMergeDuplicatesModal}>
              Merge Duplicates
            </Button>
            <Button variant="primary" icon="add" onClick={() => navigate('/requirements/new')}>
              New Requirement
            </Button>
          </div>
        </div>

        {feedbackMessage && (
          <div className="all-reqs__feedback">
            <span className="material-symbols-outlined">check_circle</span>
            <span>{feedbackMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="all-reqs__error">
            <span className="material-symbols-outlined">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="all-reqs__table-container">
          <table className="all-reqs__table">
            <thead>
              <tr>
                <th className="all-reqs__th all-reqs__th--checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === requirementsSource.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="all-reqs__th">ID</th>
                <th className="all-reqs__th">Title</th>
                <th className="all-reqs__th">Status</th>
                <th className="all-reqs__th">Assignee</th>
                <th className="all-reqs__th">Priority</th>
                <th className="all-reqs__th">Deadline</th>
                <th className="all-reqs__th all-reqs__th--actions"></th>
              </tr>
            </thead>
            <tbody>
              {requirementsSource.map((requirement) => {
                const assignee = requirement.assigneeId
                  ? assigneeById[requirement.assigneeId]
                  : null

                return (
                  <tr
                    key={requirement.id}
                    className={`all-reqs__row ${selectedIds.includes(requirement.id) ? 'all-reqs__row--selected' : ''}`}
                  >
                    <td className="all-reqs__td all-reqs__td--checkbox">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(requirement.id)}
                        onChange={() => toggleSelectRequirement(requirement.id)}
                      />
                    </td>
                    <td className="all-reqs__td" onClick={() => openRequirement(requirement.id)}>
                      <div className="all-reqs__id-cell">
                        <span className="all-reqs__id">{requirement.id}</span>
                        {requirement.duplicateGroupId && (
                          <span
                            className="material-symbols-outlined all-reqs__duplicate-icon"
                            title="Duplicate marked"
                          >
                            content_copy
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="all-reqs__td all-reqs__td--title" onClick={() => openRequirement(requirement.id)}>
                      <p className="all-reqs__req-title">{requirement.title}</p>
                      <span className="all-reqs__version">Version {requirement.version}</span>
                    </td>
                    <td className="all-reqs__td">{getStatusBadge(requirement.status)}</td>
                    <td className="all-reqs__td">
                      {assignee ? (
                        <div className="all-reqs__assignee">
                          <div className="all-reqs__assignee-avatar">
                            {assignee.name.split(' ').map((name) => name[0]).join('')}
                          </div>
                          <span className="all-reqs__assignee-name">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="all-reqs__unassigned">Unassigned</span>
                      )}
                    </td>
                    <td className="all-reqs__td">{getPriorityBadge(requirement.priority)}</td>
                    <td className="all-reqs__td">
                      <span
                        className={`all-reqs__deadline ${overdueRequirementIdSet.has(requirement.id) ? 'all-reqs__deadline--overdue' : ''}`}
                      >
                        {formatDateForDisplay(requirement.deadline)}
                      </span>
                    </td>
                    <td className="all-reqs__td all-reqs__td--actions">
                      <div className="all-reqs__action-group">
                        <button
                          className="all-reqs__action-btn"
                          title="Set Deadline"
                          onClick={() => openDeadlineModal(requirement.id)}
                        >
                          <span className="material-symbols-outlined">calendar_month</span>
                        </button>
                        {requirement.status === 'approved' && (
                          <button
                            className="all-reqs__action-btn all-reqs__action-btn--lock"
                            title="Lock Requirement"
                            onClick={() => openLockConfirmation(requirement.id)}
                          >
                            <span className="material-symbols-outlined">lock</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {selectedIds.length > 0 && (
          <div className="all-reqs__bulk-bar">
            <div className="all-reqs__bulk-content">
              <div className="all-reqs__bulk-info">
                <span className="all-reqs__bulk-count">{selectedIds.length} Selected</span>
                <div className="all-reqs__bulk-divider" />
                <p className="all-reqs__bulk-text">Apply actions to selected requirements</p>
              </div>
              <div className="all-reqs__bulk-actions">
                <button className="all-reqs__bulk-action all-reqs__bulk-action--warning" onClick={openDuplicateConfirmation}>
                  <span className="material-symbols-outlined">content_copy</span>
                  Mark as Duplicate
                </button>
              </div>
            </div>
          </div>
        )}

        {showDuplicateConfirm && (
          <div className="all-reqs__modal-overlay" onClick={() => setShowDuplicateConfirm(false)}>
            <div className="all-reqs__modal" onClick={(event) => event.stopPropagation()}>
              <div className="all-reqs__modal-header">
                <h3>Mark as Duplicates</h3>
                <button className="all-reqs__modal-close" onClick={() => setShowDuplicateConfirm(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="all-reqs__modal-body">
                <p>Confirm marking these requirements as duplicates:</p>
                <div className="all-reqs__modal-reqlist">
                  {selectedRequirements.map((requirement) => (
                    <div key={requirement.id} className="all-reqs__modal-reqitem">
                      <span className="all-reqs__modal-reqid">{requirement.id}</span>
                      {requirement.title}
                    </div>
                  ))}
                </div>
              </div>
              <div className="all-reqs__modal-footer">
                <button className="all-reqs__modal-cancel" onClick={() => setShowDuplicateConfirm(false)}>Cancel</button>
                <button className="all-reqs__modal-confirm" onClick={confirmMarkDuplicate}>Confirm</button>
              </div>
            </div>
          </div>
        )}

        {showMergeModal && (
          <div className="all-reqs__modal-overlay" onClick={() => setShowMergeModal(false)}>
            <div className="all-reqs__modal" onClick={(event) => event.stopPropagation()}>
              <div className="all-reqs__modal-header">
                <h3>Merge Duplicate Requirements</h3>
                <button className="all-reqs__modal-close" onClick={() => setShowMergeModal(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="all-reqs__modal-body">
                <label className="all-reqs__modal-label">Duplicate Group</label>
                <select
                  className="all-reqs__date-input"
                  value={selectedDuplicateGroupId}
                  onChange={(event) => handleDuplicateGroupChange(event.target.value)}
                >
                  {duplicateGroupOptions.map((groupId) => (
                    <option key={groupId} value={groupId}>
                      {groupId} ({duplicateGroups[groupId].length} requirements)
                    </option>
                  ))}
                </select>

                <p>Select the primary requirement to keep. Other duplicates will be archived.</p>
                <div className="all-reqs__modal-reqlist">
                  {selectedMergeGroupRequirements.map((requirement) => (
                    <label
                      key={requirement.id}
                      className={`all-reqs__modal-radio ${primaryRequirementId === requirement.id ? 'all-reqs__modal-radio--active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="primary-requirement"
                        value={requirement.id}
                        checked={primaryRequirementId === requirement.id}
                        onChange={() => setPrimaryRequirementId(requirement.id)}
                      />
                      <span className="all-reqs__modal-reqid">{requirement.id}</span>
                      <span>{requirement.title}</span>
                      <small className="all-reqs__modal-desc">{requirement.description}</small>
                    </label>
                  ))}
                </div>
              </div>
              <div className="all-reqs__modal-footer">
                <button className="all-reqs__modal-cancel" onClick={() => setShowMergeModal(false)}>Cancel</button>
                <button
                  className="all-reqs__modal-confirm all-reqs__modal-confirm--merge"
                  onClick={confirmMergeDuplicates}
                  disabled={!primaryRequirementId}
                >
                  Confirm Merge
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeadlineModal && (
          <div className="all-reqs__modal-overlay" onClick={() => setShowDeadlineModal(false)}>
            <div className="all-reqs__modal all-reqs__modal--sm" onClick={(event) => event.stopPropagation()}>
              <div className="all-reqs__modal-header">
                <h3>Set Deadline for {deadlineRequirementId}</h3>
                <button className="all-reqs__modal-close" onClick={() => setShowDeadlineModal(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="all-reqs__modal-body">
                <label className="all-reqs__modal-label">Select deadline date</label>
                <input
                  type="date"
                  className="all-reqs__date-input"
                  value={deadlineDate}
                  onChange={(event) => setDeadlineDate(event.target.value)}
                />
              </div>
              <div className="all-reqs__modal-footer">
                <button className="all-reqs__modal-cancel" onClick={() => setShowDeadlineModal(false)}>Cancel</button>
                <button className="all-reqs__modal-confirm" onClick={confirmSetDeadline} disabled={!deadlineDate}>
                  Confirm Deadline
                </button>
              </div>
            </div>
          </div>
        )}

        {showLockConfirm && (
          <div className="all-reqs__modal-overlay" onClick={() => setShowLockConfirm(false)}>
            <div className="all-reqs__modal all-reqs__modal--sm" onClick={(event) => event.stopPropagation()}>
              <div className="all-reqs__modal-header">
                <h3>Lock Approved Requirement</h3>
                <button className="all-reqs__modal-close" onClick={() => setShowLockConfirm(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="all-reqs__modal-body">
                <p>Confirm locking <strong>{lockRequirementId}</strong>. Editing will be disabled for all roles.</p>
              </div>
              <div className="all-reqs__modal-footer">
                <button className="all-reqs__modal-cancel" onClick={() => setShowLockConfirm(false)}>Cancel</button>
                <button className="all-reqs__modal-confirm" onClick={confirmLockRequirement}>Confirm Lock</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default AllRequirementsManager
