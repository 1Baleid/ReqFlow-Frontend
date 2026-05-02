import { User } from '../models/User.js'
import { Project } from '../models/Project.js'
import { Requirement } from '../models/Requirement.js'

// List all users
export const listUsers = async (request, response) => {
  try {
    const { role, projectId } = request.query

    let filter = {}
    if (role) {
      filter.role = role
    }

    let users = await User.find(filter)
      .select('-passwordHash')
      .sort({ name: 1 })

    // If projectId is provided, filter to only users in that project
    if (projectId) {
      const project = await Project.findById(projectId)
      if (project) {
        const memberIds = project.members.map(m => m.user.toString())
        memberIds.push(project.owner.toString())
        users = users.filter(u => memberIds.includes(u._id.toString()))
      }
    }

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const assignedCount = await Requirement.countDocuments({
          'assignee.id': user._id.toString(),
          isArchived: false
        })

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: getRoleTitle(user.role),
          activeTasks: assignedCount,
          lastActive: user.updatedAt,
          isOnline: false, // Would need real-time tracking
          createdAt: user.createdAt
        }
      })
    )

    response.json({ users: usersWithStats })
  } catch (error) {
    console.error('List users error:', error)
    response.status(500).json({ message: 'Failed to fetch users' })
  }
}

// Get single user
export const getUser = async (request, response) => {
  try {
    const { id } = request.params

    const user = await User.findById(id).select('-passwordHash')

    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    // Get user's projects
    const projects = await Project.find({
      $or: [
        { owner: id },
        { 'members.user': id }
      ]
    }).select('name color status')

    // Get assigned requirements count
    const assignedCount = await Requirement.countDocuments({
      'assignee.id': id,
      isArchived: false
    })

    response.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: getRoleTitle(user.role),
        projects,
        activeTasks: assignedCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    response.status(500).json({ message: 'Failed to fetch user' })
  }
}

// Get current user (from auth token)
export const getCurrentUser = async (request, response) => {
  try {
    // In a real app, this would use the authenticated user from middleware
    const userId = request.headers['x-user-id'] || request.query.userId

    if (!userId) {
      return response.status(401).json({ message: 'Not authenticated' })
    }

    const user = await User.findById(userId).select('-passwordHash')

    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    response.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: getRoleTitle(user.role)
      }
    })
  } catch (error) {
    console.error('Get current user error:', error)
    response.status(500).json({ message: 'Failed to fetch user' })
  }
}

// Update user
export const updateUser = async (request, response) => {
  try {
    const { id } = request.params
    const { name, role } = request.body

    const updates = {}
    if (name) updates.name = name
    if (role && ['client', 'manager', 'member'].includes(role)) {
      updates.role = role
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).select('-passwordHash')

    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    response.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: getRoleTitle(user.role)
      }
    })
  } catch (error) {
    console.error('Update user error:', error)
    response.status(500).json({ message: 'Failed to update user' })
  }
}

// Get team members for a project
export const getTeamMembers = async (request, response) => {
  try {
    const { projectId } = request.query

    if (!projectId) {
      // Return all users if no project specified
      const users = await User.find().select('-passwordHash').sort({ name: 1 })
      return response.json({
        teamMembers: users.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          title: getRoleTitle(u.role)
        }))
      })
    }

    const project = await Project.findById(projectId)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role')

    if (!project) {
      return response.status(404).json({ message: 'Project not found' })
    }

    const teamMembers = []

    // Add owner
    if (project.owner) {
      teamMembers.push({
        id: project.owner._id,
        name: project.owner.name,
        email: project.owner.email,
        role: 'client',
        title: 'Project Owner'
      })
    }

    // Add members
    project.members.forEach(member => {
      if (member.user) {
        teamMembers.push({
          id: member.user._id,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
          title: getRoleTitle(member.role),
          joinedAt: member.joinedAt
        })
      }
    })

    response.json({ teamMembers })
  } catch (error) {
    console.error('Get team members error:', error)
    response.status(500).json({ message: 'Failed to fetch team members' })
  }
}

function getRoleTitle(role) {
  const titles = {
    client: 'Project Owner',
    manager: 'Project Manager',
    member: 'Team Member'
  }
  return titles[role] || 'Team Member'
}
