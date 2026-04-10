import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import './VersionHistory.css'

// Mock version history data
const mockVersions = {
  'REQ-042': {
    title: 'Cloud Data Encryption Protocol',
    versions: [
      {
        id: 'v3',
        label: 'V3',
        isCurrent: true,
        author: { name: 'Marcus Thorne', avatar: null },
        date: 'Oct 24, 10:45 AM',
        summary: 'Refined security handshake protocols and added OAuth2 failure state logic.'
      },
      {
        id: 'v2',
        label: 'V2',
        isCurrent: false,
        author: { name: 'Elena Rodriguez', avatar: null },
        date: 'Oct 22, 02:15 PM',
        summary: 'Initial draft for the multi-factor authentication flow implementation.'
      },
      {
        id: 'v1',
        label: 'V1',
        isCurrent: false,
        author: { name: 'Sarah Jenkins', avatar: null },
        date: 'Oct 20, 09:00 AM',
        summary: 'Baseline requirement creation from stakeholder workshop notes.'
      }
    ],
    comparison: {
      sections: [
        {
          id: 's1',
          title: '1.0 Business Logic Refinement',
          icon: 'subject',
          changes: [
            {
              type: 'removed',
              oldText: 'The user must enter a 6-digit code sent via SMS to verify their identity before proceeding to the dashboard.'
            },
            {
              type: 'added',
              newText: 'The system shall support TOTP (Time-based One-Time Password) via authenticator apps as the primary MFA method, with SMS as a secondary fallback only.'
            },
            {
              type: 'modified',
              oldText: 'If the code is incorrect, the system should allow up to 3 retries.',
              newText: 'If the code is incorrect, the system should allow up to 3 retries',
              highlight: 'per 15-minute window'
            }
          ]
        },
        {
          id: 's2',
          title: '2.0 Technical Constraints',
          icon: 'security',
          changes: [
            {
              type: 'inline-modified',
              text: 'Sessions are valid for',
              removed: '2 hours',
              added: '30 minutes',
              suffix: 'of inactivity.'
            },
            {
              type: 'added',
              newText: 'Requirement RF-742.B: Implement JWT rotation for every high-privilege action within the session.',
              isNew: true
            }
          ]
        }
      ],
      metadata: {
        priority: { old: 'Medium', new: 'High' },
        owner: { old: 'Elena R.', new: 'Marcus A.' },
        compliance: { old: 'None', new: 'ISO-27001' }
      }
    }
  }
}

function VersionHistory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedVersions, setSelectedVersions] = useState(['v3', 'v2'])

  const requirement = mockVersions[id] || mockVersions['REQ-042']
  const versions = requirement.versions

  const handleBack = () => {
    navigate(`/requirements/${id}`)
  }

  const toggleVersion = (versionId) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(v => v !== versionId)
      }
      if (prev.length >= 2) {
        return [prev[1], versionId]
      }
      return [...prev, versionId]
    })
  }

  const sourceVersion = versions.find(v => v.id === selectedVersions[0])
  const targetVersion = versions.find(v => v.id === selectedVersions[1])

  return (
    <MainLayout>
      <div className="version-history">
        {/* Page Header */}
        <div className="version-history__header">
          <div className="version-history__header-left">
            <button className="version-history__back" onClick={handleBack}>
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Back to Requirement</span>
            </button>
            <div className="version-history__divider" />
            <span className="version-history__req-title">{id}: {requirement.title}</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="version-history__title-section">
          <div className="version-history__title-content">
            <h1 className="version-history__title">Version History</h1>
            <p className="version-history__description">
              Review and compare previous iterations of this requirement. Select two versions to visualize precise delta changes.
            </p>
          </div>
          <div className="version-history__actions">
            <Button variant="secondary" icon="download">
              Export Log
            </Button>
            <Button variant="primary" icon="compare_arrows">
              Compare Selected
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="version-history__grid">
          {/* Version List */}
          <div className="version-history__versions">
            <div className="version-history__versions-list">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`version-history__version-item ${
                    selectedVersions.includes(version.id) ? 'version-history__version-item--selected' : ''
                  } ${version.isCurrent ? '' : 'version-history__version-item--past'}`}
                  onClick={() => toggleVersion(version.id)}
                >
                  <div className="version-history__version-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedVersions.includes(version.id)}
                      onChange={() => toggleVersion(version.id)}
                    />
                  </div>
                  <div className="version-history__version-header">
                    {version.isCurrent && (
                      <span className="version-history__version-badge">Current</span>
                    )}
                    <span className="version-history__version-label">{version.label}</span>
                  </div>
                  <div className="version-history__version-author">
                    <div className="version-history__version-avatar">
                      {version.author.name.charAt(0)}
                    </div>
                    <span className="version-history__version-name">{version.author.name}</span>
                    <span className="version-history__version-date">• {version.date}</span>
                  </div>
                  <p className="version-history__version-summary">{version.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison View */}
          <div className="version-history__comparison">
            {/* Comparison Header */}
            <div className="version-history__comparison-header">
              <div className="version-history__comparison-versions">
                <div className="version-history__comparison-version">
                  <span className="version-history__comparison-label">Source Version</span>
                  <div className="version-history__comparison-value">
                    <span className="version-history__comparison-dot version-history__comparison-dot--source" />
                    <span>{sourceVersion?.label}: {sourceVersion?.summary.slice(0, 20)}...</span>
                  </div>
                </div>
                <span className="material-symbols-outlined version-history__comparison-arrow">trending_flat</span>
                <div className="version-history__comparison-version">
                  <span className="version-history__comparison-label">Target Version</span>
                  <div className="version-history__comparison-value">
                    <span className="version-history__comparison-dot version-history__comparison-dot--target" />
                    <span>{targetVersion?.label}: {targetVersion?.summary.slice(0, 20)}...</span>
                  </div>
                </div>
              </div>
              <div className="version-history__comparison-tools">
                <button className="version-history__tool-btn">
                  <span className="material-symbols-outlined">zoom_in</span>
                </button>
                <button className="version-history__tool-btn">
                  <span className="material-symbols-outlined">fullscreen</span>
                </button>
              </div>
            </div>

            {/* Diff Content */}
            <div className="version-history__diff">
              {requirement.comparison.sections.map((section) => (
                <div key={section.id} className="version-history__diff-section">
                  <h4 className="version-history__diff-title">
                    <span className="material-symbols-outlined">{section.icon}</span>
                    {section.title}
                  </h4>
                  <div className="version-history__diff-grid">
                    <div className="version-history__diff-divider" />

                    {/* Left Side (Old) */}
                    <div className="version-history__diff-col">
                      {section.changes.map((change, idx) => (
                        <div key={idx}>
                          {change.type === 'removed' && (
                            <div className="version-history__diff-block version-history__diff-block--removed">
                              <p className="version-history__diff-text version-history__diff-text--removed">
                                {change.oldText}
                              </p>
                            </div>
                          )}
                          {change.type === 'modified' && (
                            <div className="version-history__diff-block version-history__diff-block--neutral">
                              <p className="version-history__diff-text">{change.oldText}</p>
                            </div>
                          )}
                          {change.type === 'inline-modified' && (
                            <div className="version-history__diff-block version-history__diff-block--neutral">
                              <p className="version-history__diff-text">
                                {change.text} <span className="version-history__diff-removed">{change.removed}</span> {change.suffix}
                              </p>
                            </div>
                          )}
                          {change.type === 'added' && !change.isNew && (
                            <div className="version-history__diff-block version-history__diff-block--empty" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Right Side (New) */}
                    <div className="version-history__diff-col">
                      {section.changes.map((change, idx) => (
                        <div key={idx}>
                          {change.type === 'removed' && (
                            <div className="version-history__diff-block version-history__diff-block--empty" />
                          )}
                          {change.type === 'added' && (
                            <div className="version-history__diff-block version-history__diff-block--added">
                              <p className="version-history__diff-text">{change.newText}</p>
                            </div>
                          )}
                          {change.type === 'modified' && (
                            <div className="version-history__diff-block version-history__diff-block--neutral">
                              <p className="version-history__diff-text">
                                {change.newText} <span className="version-history__diff-added">{change.highlight}</span>.
                              </p>
                            </div>
                          )}
                          {change.type === 'inline-modified' && (
                            <div className="version-history__diff-block version-history__diff-block--neutral">
                              <p className="version-history__diff-text">
                                {change.text} <span className="version-history__diff-added">{change.added}</span> {change.suffix}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Metadata Changes */}
              <div className="version-history__metadata">
                <div className="version-history__metadata-header">
                  <span className="material-symbols-outlined">label</span>
                  <span>Metadata Updates</span>
                </div>
                <div className="version-history__metadata-grid">
                  <div className="version-history__metadata-item">
                    <span className="version-history__metadata-label">Priority</span>
                    <div className="version-history__metadata-value">
                      <span className="version-history__metadata-old">{requirement.comparison.metadata.priority.old}</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                      <span className="version-history__metadata-badge version-history__metadata-badge--high">
                        {requirement.comparison.metadata.priority.new}
                      </span>
                    </div>
                  </div>
                  <div className="version-history__metadata-item">
                    <span className="version-history__metadata-label">Owner</span>
                    <div className="version-history__metadata-value">
                      <span className="version-history__metadata-old">{requirement.comparison.metadata.owner.old}</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                      <span className="version-history__metadata-new">{requirement.comparison.metadata.owner.new}</span>
                    </div>
                  </div>
                  <div className="version-history__metadata-item">
                    <span className="version-history__metadata-label">Compliance Tag</span>
                    <div className="version-history__metadata-value">
                      <span className="version-history__metadata-none">{requirement.comparison.metadata.compliance.old}</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                      <span className="version-history__metadata-badge version-history__metadata-badge--compliance">
                        {requirement.comparison.metadata.compliance.new}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Footer */}
            <div className="version-history__comparison-footer">
              <Button variant="secondary" onClick={handleBack}>
                Cancel
              </Button>
              <Button variant="primary">
                Restore Version {sourceVersion?.label}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default VersionHistory
