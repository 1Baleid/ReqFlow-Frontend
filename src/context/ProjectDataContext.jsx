import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  getCurrentProject,
  getCurrentUser,
  requirements as seededRequirements,
  teamMembers as seededUsers
} from '../data/mockData'

const PROJECT_DATA_STORAGE_KEY = 'reqflow-project-data-v1'
const OVERDUE_NOTIFICATION_CHECK_INTERVAL = 30 * 1000

const REQUIRED_WORKFLOW_STAGE_IDS = ['draft', 'approved']
const WORKFLOW_STAGE_DEFAULTS = [
  { id: 'draft', label: 'Draft', description: 'Initial authoring phase' },
  { id: 'review', label: 'Review', description: 'Under manager review' },
  { id: 'approved', label: 'Approved', description: 'Accepted and ready for lock' },
  { id: 'rejected', label: 'Rejected', description: 'Returned for correction' }
]

const ALLOWED_ASSIGNMENT_ROLES = ['member']
const ALLOWED_MANAGEABLE_ROLES = ['manager', 'member']
const ALLOWED_INVITE_ROLES = ['member', 'manager']
const ALLOWED_REQUIREMENT_STATUSES = ['draft', 'review', 'approved', 'rejected', 'locked']

const ProjectDataContext = createContext(null)

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toNormalizedStatus(status) {
  if (status === 'under-review') {
    return 'review'
  }
  return status
}

function toDateOnlyString(value) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString().split('T')[0]
}

function isRequirementOverdue(requirement) {
  if (!requirement.deadline || requirement.isArchived) {
    return false
  }

  if (requirement.status === 'approved' || requirement.status === 'locked') {
    return false
  }

  const today = new Date().toISOString().split('T')[0]
  return requirement.deadline < today
}

function createActivityEntry({ type, action, actorName }) {
  return {
    id: createId('activity'),
    type,
    action,
    actorName,
    timestamp: new Date().toISOString()
  }
}

function createRequirementHistoryEntry({ type, description, actorName }) {
  return {
    id: createId('history'),
    type,
    description,
    actorName,
    timestamp: new Date().toISOString()
  }
}

function getInitialStoreState() {
  const now = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return {
    workflowStages: WORKFLOW_STAGE_DEFAULTS,
    projectUsers: seededUsers.map((user) => ({
      ...user,
      managedProjectIds: ['proj-1']
    })),
    requirements: seededRequirements.map((requirement, index) => {
      const normalizedStatus = toNormalizedStatus(requirement.status)
      const initialDeadline =
        index === 0
          ? yesterday
          : index === 3
            ? now
            : null

      return {
        ...requirement,
        projectId: 'proj-1',
        status: normalizedStatus,
        assigneeId: requirement.assignee?.id ?? null,
        duplicateGroupId: null,
        isArchived: false,
        archivedAt: null,
        mergedFromIds: [],
        deadline: initialDeadline,
        history: [
          createRequirementHistoryEntry({
            type: 'created',
            description: `Requirement ${requirement.id} initialized in the project`,
            actorName: requirement.createdBy?.name || 'System'
          })
        ]
      }
    }),
    notifications: [],
    activityLogs: [
      createActivityEntry({
        type: 'system',
        action: 'Project workspace initialized',
        actorName: 'System'
      })
    ]
  }
}

function normalizeLoadedStore(store) {
  if (!store || typeof store !== 'object') {
    return getInitialStoreState()
  }

  const fallback = getInitialStoreState()
  const loadedStages = Array.isArray(store.workflowStages) ? store.workflowStages : fallback.workflowStages
  const loadedUsers = Array.isArray(store.projectUsers) ? store.projectUsers : fallback.projectUsers
  const loadedRequirements = Array.isArray(store.requirements) ? store.requirements : fallback.requirements
  const loadedNotifications = Array.isArray(store.notifications) ? store.notifications : []
  const loadedLogs = Array.isArray(store.activityLogs) ? store.activityLogs : fallback.activityLogs

  const normalizedRequirements = loadedRequirements.map((requirement) => ({
    ...requirement,
    projectId: requirement.projectId || 'proj-1',
    status: toNormalizedStatus(requirement.status || 'draft'),
    assigneeId: requirement.assigneeId ?? requirement.assignee?.id ?? null,
    duplicateGroupId: requirement.duplicateGroupId || null,
    isArchived: Boolean(requirement.isArchived),
    archivedAt: requirement.archivedAt || null,
    mergedFromIds: Array.isArray(requirement.mergedFromIds) ? requirement.mergedFromIds : [],
    deadline: toDateOnlyString(requirement.deadline),
    history: Array.isArray(requirement.history) ? requirement.history : []
  }))

  return {
    workflowStages: loadedStages,
    projectUsers: loadedUsers,
    requirements: normalizedRequirements,
    notifications: loadedNotifications,
    activityLogs: loadedLogs
  }
}

function loadStoreState() {
  try {
    const stored = localStorage.getItem(PROJECT_DATA_STORAGE_KEY)
    if (!stored) {
      return getInitialStoreState()
    }

    const parsed = JSON.parse(stored)
    return normalizeLoadedStore(parsed)
  } catch {
    return getInitialStoreState()
  }
}

function persistStoreState(storeState) {
  localStorage.setItem(PROJECT_DATA_STORAGE_KEY, JSON.stringify(storeState))
}

export function ProjectDataProvider({ children }) {
  const [storeState, setStoreState] = useState(() => loadStoreState())
  const [currentUser, setCurrentUser] = useState(getCurrentUser)

  useEffect(() => {
    function handleUserChanged() {
      setCurrentUser(getCurrentUser())
    }
    window.addEventListener('userChanged', handleUserChanged)
    return () => window.removeEventListener('userChanged', handleUserChanged)
  }, [])

  const updateStoreState = useCallback((updater) => {
    setStoreState((previousState) => {
      const nextState = typeof updater === 'function' ? updater(previousState) : updater
      persistStoreState(nextState)
      return nextState
    })
  }, [])

  const appendActivityLog = useCallback(
    (entry) => {
      updateStoreState((previousState) => ({
        ...previousState,
        activityLogs: [entry, ...previousState.activityLogs]
      }))
    },
    [updateStoreState]
  )

  const setWorkflowStages = useCallback(
    (nextStages, actorName) => {
      const isValidPayload = Array.isArray(nextStages) && nextStages.length > 0
      if (!isValidPayload) {
        return { ok: false, error: 'Workflow stages payload is invalid.' }
      }

      const hasRequiredStages = REQUIRED_WORKFLOW_STAGE_IDS.every((requiredStageId) =>
        nextStages.some((stage) => stage.id === requiredStageId)
      )
      if (!hasRequiredStages) {
        return { ok: false, error: "Draft and Approved stages must remain available." }
      }

      const hasInvalidLabels = nextStages.some((stage) => !stage.label || !stage.label.trim())
      if (hasInvalidLabels) {
        return { ok: false, error: 'Each workflow stage needs a non-empty visibility label.' }
      }

      updateStoreState((previousState) => ({
        ...previousState,
        workflowStages: nextStages.map((stage) => ({
          ...stage,
          label: stage.label.trim()
        })),
        activityLogs: [
          createActivityEntry({
            type: 'workflow',
            action: 'Workflow stages configuration saved',
            actorName
          }),
          ...previousState.activityLogs
        ]
      }))

      return { ok: true }
    },
    [updateStoreState]
  )

  const updateProjectUserRole = useCallback(
    ({ userId, role, actorName }) => {
      let result = { ok: false, error: 'Unable to update role.' }

      updateStoreState((previousState) => {
        const targetUser = previousState.projectUsers.find((user) => user.id === userId)
        if (!targetUser) {
          result = { ok: false, error: 'Selected user does not exist.' }
          return previousState
        }

        if (targetUser.role === 'client') {
          result = { ok: false, error: 'Client role is locked and cannot be modified.' }
          return previousState
        }

        if (!ALLOWED_MANAGEABLE_ROLES.includes(role)) {
          result = { ok: false, error: 'Only Manager and Member roles are allowed.' }
          return previousState
        }

        if (targetUser.role === role) {
          result = { ok: true, noChange: true }
          return previousState
        }

        if (targetUser.role === 'manager' && role !== 'manager') {
          const managerCount = previousState.projectUsers.filter((user) => user.role === 'manager').length
          if (managerCount <= 1) {
            result = { ok: false, error: 'At least one Manager must remain in the project.' }
            return previousState
          }
        }

        const updatedUsers = previousState.projectUsers.map((user) =>
          user.id === userId ? { ...user, role } : user
        )

        if (targetUser.email === localStorage.getItem('userEmail')) {
          localStorage.setItem('userRole', role)
        }

        result = { ok: true }
        return {
          ...previousState,
          projectUsers: updatedUsers,
          activityLogs: [
            createActivityEntry({
              type: 'role_change',
              action: `${targetUser.name} role changed from ${targetUser.role} to ${role}`,
              actorName
            }),
            ...previousState.activityLogs
          ]
        }
      })

      return result
    },
    [updateStoreState]
  )

  const addProjectUser = useCallback(
    ({ name, email, title, role = 'member', actorName }) => {
      let result = { ok: false, error: 'Unable to invite user.' }

      updateStoreState((previousState) => {
        const normalizedName = String(name || '').trim()
        const normalizedEmail = String(email || '').trim().toLowerCase()
        const normalizedTitle = String(title || '').trim()
        const currentProjectId = localStorage.getItem('currentProjectId') || 'proj-1'

        if (!normalizedName) {
          result = { ok: false, error: 'Name is required.' }
          return previousState
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(normalizedEmail)) {
          result = { ok: false, error: 'A valid email address is required.' }
          return previousState
        }

        const roleToAssign = ALLOWED_INVITE_ROLES.includes(role) ? role : 'member'

        const duplicateUser = previousState.projectUsers.find((user) => {
          if (user.email.toLowerCase() !== normalizedEmail) {
            return false
          }

          if (!Array.isArray(user.managedProjectIds)) {
            return true
          }

          return user.managedProjectIds.includes(currentProjectId)
        })

        if (duplicateUser) {
          result = { ok: false, error: 'A user with this email already exists in the project.' }
          return previousState
        }

        const invitedUser = {
          id: createId('user'),
          name: normalizedName,
          title: normalizedTitle || (roleToAssign === 'manager' ? 'Project Manager' : 'Team Member'),
          email: normalizedEmail,
          role: roleToAssign,
          lastActive: 'Invited just now',
          isOnline: false,
          avatar: null,
          activeTasks: 0,
          capacity: 0,
          managedProjectIds: [currentProjectId]
        }

        result = { ok: true, user: invitedUser }
        return {
          ...previousState,
          projectUsers: [...previousState.projectUsers, invitedUser],
          activityLogs: [
            createActivityEntry({
              type: 'invite',
              action: `${invitedUser.name} invited as ${roleToAssign}`,
              actorName
            }),
            ...previousState.activityLogs
          ]
        }
      })

      return result
    },
    [updateStoreState]
  )

  const assignRequirement = useCallback(
    ({ requirementId, memberId, actorName }) => {
      let result = { ok: false, error: 'Unable to assign requirement.' }

      updateStoreState((previousState) => {
        const targetRequirement = previousState.requirements.find((req) => req.id === requirementId)
        const assignee = previousState.projectUsers.find((user) => user.id === memberId)

        if (!targetRequirement || targetRequirement.isArchived) {
          result = { ok: false, error: 'Requirement was not found in the active project list.' }
          return previousState
        }

        if (!assignee) {
          result = { ok: false, error: 'Selected user does not exist.' }
          return previousState
        }

        if (!ALLOWED_ASSIGNMENT_ROLES.includes(assignee.role)) {
          result = { ok: false, error: 'Selected user must have the Team Member role.' }
          return previousState
        }

        if (targetRequirement.status === 'locked') {
          result = { ok: false, error: 'Locked requirements cannot be reassigned.' }
          return previousState
        }

        const isReassignment = Boolean(targetRequirement.assigneeId)
        const updatedRequirements = previousState.requirements.map((requirement) => {
          if (requirement.id !== requirementId) {
            return requirement
          }

          return {
            ...requirement,
            assigneeId: memberId,
            history: [
              ...requirement.history,
              createRequirementHistoryEntry({
                type: isReassignment ? 'reassigned' : 'assigned',
                description: isReassignment
                  ? `Requirement reassigned to ${assignee.name}`
                  : `Requirement assigned to ${assignee.name}`,
                actorName
              })
            ]
          }
        })

        const notification = {
          id: createId('notification'),
          type: 'assignment',
          projectId: targetRequirement.projectId,
          requirementId,
          recipientId: assignee.id,
          message: `${targetRequirement.id} was ${isReassignment ? 'reassigned' : 'assigned'} to ${assignee.name}.`,
          isRead: false,
          timestamp: new Date().toISOString()
        }

        result = { ok: true }
        return {
          ...previousState,
          requirements: updatedRequirements,
          notifications: [notification, ...previousState.notifications],
          activityLogs: [
            createActivityEntry({
              type: isReassignment ? 'reassigned' : 'assigned',
              action: `${targetRequirement.id} ${isReassignment ? 'reassigned' : 'assigned'} to ${assignee.name}`,
              actorName
            }),
            ...previousState.activityLogs
          ]
        }
      })

      return result
    },
    [updateStoreState]
  )

  const setRequirementDeadline = useCallback(
    ({ requirementId, deadline, actorName }) => {
      const normalizedDate = toDateOnlyString(deadline)
      if (!normalizedDate) {
        return { ok: false, error: 'Selected deadline is invalid.' }
      }

      let result = { ok: false, error: 'Unable to save deadline.' }

      updateStoreState((previousState) => {
        const targetRequirement = previousState.requirements.find((req) => req.id === requirementId)
        if (!targetRequirement || targetRequirement.isArchived) {
          result = { ok: false, error: 'Requirement was not found in the active project list.' }
          return previousState
        }

        const updatedRequirements = previousState.requirements.map((requirement) => {
          if (requirement.id !== requirementId) {
            return requirement
          }

          return {
            ...requirement,
            deadline: normalizedDate,
            history: [
              ...requirement.history,
              createRequirementHistoryEntry({
                type: 'deadline_set',
                description: `Deadline set to ${normalizedDate}`,
                actorName
              })
            ]
          }
        })

        const filteredNotifications = previousState.notifications.filter(
          (notification) =>
            !(notification.type === 'overdue' && notification.requirementId === requirementId)
        )

        result = { ok: true }
        return {
          ...previousState,
          requirements: updatedRequirements,
          notifications: filteredNotifications,
          activityLogs: [
            createActivityEntry({
              type: 'deadline',
              action: `${targetRequirement.id} deadline updated to ${normalizedDate}`,
              actorName
            }),
            ...previousState.activityLogs
          ]
        }
      })

      return result
    },
    [updateStoreState]
  )

  const markRequirementsAsDuplicates = useCallback(
    ({ requirementIds, actorName }) => {
      const uniqueRequirementIds = [...new Set(requirementIds)]
      if (uniqueRequirementIds.length < 2) {
        return { ok: false, error: 'At least two requirements must be selected.' }
      }

      let result = { ok: false, error: 'Unable to mark duplicates.' }

      updateStoreState((previousState) => {
        const selectedRequirements = previousState.requirements.filter(
          (requirement) =>
            uniqueRequirementIds.includes(requirement.id) && !requirement.isArchived
        )

        if (selectedRequirements.length !== uniqueRequirementIds.length) {
          result = { ok: false, error: 'Some selected requirements are not available.' }
          return previousState
        }

        const selectedProjectIds = [...new Set(selectedRequirements.map((requirement) => requirement.projectId))]
        if (selectedProjectIds.length !== 1) {
          result = { ok: false, error: 'Selected requirements must belong to the same project.' }
          return previousState
        }

        const existingGroupId = selectedRequirements.find((requirement) => requirement.duplicateGroupId)?.duplicateGroupId
        const duplicateGroupId = existingGroupId || createId('duplicate-group')

        const updatedRequirements = previousState.requirements.map((requirement) => {
          if (!uniqueRequirementIds.includes(requirement.id)) {
            return requirement
          }

          return {
            ...requirement,
            duplicateGroupId,
            history: [
              ...requirement.history,
              createRequirementHistoryEntry({
                type: 'duplicate_marked',
                description: `Marked as duplicate in group ${duplicateGroupId}`,
                actorName
              })
            ]
          }
        })

        result = { ok: true, duplicateGroupId }
        return {
          ...previousState,
          requirements: updatedRequirements,
          activityLogs: [
            createActivityEntry({
              type: 'duplicate_mark',
              action: `${uniqueRequirementIds.length} requirements marked as duplicates`,
              actorName
            }),
            ...previousState.activityLogs
          ]
        }
      })

      return result
    },
    [updateStoreState]
  )

  const mergeDuplicateRequirements = useCallback(
    ({ duplicateGroupId, primaryRequirementId, actorName }) => {
      let result = { ok: false, error: 'Unable to merge duplicates.' }

      updateStoreState((previousState) => {
        const duplicateCandidates = previousState.requirements.filter(
          (requirement) =>
            requirement.duplicateGroupId === duplicateGroupId &&
            !requirement.isArchived
        )

        if (duplicateCandidates.length < 2) {
          result = { ok: false, error: 'Selected requirements are not marked as duplicates.' }
          return previousState
        }

        if (!primaryRequirementId) {
          result = { ok: false, error: 'One primary requirement must be selected.' }
          return previousState
        }

        const primaryRequirement = duplicateCandidates.find(
          (requirement) => requirement.id === primaryRequirementId
        )
        if (!primaryRequirement) {
          result = { ok: false, error: 'Primary requirement must belong to the selected duplicate set.' }
          return previousState
        }

        const duplicateRequirements = duplicateCandidates.filter(
          (requirement) => requirement.id !== primaryRequirementId
        )

        const mergedSummaryLines = duplicateRequirements.map(
          (requirement) => `- [${requirement.id}] ${requirement.title}: ${requirement.description}`
        )

        const updatedRequirements = previousState.requirements.map((requirement) => {
          if (!duplicateCandidates.some((candidate) => candidate.id === requirement.id)) {
            return requirement
          }

          if (requirement.id === primaryRequirementId) {
            const mergedDescription = mergedSummaryLines.length > 0
              ? `${requirement.description}\n\nMerged duplicate details:\n${mergedSummaryLines.join('\n')}`
              : requirement.description

            return {
              ...requirement,
              description: mergedDescription,
              duplicateGroupId: null,
              mergedFromIds: duplicateRequirements.map((duplicate) => duplicate.id),
              history: [
                ...requirement.history,
                createRequirementHistoryEntry({
                  type: 'merged_primary',
                  description: `Merged duplicates: ${duplicateRequirements.map((duplicate) => duplicate.id).join(', ')}`,
                  actorName
                })
              ]
            }
          }

          return {
            ...requirement,
            isArchived: true,
            archivedAt: new Date().toISOString(),
            history: [
              ...requirement.history,
              createRequirementHistoryEntry({
                type: 'merged_archived',
                description: `Archived after merge into ${primaryRequirementId}`,
                actorName
              })
            ]
          }
        })

        result = {
          ok: true,
          archivedRequirementIds: duplicateRequirements.map((duplicate) => duplicate.id)
        }

        return {
          ...previousState,
          requirements: updatedRequirements,
          activityLogs: [
            createActivityEntry({
              type: 'merge_duplicates',
              action: `${duplicateRequirements.length} duplicates merged into ${primaryRequirementId}`,
              actorName
            }),
            ...previousState.activityLogs
          ]
        }
      })

      return result
    },
    [updateStoreState]
  )

  const setRequirementStatus = useCallback(
    ({ requirementId, status, actorName, reason }) => {
      if (!ALLOWED_REQUIREMENT_STATUSES.includes(status)) {
        return { ok: false, error: 'Unsupported requirement status.' }
      }

      let result = { ok: false, error: 'Unable to update requirement status.' }

      updateStoreState((previousState) => {
        const targetRequirement = previousState.requirements.find((requirement) => requirement.id === requirementId)
        if (!targetRequirement || targetRequirement.isArchived) {
          result = { ok: false, error: 'Requirement was not found in the active project list.' }
          return previousState
        }

        if (targetRequirement.status === 'locked' && status !== 'locked') {
          result = { ok: false, error: 'Locked requirements cannot be modified.' }
          return previousState
        }

        if (status === 'locked' && targetRequirement.status !== 'approved') {
          result = { ok: false, error: 'Only approved requirements can be locked.' }
          return previousState
        }

        const updatedRequirements = previousState.requirements.map((requirement) => {
          if (requirement.id !== requirementId) {
            return requirement
          }

          return {
            ...requirement,
            status,
            history: [
              ...requirement.history,
              createRequirementHistoryEntry({
                type: 'status_change',
                description: reason
                  ? `Status changed to ${status}: ${reason}`
                  : `Status changed to ${status}`,
                actorName
              })
            ]
          }
        })

        result = { ok: true }
        return {
          ...previousState,
          requirements: updatedRequirements,
          activityLogs: [
            createActivityEntry({
              type: 'status_change',
              action: `${requirementId} moved to ${status}`,
              actorName
            }),
            ...previousState.activityLogs
          ]
        }
      })

      return result
    },
    [updateStoreState]
  )

  const dismissNotification = useCallback(
    (notificationId) => {
      updateStoreState((previousState) => ({
        ...previousState,
        notifications: previousState.notifications.filter(
          (notification) => notification.id !== notificationId
        )
      }))
    },
    [updateStoreState]
  )

  const refreshOverdueNotifications = useCallback(() => {
    updateStoreState((previousState) => {
      const overdueRequirements = previousState.requirements.filter((requirement) =>
        isRequirementOverdue(requirement)
      )

      if (overdueRequirements.length === 0) {
        return previousState
      }

      const existingOverdueRequirementIds = new Set(
        previousState.notifications
          .filter((notification) => notification.type === 'overdue')
          .map((notification) => notification.requirementId)
      )

      const newNotifications = overdueRequirements
        .filter((requirement) => !existingOverdueRequirementIds.has(requirement.id))
        .map((requirement) => ({
          id: createId('notification'),
          type: 'overdue',
          projectId: requirement.projectId,
          requirementId: requirement.id,
          message: `${requirement.id} is overdue and still not approved or locked.`,
          isRead: false,
          timestamp: new Date().toISOString()
        }))

      if (newNotifications.length === 0) {
        return previousState
      }

      return {
        ...previousState,
        notifications: [...newNotifications, ...previousState.notifications],
        activityLogs: [
          ...newNotifications.map((notification) =>
            createActivityEntry({
              type: 'overdue',
              action: notification.message,
              actorName: 'System'
            })
          ),
          ...previousState.activityLogs
        ]
      }
    })
  }, [updateStoreState])

  useEffect(() => {
    refreshOverdueNotifications()
    const intervalId = window.setInterval(
      refreshOverdueNotifications,
      OVERDUE_NOTIFICATION_CHECK_INTERVAL
    )
    return () => window.clearInterval(intervalId)
  }, [refreshOverdueNotifications])

  useEffect(() => {
    persistStoreState(storeState)
  }, [storeState])

  const currentProject = getCurrentProject()

  const projectUsers = useMemo(
    () =>
      storeState.projectUsers.filter((user) => {
        if (!Array.isArray(user.managedProjectIds)) {
          return true
        }
        return user.managedProjectIds.includes(currentProject.id)
      }),
    [storeState.projectUsers, currentProject.id]
  )

  const activeRequirements = useMemo(
    () =>
      storeState.requirements.filter(
        (requirement) => requirement.projectId === currentProject.id && !requirement.isArchived
      ),
    [storeState.requirements, currentProject.id]
  )

  const workflowStageMap = useMemo(
    () =>
      storeState.workflowStages.reduce((accumulator, stage) => {
        accumulator[stage.id] = stage.label
        return accumulator
      }, {}),
    [storeState.workflowStages]
  )

  const overdueRequirements = useMemo(
    () => activeRequirements.filter((requirement) => isRequirementOverdue(requirement)),
    [activeRequirements]
  )

  const projectNotifications = useMemo(
    () => storeState.notifications.filter((notification) => notification.projectId === currentProject.id),
    [storeState.notifications, currentProject.id]
  )

  const managerNotifications = useMemo(
    () => projectNotifications.filter((notification) => notification.type === 'overdue'),
    [projectNotifications]
  )

  const getRequirementById = useCallback(
    (requirementId) =>
      storeState.requirements.find(
        (requirement) => requirement.id === requirementId && !requirement.isArchived
      ) || null,
    [storeState.requirements]
  )

  const value = useMemo(
    () => ({
      currentUser,
      currentProject,
      workflowStages: storeState.workflowStages,
      workflowStageMap,
      projectUsers,
      activeRequirements,
      overdueRequirements,
      activityLogs: storeState.activityLogs,
      notifications: projectNotifications,
      managerNotifications,
      getRequirementById,
      addProjectUser,
      updateProjectUserRole,
      setWorkflowStages,
      assignRequirement,
      setRequirementDeadline,
      markRequirementsAsDuplicates,
      mergeDuplicateRequirements,
      setRequirementStatus,
      dismissNotification,
      appendActivityLog
    }),
    [
      currentProject,
      currentUser,
      workflowStageMap,
      storeState.workflowStages,
      projectUsers,
      activeRequirements,
      overdueRequirements,
      storeState.activityLogs,
      projectNotifications,
      managerNotifications,
      getRequirementById,
      addProjectUser,
      updateProjectUserRole,
      setWorkflowStages,
      assignRequirement,
      setRequirementDeadline,
      markRequirementsAsDuplicates,
      mergeDuplicateRequirements,
      setRequirementStatus,
      dismissNotification,
      appendActivityLog
    ]
  )

  return (
    <ProjectDataContext.Provider value={value}>
      {children}
    </ProjectDataContext.Provider>
  )
}

export function useProjectData() {
  const context = useContext(ProjectDataContext)
  if (!context) {
    throw new Error('useProjectData must be used inside ProjectDataProvider.')
  }
  return context
}
