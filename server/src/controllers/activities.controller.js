import { Activity } from '../models/Activity.js'
import { Requirement } from '../models/Requirement.js'

// List activities
export const listActivities = async (request, response) => {
  try {
    const { projectId, limit = 20, offset = 0 } = request.query

    const filter = {}
    if (projectId) {
      filter.projectId = projectId
    }

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))

    const total = await Activity.countDocuments(filter)

    response.json({
      activities: activities.map(formatActivity),
      total,
      hasMore: parseInt(offset) + activities.length < total
    })
  } catch (error) {
    console.error('List activities error:', error)
    response.status(500).json({ message: 'Failed to fetch activities' })
  }
}

// Get recent activities (for dashboard)
export const getRecentActivities = async (request, response) => {
  try {
    const { projectId, limit = 10 } = request.query

    // First try to get from Activity collection
    const filter = {}
    if (projectId) {
      filter.projectId = projectId
    }

    let activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))

    // If no activities in Activity collection, derive from requirements
    if (activities.length === 0) {
      const requirements = await Requirement.find(
        projectId ? { projectId, isArchived: false } : { isArchived: false }
      )
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit))
        .select('requirementId title status updatedAt createdBy history')

      activities = requirements.map(req => {
        const lastAction = req.history?.[req.history.length - 1]
        return {
          id: `derived-${req._id}`,
          type: lastAction?.action || 'updated',
          actor: lastAction?.actor?.name || req.createdBy?.name || 'Unknown',
          action: `${lastAction?.action || 'updated'} ${req.requirementId}`,
          targetId: req.requirementId,
          targetTitle: req.title,
          time: formatTimeAgo(req.updatedAt),
          createdAt: req.updatedAt
        }
      })

      return response.json({ activities })
    }

    response.json({
      activities: activities.map(formatActivity)
    })
  } catch (error) {
    console.error('Get recent activities error:', error)
    response.status(500).json({ message: 'Failed to fetch recent activities' })
  }
}

// Create activity (usually called internally)
export const createActivity = async (request, response) => {
  try {
    const { type, actor, targetType, targetId, targetTitle, projectId, details } = request.body

    if (!type || !actor || !targetType || !targetId || !projectId) {
      return response.status(400).json({ message: 'Missing required fields' })
    }

    const activity = new Activity({
      type,
      actor,
      targetType,
      targetId,
      targetTitle,
      projectId,
      details: details || {}
    })

    await activity.save()

    response.status(201).json({
      message: 'Activity created',
      activity: formatActivity(activity)
    })
  } catch (error) {
    console.error('Create activity error:', error)
    response.status(500).json({ message: 'Failed to create activity' })
  }
}

// Helper to create activity from requirement changes
export const logRequirementActivity = async (type, requirement, actor, details = {}) => {
  try {
    const activity = new Activity({
      type,
      actor: {
        id: actor.id,
        name: actor.name,
        role: actor.role || 'member'
      },
      targetType: 'requirement',
      targetId: requirement.requirementId,
      targetTitle: requirement.title,
      projectId: requirement.projectId,
      details
    })

    await activity.save()
    return activity
  } catch (error) {
    console.error('Log activity error:', error)
    return null
  }
}

function formatActivity(activity) {
  const actionVerbs = {
    created: 'created',
    updated: 'updated',
    approved: 'approved',
    rejected: 'rejected',
    commented: 'commented on',
    assigned: 'assigned',
    status_changed: 'changed status of',
    deadline_set: 'set deadline for'
  }

  const verb = actionVerbs[activity.type] || activity.type

  return {
    id: activity._id || activity.id,
    type: activity.type,
    actor: activity.actor?.name || activity.actor || 'Unknown',
    action: `${verb} ${activity.targetId}`,
    targetId: activity.targetId,
    targetTitle: activity.targetTitle,
    time: formatTimeAgo(activity.createdAt),
    createdAt: activity.createdAt
  }
}

function formatTimeAgo(date) {
  if (!date) return 'Just now'

  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
