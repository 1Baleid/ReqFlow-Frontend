import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import { currentUser, requirements } from '../../data/mockData'
import './EditRequirement.css'

// Extended mock data for editable requirements
const editableData = {
  'REQ-042': {
    traceabilityLinks: ['SYS-801', 'UX-12'],
    validationCriteria: [
      'Passes ISO-27001 Security Audit',
      'Load test results verified by DevOps',
      'Documentation signed by Architect'
    ]
  },
  'REQ-039': {
    traceabilityLinks: ['API-101', 'SEC-05'],
    validationCriteria: [
      'Rate limits tested under load',
      'Error responses documented'
    ]
  },
  'REQ-038': {
    traceabilityLinks: ['SEC-01', 'AUTH-03'],
    validationCriteria: [
      'MFA flow tested with TOTP',
      'Hardware key support verified'
    ]
  },
  'REQ-035': {
    traceabilityLinks: [],
    validationCriteria: []
  },
  'REQ-033': {
    traceabilityLinks: ['DB-01', 'MIG-02'],
    validationCriteria: [
      'Data integrity verified',
      'Rollback plan documented'
    ]
  }
}

function EditRequirement() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Find the requirement
  const requirement = requirements.find(r => r.id === id) || {
    id: id,
    title: 'Unknown Requirement',
    description: '',
    status: 'draft',
    version: '1.0'
  }

  // Get extended edit data
  const extraData = editableData[id] || { traceabilityLinks: [], validationCriteria: [] }

  const editData = {
    title: requirement.title || '',
    description: requirement.description || '',
    createdBy: requirement.createdBy || { name: 'Unknown', avatar: null },
    lastModified: requirement.updatedAt || 'Unknown',
    traceabilityLinks: extraData.traceabilityLinks,
    validationCriteria: extraData.validationCriteria
  }

  const [title, setTitle] = useState(editData.title)
  const [description, setDescription] = useState(editData.description)
  const [versionNote, setVersionNote] = useState('')
  const [showToast, setShowToast] = useState(false)

  const normalizedStatus = requirement.status?.toLowerCase().replace(/\s+/g, '-') || 'draft'
  const isLocked = normalizedStatus !== 'draft'

  const handleDiscard = () => {
    navigate(`/requirements/${id}`)
  }

  const handleSave = () => {
    // Simulate save action
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const calculateProgress = () => {
    let progress = 0
    if (title.length > 0) progress += 33
    if (description.length > 50) progress += 34
    if (versionNote.length > 0) progress += 33
    return progress
  }

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
      <div className="edit-req">
        {/* Header */}
        <section className="edit-req__header">
          <div className="edit-req__header-left">
            <div className="edit-req__header-meta">
              <span className="edit-req__id">{requirement.id}</span>
              <span className="edit-req__status">Draft</span>
            </div>
            <h2 className="edit-req__title">Edit Requirement</h2>
          </div>
          <div className="edit-req__header-actions">
            <button className="edit-req__discard-btn" onClick={handleDiscard}>
              Discard Changes
            </button>
            <Button variant="primary" onClick={handleSave}>
              Save Version
            </Button>
          </div>
        </section>

        {/* Success Toast */}
        {showToast && (
          <div className="edit-req__toast">
            <span className="material-symbols-outlined edit-req__toast-icon">check_circle</span>
            <p className="edit-req__toast-text">Draft saved successfully</p>
            <button className="edit-req__toast-close" onClick={() => setShowToast(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Content Grid */}
        <div className="edit-req__grid">
          {/* Left Column: Primary Editor */}
          <div className="edit-req__main">
            {/* Title & Description Card */}
            <div className="edit-req__card">
              <div className="edit-req__field">
                <label className="edit-req__label">Requirement Title</label>
                <input
                  type="text"
                  className="edit-req__title-input"
                  placeholder="Enter title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="edit-req__progress-bar">
                  <div
                    className="edit-req__progress-fill"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </div>

              <div className="edit-req__field">
                <label className="edit-req__label">Description</label>
                <textarea
                  className="edit-req__description-input"
                  placeholder="Describe the technical requirements and constraints..."
                  rows="8"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Version Summary */}
            <div className="edit-req__version-card">
              <div className="edit-req__version-header">
                <span className="material-symbols-outlined">history</span>
                <label className="edit-req__label">Version Summary / Change Note</label>
              </div>
              <input
                type="text"
                className="edit-req__version-input"
                placeholder="Explain what changed in this draft (e.g., 'Updated latency benchmarks')..."
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column: Context */}
          <div className="edit-req__sidebar">
            {/* Locked Section */}
            {editData.validationCriteria.length > 0 && (
              <div className="edit-req__locked-section">
                <div className="edit-req__locked-overlay">
                  <div className="edit-req__locked-icon-wrapper">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <p className="edit-req__locked-title">Section Locked</p>
                  <p className="edit-req__locked-text">
                    This section is read-only because the requirement has moved to Under Review
                  </p>
                </div>
                <div className="edit-req__locked-content">
                  <h4 className="edit-req__sidebar-title">Validation Criteria</h4>
                  <ul className="edit-req__criteria-list">
                    {editData.validationCriteria.map((criteria, index) => (
                      <li key={index} className="edit-req__criteria-item">
                        <span className="material-symbols-outlined">check</span>
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Meta Data */}
            <div className="edit-req__meta-grid">
              <div className="edit-req__meta-card edit-req__meta-card--tertiary">
                <p className="edit-req__meta-label">Created By</p>
                <div className="edit-req__meta-author">
                  <div className="edit-req__meta-avatar">
                    {editData.createdBy.name.charAt(0)}
                  </div>
                  <span className="edit-req__meta-value">{editData.createdBy.name}</span>
                </div>
              </div>

              <div className="edit-req__meta-card">
                <p className="edit-req__meta-label">Last Modified</p>
                <p className="edit-req__meta-value">{editData.lastModified}</p>
              </div>

              {editData.traceabilityLinks.length > 0 && (
                <div className="edit-req__meta-card edit-req__meta-card--secondary">
                  <p className="edit-req__meta-label">Traceability Link</p>
                  <div className="edit-req__meta-tags">
                    {editData.traceabilityLinks.map((link, index) => (
                      <span key={index} className="edit-req__meta-tag">{link}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default EditRequirement
