import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import TextInput from '../../components/TextInput'
import TextArea from '../../components/TextArea'
import Select from '../../components/Select'
import Button from '../../components/Button'
import { getCurrentUser } from '../../data/mockData'
import Toast from '../../components/Toast'
import './CreateRequirement.css'

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
]

const statusOptions = [
  { value: 'draft', label: 'Draft' }
]

const typeOptions = [
  { value: 'functional', label: 'Functional' },
  { value: 'non-functional', label: 'Non-Functional' }
]

function CreateRequirement() {
  const currentUser = getCurrentUser()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    status: 'draft',
    priority: 'medium',
    type: 'functional',
    description: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Requirement title cannot be empty'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setShowToast(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      navigate('/requirements')
    }, 1000)
  }

  const handleCancel = () => {
    navigate('/requirements')
  }

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
      <Toast
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        title="Requirement Created"
        message="Your requirement has been saved as a draft."
        variant="success"
        duration={1000}
      />

      {/* Breadcrumb */}
      <Link to="/requirements" className="create-req__breadcrumb">
        <span className="material-symbols-outlined">arrow_back</span>
        Back to My Requirements
      </Link>

      {/* Page Title */}
      <div className="create-req__header">
        <h1 className="create-req__title">Create New Requirement</h1>
        <p className="create-req__subtitle">
          Define a new functional or non-functional requirement for Project Alpha.
        </p>
      </div>

      {/* Main Content */}
      <div className="create-req__content">
        {/* Form */}
        <form className="create-req__form" onSubmit={handleSubmit}>
          <div className="create-req__form-card">
            {/* Title */}
            <TextInput
              label="Requirement Title"
              name="title"
              id="title"
              placeholder="e.g., User Authentication via OIDC"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
            />

            {/* Status, Priority & Type Row */}
            <div className="create-req__row">
              <Select
                label="Status"
                name="status"
                id="status"
                icon="draft"
                options={statusOptions}
                value={formData.status}
                onChange={handleChange}
              />
              <Select
                label="Priority"
                name="priority"
                id="priority"
                options={priorityOptions}
                value={formData.priority}
                onChange={handleChange}
              />
              <Select
                label="Type"
                name="type"
                id="type"
                icon="category"
                options={typeOptions}
                value={formData.type}
                onChange={handleChange}
              />
            </div>

            <p className="create-req__hint">
              New requirements always start in draft status.
            </p>

            {/* Description */}
            <TextArea
              label="Detailed Description"
              name="description"
              id="description"
              placeholder="Describe the goal, context, and acceptance criteria..."
              value={formData.description}
              onChange={handleChange}
              rows={8}
              showToolbar
            />
          </div>

          {/* Actions */}
          <div className="create-req__actions">
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon="save"
              iconPosition="left"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </Button>
          </div>
        </form>

        {/* Sidebar Tips */}
        <aside className="create-req__sidebar">
          {/* Quality Tips */}
          <div className="create-req__tips">
            <h3 className="create-req__tips-title">
              <span className="material-symbols-outlined">lightbulb</span>
              Requirement Quality Tips
            </h3>

            <div className="create-req__tip">
              <div className="create-req__tip-number">
                <span>01</span>
              </div>
              <div>
                <h4 className="create-req__tip-heading">Be Specific</h4>
                <p className="create-req__tip-text">
                  Avoid vague terms like "fast" or "user-friendly". Use measurable metrics where possible.
                </p>
              </div>
            </div>

            <div className="create-req__tip">
              <div className="create-req__tip-number">
                <span>02</span>
              </div>
              <div>
                <h4 className="create-req__tip-heading">Atomicity</h4>
                <p className="create-req__tip-text">
                  Each requirement should cover a single functionality to simplify testing and traceability.
                </p>
              </div>
            </div>

            <div className="create-req__tip">
              <div className="create-req__tip-number">
                <span>03</span>
              </div>
              <div>
                <h4 className="create-req__tip-heading">The 'Who' & 'Why'</h4>
                <p className="create-req__tip-text">
                  Clearly state which persona benefits from this and what value it creates for the business.
                </p>
              </div>
            </div>
          </div>

          {/* Template Card */}
          <div className="create-req__template-card">
            <h4 className="create-req__template-title">Need a Template?</h4>
            <p className="create-req__template-text">
              Use our predefined structure for functional and non-functional requirements.
            </p>
            <button className="create-req__template-btn">
              Browse Templates
            </button>
          </div>
        </aside>
      </div>
    </MainLayout>
  )
}

export default CreateRequirement
