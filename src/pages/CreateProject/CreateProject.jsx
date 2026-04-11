import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput'
import TextArea from '../../components/TextArea'
import { createProject, getCurrentUser, getProjects, updateProject } from '../../data/mockData'
import './CreateProject.css'

const colorOptions = [
  { value: '#1353d8', label: 'ReqFlow Blue' },
  { value: '#059669', label: 'Green' },
  { value: '#d97706', label: 'Amber' },
  { value: '#7c3aed', label: 'Violet' },
  { value: '#dc2626', label: 'Red' },
  { value: '#0891b2', label: 'Cyan' }
]

const roleOptions = [
  { value: 'manager', label: 'Manager' },
  { value: 'member', label: 'Team Member' }
]

const initialUsers = [
  {
    id: 'client',
    name: '',
    email: '',
    role: 'client',
    locked: false,
    protected: true
  }
]

const workflowDefaults = [
  { id: 'draft', label: 'Draft', description: 'Initial authoring phase', locked: true },
  { id: 'review', label: 'Review', description: 'Under manager review' },
  { id: 'approved', label: 'Approved', description: 'Accepted and ready for lock', locked: true },
  { id: 'rejected', label: 'Rejected', description: 'Returned for correction' }
]

function copyWorkflowStages(stages) {
  return stages.map((stage) => ({ ...stage }))
}

function getInitialFormData(project) {
  return {
    name: project?.name || '',
    description: project?.description || '',
    startDate: project?.startDate || '',
    targetCompletion: project?.targetCompletion || '',
    color: project?.color || colorOptions[0].value
  }
}

function ensureCreatorManager(users, currentUser) {
  if (!Array.isArray(users) || !currentUser?.id) {
    return Array.isArray(users) ? users : []
  }

  const creatorName = String(currentUser.name || '').trim()
  const creatorEmail = String(currentUser.email || '').trim()
  const creatorEmailKey = creatorEmail.toLowerCase()
  const creatorIndex = users.findIndex((user) => {
    if (user.id === currentUser.id) {
      return true
    }

    const userEmail = String(user.email || '').trim().toLowerCase()
    return Boolean(creatorEmailKey) && userEmail === creatorEmailKey
  })

  if (creatorIndex === -1) {
    return [
      ...users,
      {
        id: currentUser.id,
        name: creatorName,
        email: creatorEmail,
        role: 'manager'
      }
    ]
  }

  return users.map((user, index) => {
    if (index !== creatorIndex) {
      return user
    }

    return {
      ...user,
      id: currentUser.id,
      role: 'manager',
      name: String(user.name || '').trim() || creatorName,
      email: String(user.email || '').trim() || creatorEmail
    }
  })
}

function getProjectUsers(project, isEditMode, currentUser) {
  if (Array.isArray(project?.users) && project.users.length > 0) {
    const normalizedUsers = project.users.map((user) => ({
      ...user,
      role: user.role || 'member',
      locked: Boolean(user.locked || user.role === 'client'),
      protected: user.role === 'client'
    }))

    if (!normalizedUsers.some((user) => user.role === 'client')) {
      normalizedUsers.unshift({
        id: 'client',
        name: 'Project Client',
        email: '',
        role: 'client',
        locked: true,
        protected: true
      })
    }

    return normalizedUsers
  }

  if (Array.isArray(project?.team) && project.team.length > 0 && project.team.every((member) => member.email)) {
    return project.team.map((member, index) => ({
      id: member.id,
      name: member.name,
      email: member.email || '',
      role: index === 0 ? 'manager' : 'member',
      locked: false
    }))
  }

  const baseUsers = initialUsers.map((user) => ({
    ...user,
    locked: isEditMode ? true : user.locked
  }))

  if (isEditMode) {
    return baseUsers
  }

  return ensureCreatorManager(baseUsers, currentUser)
}

function getWorkflowStages(project) {
  if (Array.isArray(project?.workflowStages) && project.workflowStages.length > 0) {
    return copyWorkflowStages(project.workflowStages)
  }

  return copyWorkflowStages(workflowDefaults)
}

function getInitials(name) {
  return String(name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function CreateProject() {
  const currentUser = getCurrentUser()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const isEditMode = Boolean(projectId)
  const existingProject = useMemo(
    () => getProjects().find((project) => project.id === projectId) || null,
    [projectId]
  )
  const projectNotFound = isEditMode && !existingProject
  const [formData, setFormData] = useState(() => getInitialFormData(existingProject))
  const [projectUsers, setProjectUsers] = useState(() => getProjectUsers(existingProject, isEditMode, currentUser))
  const [workflowStages, setWorkflowStages] = useState(() => getWorkflowStages(existingProject))
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }))

    if (errors[name] || errors.form) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        [name]: '',
        form: ''
      }))
    }
  }

  const handleColorSelect = (color) => {
    setFormData((previousData) => ({
      ...previousData,
      color
    }))
  }

  const handleUserChange = (userId, field, value) => {
    setProjectUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === userId ? { ...user, [field]: value } : user
      )
    )

    if (errors.users || errors.form) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        users: '',
        form: ''
      }))
    }
  }

  const handleAddUser = () => {
    setProjectUsers((previousUsers) => [
      ...previousUsers,
      {
        id: `user-${Date.now()}`,
        name: '',
        email: '',
        role: 'member'
      }
    ])
  }

  const handleRemoveUser = (userId) => {
    setProjectUsers((previousUsers) => {
      const userToRemove = previousUsers.find((user) => user.id === userId)
      if (!userToRemove || userToRemove.role === 'client') {
        return previousUsers
      }

      return previousUsers.filter((user) => user.id !== userId)
    })
  }

  const handleWorkflowChange = (stageId, field, value) => {
    setWorkflowStages((previousStages) =>
      previousStages.map((stage) =>
        stage.id === stageId ? { ...stage, [field]: value } : stage
      )
    )
  }

  const handleDiscardWorkflow = () => {
    setWorkflowStages(getWorkflowStages(existingProject))
  }

  const validate = (usersToValidate = projectUsers) => {
    const nextErrors = {}
    const trimmedUsers = usersToValidate.map((user) => ({
      ...user,
      name: user.name.trim(),
      email: user.email.trim()
    }))
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.name.trim()) {
      nextErrors.name = 'Project name is required.'
    }

    const clientUsers = trimmedUsers.filter((user) => user.role === 'client')
    if (clientUsers.length !== 1) {
      nextErrors.users = 'Exactly one Client must be set during project creation.'
    }

    if (clientUsers.length === 1) {
      const [clientUser] = clientUsers
      if (!clientUser.name || !emailPattern.test(clientUser.email)) {
        nextErrors.users = 'Client name and a valid client email are required.'
      }
    }

    if (trimmedUsers.some((user) => !user.name || !emailPattern.test(user.email))) {
      nextErrors.users = 'Every project user needs a name and a valid email.'
    }

    if (!trimmedUsers.some((user) => user.role === 'manager')) {
      nextErrors.users = 'At least one Manager is required.'
    }

    return nextErrors
  }

  const handleCancel = () => {
    navigate('/projects')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const submissionUsers = isEditMode
      ? projectUsers
      : ensureCreatorManager(projectUsers, currentUser)
    const validationErrors = validate(submissionUsers)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    const sanitizedUsers = submissionUsers.map((user) => ({
      ...user,
      name: user.name.trim(),
      email: user.email.trim()
    }))

    const projectPayload = {
      ...formData,
      users: sanitizedUsers,
      workflowStages,
      team: sanitizedUsers.map((user) => ({
        id: user.id,
        name: user.name,
        initials: getInitials(user.name)
      }))
    }
    const saveResult = isEditMode
      ? updateProject(projectId, projectPayload)
      : createProject(projectPayload)

    if (!saveResult.ok) {
      setErrors({ form: saveResult.error || 'Unable to save project.' })
      setIsSubmitting(false)
      return
    }

    navigate('/projects', {
      state: { highlightedProjectId: saveResult.project.id }
    })
  }

  if (projectNotFound) {
    return (
      <MainLayout user={currentUser} role={currentUser.role}>
        <div className="create-project-page">
          <Link to="/projects" className="create-project-page__breadcrumb">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Projects
          </Link>
          <div className="create-project-page__empty">
            <span className="material-symbols-outlined">folder_off</span>
            <h1>Project not found</h1>
            <p>The project may have been deleted or is no longer available.</p>
            <Button variant="primary" onClick={() => navigate('/projects')}>
              Return to Projects
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
      <div className="create-project-page">
        <Link to="/projects" className="create-project-page__breadcrumb">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Projects
        </Link>

        <form onSubmit={handleSubmit} className="create-project-page__form">
          <section className="create-project-page__header">
            <div>
              <span className="create-project-page__eyebrow">Project Workspace</span>
              <h1 className="create-project-page__title">
                {isEditMode ? 'Edit Project' : 'Create New Project'}
              </h1>
              <p className="create-project-page__subtitle">
                {isEditMode
                  ? 'Update the project information, users, and workflow labels.'
                  : 'Set up the project information, users, and workflow labels before it becomes active.'}
              </p>
            </div>

            <div className="create-project-page__header-actions">
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon="save" iconPosition="left" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Project'}
              </Button>
            </div>
          </section>

          {errors.form && (
            <div className="create-project-page__error" role="alert">
              <span className="material-symbols-outlined">error</span>
              <span>{errors.form}</span>
            </div>
          )}

          <div className="create-project-page__content">
            <div className="create-project-page__main">
              <section className="create-project-page__card">
                <div className="create-project-page__card-header">
                  <div>
                    <h2 className="create-project-page__card-title">Project Information</h2>
                    <p className="create-project-page__card-subtitle">
                      This is the information that appears in the project switcher and project list.
                    </p>
                  </div>
                  <span className="create-project-page__card-icon" aria-hidden="true"></span>
                </div>

                <TextInput
                  label="Project Name"
                  id="project-name"
                  name="name"
                  placeholder="e.g., E-Commerce Platform Redesign"
                  value={formData.name}
                  onChange={handleFormChange}
                  error={errors.name}
                  required
                />

                <TextArea
                  label="Description"
                  id="project-description"
                  name="description"
                  placeholder="Describe the scope and requirements focus..."
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={5}
                  showToolbar={false}
                />

                <div className="create-project-page__date-row">
                  <TextInput
                    label="Start Date"
                    id="project-start-date"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleFormChange}
                  />
                  <TextInput
                    label="Target Completion"
                    id="project-target-completion"
                    name="targetCompletion"
                    type="date"
                    value={formData.targetCompletion}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="create-project-page__color-field">
                  <span className="create-project-page__label">Project Color</span>
                  <div className="create-project-page__colors">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`create-project-page__color ${formData.color === option.value ? 'create-project-page__color--active' : ''}`}
                        style={{ background: option.value }}
                        onClick={() => handleColorSelect(option.value)}
                        aria-label={`Use ${option.label}`}
                        aria-pressed={formData.color === option.value}
                      >
                        {formData.color === option.value && (
                          <span className="material-symbols-outlined">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="create-project-page__card">
                <div className="create-project-page__card-header">
                  <div>
                    <h2 className="create-project-page__card-title">Project Users</h2>
                    <p className="create-project-page__card-subtitle">
                      Add users and assign the starting access role for this project.
                    </p>
                  </div>
                  <Button type="button" variant="secondary" icon="person_add" iconPosition="left" onClick={handleAddUser}>
                    Add User
                  </Button>
                </div>

                {errors.users && (
                  <div className="create-project-page__inline-error" role="alert">
                    <span className="material-symbols-outlined">error</span>
                    <span>{errors.users}</span>
                  </div>
                )}

                <div className="create-project-page__users">
                  <div className="create-project-page__users-head">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Role</span>
                    <span>Action</span>
                  </div>

                  {projectUsers.map((user) => (
                    <div className="create-project-page__user-row" key={user.id}>
                      <input
                        type="text"
                        value={user.name}
                        onChange={(event) => handleUserChange(user.id, 'name', event.target.value)}
                        disabled={Boolean(isEditMode && user.role === 'client') || user.locked}
                        placeholder="Full name"
                        aria-label="User name"
                      />
                      <input
                        type="email"
                        value={user.email}
                        onChange={(event) => handleUserChange(user.id, 'email', event.target.value)}
                        disabled={Boolean(isEditMode && user.role === 'client') || user.locked}
                        placeholder="name@example.com"
                        aria-label="User email"
                      />
                      {user.role === 'client' ? (
                        <span className="create-project-page__locked-role">Client</span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(event) => handleUserChange(user.id, 'role', event.target.value)}
                          aria-label={`Role for ${user.name || 'new user'}`}
                        >
                          {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {user.role === 'client' || user.locked ? (
                        <span className="create-project-page__protected">
                          {isEditMode && user.role === 'client' ? 'Locked after creation' : 'Protected'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="create-project-page__remove"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="create-project-page__card">
                <div className="create-project-page__card-header">
                  <div>
                    <h2 className="create-project-page__card-title">Workflow Settings</h2>
                    <p className="create-project-page__card-subtitle">
                      Edit labels for this project setup. Required stages stay available.
                    </p>
                  </div>
                  <button type="button" className="create-project-page__discard" onClick={handleDiscardWorkflow}>
                    Reset Labels
                  </button>
                </div>

                <div className="create-project-page__workflow">
                  {workflowStages.map((stage) => (
                    <div className={`create-project-page__workflow-row ${stage.locked ? 'create-project-page__workflow-row--locked' : ''}`} key={stage.id}>
                      <span className="material-symbols-outlined">account_tree</span>
                      <div>
                        <label htmlFor={`workflow-${stage.id}`}>Visibility Label</label>
                        <input
                          id={`workflow-${stage.id}`}
                          type="text"
                          value={stage.label}
                          onChange={(event) => handleWorkflowChange(stage.id, 'label', event.target.value)}
                        />
                        <p>{stage.description}</p>
                      </div>
                      {stage.locked && (
                        <span className="create-project-page__stage-badge">Required</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="create-project-page__sidebar">
              <section className="create-project-page__side-card create-project-page__side-card--blue">
                <h3>Access Rules</h3>
                <ul>
                  <li>Client must be set in this page.</li>
                  <li>Client cannot be changed later.</li>
                  <li>Project creator is added as Manager by default.</li>
                  <li>At least one Manager is required.</li>
                  <li>Saved projects become active immediately.</li>
                </ul>
              </section>

              <section className="create-project-page__side-card">
                <h3>Role Permissions</h3>
                <p><strong>Client</strong><span>Owns and approves requirements.</span></p>
                <p><strong>Manager</strong><span>Manages users, workflow, and project work.</span></p>
                <p><strong>Team Member</strong><span>Refines assigned requirements.</span></p>
              </section>

              <section className="create-project-page__summary">
                <div className="create-project-page__summary-icon" style={{ background: formData.color }} aria-hidden="true"></div>
                <div>
                  <span>Preview</span>
                  <strong>{formData.name.trim() || 'New Project'}</strong>
                  <p>{formData.description.trim() || 'New requirements workspace'}</p>
                </div>
              </section>
            </aside>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default CreateProject
