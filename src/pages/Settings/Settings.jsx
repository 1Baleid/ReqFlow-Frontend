import { useEffect, useState } from 'react'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import { useProjectData } from '../../context/ProjectDataContext'
import './Settings.css'

function Settings() {
  const {
    currentUser,
    workflowStages,
    setWorkflowStages
  } = useProjectData()

  const [editableStages, setEditableStages] = useState(workflowStages)
  const [showToast, setShowToast] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setEditableStages(workflowStages)
  }, [workflowStages])

  const handleStageLabelChange = (stageId, label) => {
    setEditableStages((previousStages) =>
      previousStages.map((stage) =>
        stage.id === stageId ? { ...stage, label } : stage
      )
    )
  }

  const handleSave = () => {
    const saveResult = setWorkflowStages(editableStages, currentUser.name)

    if (!saveResult.ok) {
      setErrorMessage(saveResult.error || 'Unable to save workflow configuration.')
      return
    }

    setErrorMessage('')
    setShowToast(true)
    window.setTimeout(() => setShowToast(false), 3000)
  }

  const handleDiscard = () => {
    setEditableStages(workflowStages)
    setErrorMessage('')
  }

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
      <div className="settings">
        {showToast && (
          <div className="settings__toast">
            <span className="material-symbols-outlined settings__toast-icon">check_circle</span>
            <span className="settings__toast-text">Workflow configuration saved and applied.</span>
            <button className="settings__toast-close" onClick={() => setShowToast(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        <div className="settings__header">
          <span className="settings__breadcrumb">Governance & Control</span>
          <h1 className="settings__title">Workflow Settings</h1>
          <p className="settings__subtitle">
            Manage visibility labels for Draft, Review, Approved, and Rejected stages.
            Draft and Approved must always remain available.
          </p>
        </div>

        <section className="settings__card">
          <div className="settings__card-header">
            <div className="settings__card-header-left">
              <h3 className="settings__card-title">Workflow Stages</h3>
              <p className="settings__card-subtitle">
                Update stage labels used across requirement lists and dashboards.
              </p>
              <p className="settings__edit-hint">
                <span className="material-symbols-outlined">edit</span>
                Edit the <strong>Visibility Label</strong> field in each row, then save.
              </p>
            </div>
          </div>

          <div className="settings__stages">
            {editableStages.map((stage) => {
              const isRequiredStage = stage.id === 'draft' || stage.id === 'approved'
              return (
                <div key={stage.id} className={`settings__stage ${isRequiredStage ? 'settings__stage--locked' : ''}`}>
                  <div className="settings__stage-left">
                    <span className="material-symbols-outlined settings__stage-drag settings__stage-drag--disabled">
                      account_tree
                    </span>
                    <div className="settings__stage-info">
                      <div className="settings__stage-field-label">
                        <span>Visibility Label</span>
                        <span className="material-symbols-outlined">edit</span>
                      </div>
                      <div className="settings__stage-name-row">
                        <input
                          type="text"
                          className={`settings__stage-input ${isRequiredStage ? 'settings__stage-input--system' : ''}`}
                          value={stage.label}
                          onChange={(event) => handleStageLabelChange(stage.id, event.target.value)}
                          placeholder="Stage label"
                        />
                        {isRequiredStage && (
                          <span className="settings__stage-badge">Required</span>
                        )}
                      </div>
                      <p className="settings__stage-desc">{stage.description}</p>
                    </div>
                  </div>
                  <div className="settings__stage-actions">
                    {isRequiredStage && (
                      <span className="material-symbols-outlined settings__stage-lock">lock</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {errorMessage && (
          <div className="settings__error">
            <span className="material-symbols-outlined">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="settings__footer">
          <button className="settings__discard-btn" onClick={handleDiscard}>
            Discard Changes
          </button>
          <Button variant="primary" onClick={handleSave}>
            Save Workflow Configuration
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}

export default Settings
