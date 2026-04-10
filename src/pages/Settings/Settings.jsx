import { useState } from 'react'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import { currentUser } from '../../data/mockData'
import './Settings.css'

// Workflow stages
const initialStages = [
  {
    id: 'draft',
    name: 'Draft',
    description: 'Initial creation phase',
    isSystemRequired: true,
    isEditable: false
  },
  {
    id: 'under-review',
    name: 'Under Review',
    description: 'Internal peer assessment',
    isSystemRequired: false,
    isEditable: true
  },
  {
    id: 'revision',
    name: 'Revision Required',
    description: 'Corrections pending from author',
    isSystemRequired: false,
    isEditable: true
  },
  {
    id: 'approved',
    name: 'Approved',
    description: 'Finalized and baseline-ready',
    isSystemRequired: true,
    isEditable: false
  }
]

// Transition rules
const initialRules = [
  {
    id: 'rule-1',
    title: 'Require signature for Approval',
    description: 'Requires a high-level digital signature from a designated manager before a requirement can transition to the \'Approved\' state.',
    enabled: true
  },
  {
    id: 'rule-2',
    title: 'Auto-archive on Approved',
    description: 'Automatically move historical versions of this requirement to the archive once the current version is finalized.',
    enabled: false
  },
  {
    id: 'rule-3',
    title: 'Mandatory Peer Review',
    description: 'Enforces at least two unique peer signatures during the \'Under Review\' stage.',
    enabled: true
  }
]

function Settings() {
  const [stages, setStages] = useState(initialStages)
  const [rules, setRules] = useState(initialRules)
  const [showToast, setShowToast] = useState(false)

  const handleStageNameChange = (id, newName) => {
    setStages(stages.map(stage =>
      stage.id === id ? { ...stage, name: newName } : stage
    ))
  }

  const handleDeleteStage = (id) => {
    setStages(stages.filter(stage => stage.id !== id))
  }

  const handleToggleRule = (id) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ))
  }

  const handleSave = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleDiscard = () => {
    setStages(initialStages)
    setRules(initialRules)
  }

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
      <div className="settings">
        {/* Toast */}
        {showToast && (
          <div className="settings__toast">
            <span className="material-symbols-outlined settings__toast-icon">check_circle</span>
            <span className="settings__toast-text">Configuration Saved Successfully</span>
            <button className="settings__toast-close" onClick={() => setShowToast(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="settings__header">
          <span className="settings__breadcrumb">Governance & Control</span>
          <h1 className="settings__title">Workflow Settings</h1>
          <p className="settings__subtitle">
            Define the lifecycle of your requirements. Stages and transition rules ensure consistent quality across Project Alpha.
          </p>
        </div>

        {/* Lifecycle Stages */}
        <section className="settings__card">
          <div className="settings__card-header">
            <div className="settings__card-header-left">
              <h3 className="settings__card-title">Lifecycle Stages</h3>
              <p className="settings__card-subtitle">Reorder or add stages to your workflow.</p>
            </div>
            <button className="settings__add-btn">
              <span className="material-symbols-outlined">add</span>
              Add Stage
            </button>
          </div>

          <div className="settings__stages">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`settings__stage ${stage.isSystemRequired ? 'settings__stage--locked' : ''}`}
              >
                <div className="settings__stage-left">
                  <span className={`material-symbols-outlined settings__stage-drag ${stage.isSystemRequired ? 'settings__stage-drag--disabled' : ''}`}>
                    drag_indicator
                  </span>
                  <div className="settings__stage-info">
                    <div className="settings__stage-name-row">
                      {stage.isEditable ? (
                        <input
                          type="text"
                          className="settings__stage-input"
                          value={stage.name}
                          onChange={(e) => handleStageNameChange(stage.id, e.target.value)}
                        />
                      ) : (
                        <span className="settings__stage-name">{stage.name}</span>
                      )}
                      {stage.isSystemRequired && (
                        <span className="settings__stage-badge">System Required</span>
                      )}
                    </div>
                    <p className="settings__stage-desc">{stage.description}</p>
                  </div>
                </div>
                <div className="settings__stage-actions">
                  {stage.isSystemRequired ? (
                    <span className="material-symbols-outlined settings__stage-lock">lock</span>
                  ) : (
                    <button
                      className="settings__stage-delete"
                      onClick={() => handleDeleteStage(stage.id)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Transition Rules */}
        <section className="settings__rules-wrapper">
          <div className="settings__rules-card">
            <h3 className="settings__card-title">Transition Rules</h3>
            <div className="settings__rules">
              {rules.map((rule, index) => (
                <div key={rule.id}>
                  <div className="settings__rule">
                    <div className="settings__rule-info">
                      <h4 className="settings__rule-title">{rule.title}</h4>
                      <p className="settings__rule-desc">{rule.description}</p>
                    </div>
                    <label className="settings__toggle">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule.id)}
                        className="settings__toggle-input"
                      />
                      <span className="settings__toggle-slider"></span>
                    </label>
                  </div>
                  {index < rules.length - 1 && <div className="settings__rule-divider"></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Actions */}
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
