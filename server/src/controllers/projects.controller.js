import { Project } from '../models/Project.js'
import { Requirement } from '../models/Requirement.js'
import { User } from '../models/User.js'

// List all projects
export const listProjects = async (request, response) => {
  try {
    const { status, userId } = request.query

    const filter = {}
    if (status) {
      filter.status = status
    }
    if (userId) {
      filter.$or = [
        { owner: userId },
        { 'members.user': userId }
      ]
    }

    const projects = await Project.find(filter)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role')
      .sort({ updatedAt: -1 })

    // Get requirement counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const requirementStats = await Requirement.aggregate([
          { $match: { projectId: project._id.toString(), isArchived: false } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ])

        const total = requirementStats.reduce((sum, s) => sum + s.count, 0)
        const completed = requirementStats.find(s => s._id === 'approved')?.count || 0

        return {
          id: project._id,
          name: project.name,
          description: project.description,
          color: project.color,
          status: project.status,
          owner: project.owner,
          members: project.members,
          requirementsCount: total,
          requirements: {
            total,
            completed
          },
          progress: total > 0 ? Math.round((completed / total) * 100) : 0,
          team: project.members.map(m => ({
            id: m.user?._id || m.user,
            name: m.user?.name || 'Unknown',
            role: m.role,
            initials: m.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
          })),
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        }
      })
    )

    response.json({ projects: projectsWithCounts })
  } catch (error) {
    console.error('List projects error:', error)
    response.status(500).json({ message: 'Failed to fetch projects' })
  }
}

// Get single project
export const getProject = async (request, response) => {
  try {
    const { id } = request.params

    const project = await Project.findById(id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role')

    if (!project) {
      return response.status(404).json({ message: 'Project not found' })
    }

    response.json({ project })
  } catch (error) {
    console.error('Get project error:', error)
    response.status(500).json({ message: 'Failed to fetch project' })
  }
}

// Create project
export const createProject = async (request, response) => {
  try {
    const { name, description, color, ownerId, members } = request.body

    if (!name || !ownerId) {
      return response.status(400).json({ message: 'Name and owner are required' })
    }

    const project = new Project({
      name,
      description: description || '',
      color: color || '#1353d8',
      owner: ownerId,
      members: members || [],
      status: 'active'
    })

    await project.save()

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role')

    response.status(201).json({
      message: 'Project created successfully',
      project: populatedProject
    })
  } catch (error) {
    console.error('Create project error:', error)
    response.status(500).json({ message: 'Failed to create project' })
  }
}

// Update project
export const updateProject = async (request, response) => {
  try {
    const { id } = request.params
    const updates = request.body

    const project = await Project.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    )
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role')

    if (!project) {
      return response.status(404).json({ message: 'Project not found' })
    }

    response.json({
      message: 'Project updated successfully',
      project
    })
  } catch (error) {
    console.error('Update project error:', error)
    response.status(500).json({ message: 'Failed to update project' })
  }
}

// Delete project
export const deleteProject = async (request, response) => {
  try {
    const { id } = request.params

    const project = await Project.findByIdAndDelete(id)

    if (!project) {
      return response.status(404).json({ message: 'Project not found' })
    }

    // Optionally archive all requirements in this project
    await Requirement.updateMany(
      { projectId: id },
      { $set: { isArchived: true, archivedAt: new Date() } }
    )

    response.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Delete project error:', error)
    response.status(500).json({ message: 'Failed to delete project' })
  }
}

// Add member to project
export const addProjectMember = async (request, response) => {
  try {
    const { id } = request.params
    const { userId, role } = request.body

    if (!userId) {
      return response.status(400).json({ message: 'User ID is required' })
    }

    const project = await Project.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          members: {
            user: userId,
            role: role || 'member',
            joinedAt: new Date()
          }
        }
      },
      { new: true }
    )
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role')

    if (!project) {
      return response.status(404).json({ message: 'Project not found' })
    }

    response.json({
      message: 'Member added successfully',
      project
    })
  } catch (error) {
    console.error('Add member error:', error)
    response.status(500).json({ message: 'Failed to add member' })
  }
}

// Remove member from project
export const removeProjectMember = async (request, response) => {
  try {
    const { id, userId } = request.params

    const project = await Project.findByIdAndUpdate(
      id,
      { $pull: { members: { user: userId } } },
      { new: true }
    )
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role')

    if (!project) {
      return response.status(404).json({ message: 'Project not found' })
    }

    response.json({
      message: 'Member removed successfully',
      project
    })
  } catch (error) {
    console.error('Remove member error:', error)
    response.status(500).json({ message: 'Failed to remove member' })
  }
}
