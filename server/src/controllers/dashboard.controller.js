import { Requirement } from '../models/Requirement.js'
import { Project } from '../models/Project.js'

// Get dashboard stats for charts
export const getDashboardStats = async (request, response) => {
  try {
    const userId = request.user?.id
    const projectId = request.query.projectId

    // Build query filter
    const filter = { isArchived: false }
    if (projectId) {
      filter.project = projectId
    }

    // Get status distribution for bar/donut charts
    const statusStats = await Requirement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Get priority distribution
    const priorityStats = await Requirement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ])

    // Get type distribution
    const typeStats = await Requirement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ])

    // Get requirements created over time (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const timelineStats = await Requirement.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Get overdue requirements count
    const overdueCount = await Requirement.countDocuments({
      ...filter,
      deadline: { $lt: new Date() },
      status: { $nin: ['approved', 'locked', 'rejected'] }
    })

    // Get total counts
    const totalRequirements = await Requirement.countDocuments(filter)
    const totalProjects = await Project.countDocuments({ status: 'active' })

    // Format response for charts
    const statusColors = {
      draft: '#64748b',
      review: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
      locked: '#8b5cf6'
    }

    const priorityColors = {
      low: '#94a3b8',
      medium: '#3b82f6',
      high: '#f59e0b',
      critical: '#ef4444'
    }

    response.json({
      statusDistribution: statusStats.map(s => ({
        label: s._id.charAt(0).toUpperCase() + s._id.slice(1),
        value: s.count,
        color: statusColors[s._id] || '#64748b'
      })),
      priorityDistribution: priorityStats.map(p => ({
        label: p._id.charAt(0).toUpperCase() + p._id.slice(1),
        value: p.count,
        color: priorityColors[p._id] || '#64748b'
      })),
      typeDistribution: typeStats.map(t => ({
        label: t._id.charAt(0).toUpperCase() + t._id.slice(1),
        value: t.count
      })),
      timeline: timelineStats.map(t => ({
        date: t._id,
        count: t.count
      })),
      summary: {
        totalRequirements,
        totalProjects,
        overdueCount,
        completionRate: totalRequirements > 0
          ? Math.round((statusStats.find(s => s._id === 'approved')?.count || 0) / totalRequirements * 100)
          : 0
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    response.status(500).json({ message: 'Failed to fetch dashboard stats' })
  }
}

// Get project-specific stats
export const getProjectStats = async (request, response) => {
  try {
    const { projectId } = request.params

    const requirements = await Requirement.find({
      project: projectId,
      isArchived: false
    })

    const stats = {
      total: requirements.length,
      byStatus: {},
      byPriority: {},
      recentActivity: []
    }

    // Count by status
    requirements.forEach(req => {
      stats.byStatus[req.status] = (stats.byStatus[req.status] || 0) + 1
      stats.byPriority[req.priority] = (stats.byPriority[req.priority] || 0) + 1
    })

    // Get recent activity (last 5 modified)
    const recentReqs = await Requirement.find({ project: projectId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')

    stats.recentActivity = recentReqs.map(req => ({
      id: req._id,
      title: req.title,
      status: req.status,
      updatedAt: req.updatedAt
    }))

    response.json(stats)
  } catch (error) {
    console.error('Project stats error:', error)
    response.status(500).json({ message: 'Failed to fetch project stats' })
  }
}

// Get manager KPIs
export const getManagerKPIs = async (request, response) => {
  try {
    const filter = { isArchived: false }

    // Get counts by status
    const [draft, review, approved, rejected, overdue] = await Promise.all([
      Requirement.countDocuments({ ...filter, status: 'draft' }),
      Requirement.countDocuments({ ...filter, status: 'review' }),
      Requirement.countDocuments({ ...filter, status: 'approved' }),
      Requirement.countDocuments({ ...filter, status: 'rejected' }),
      Requirement.countDocuments({
        ...filter,
        deadline: { $lt: new Date() },
        status: { $nin: ['approved', 'locked', 'rejected'] }
      })
    ])

    // Get overdue requirements details
    const overdueRequirements = await Requirement.find({
      ...filter,
      deadline: { $lt: new Date() },
      status: { $nin: ['approved', 'locked', 'rejected'] }
    })
      .sort({ deadline: 1 })
      .limit(10)
      .populate('assignedTo', 'name email')
      .populate('project', 'name color')

    response.json({
      kpis: {
        draft,
        review,
        approved,
        rejected,
        overdue
      },
      overdueRequirements: overdueRequirements.map(req => ({
        id: req._id,
        title: req.title,
        status: req.status,
        priority: req.priority,
        deadline: req.deadline,
        assignee: req.assignedTo,
        project: req.project
      }))
    })
  } catch (error) {
    console.error('Manager KPIs error:', error)
    response.status(500).json({ message: 'Failed to fetch manager KPIs' })
  }
}
