import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import { useProjectData } from '../../context/ProjectDataContext'
import {
  getRequirement as getRequirementApi,
  listRequirementVersions as listRequirementVersionsApi
} from '../../services/requirementsApi'
import './VersionHistory.css'

const SNAPSHOT_FIELDS = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'type', label: 'Requirement Type' },
  { key: 'priority', label: 'Priority' },
  { key: 'acceptanceCriteria', label: 'Acceptance Criteria' },
  { key: 'linkedRequirementIds', label: 'Linked Requirements' }
]

function formatSnapshotValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join('\n') : 'None'
  }

  if (value === null || value === undefined || value === '') {
    return 'None'
  }

  return String(value)
}

function VersionHistory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, getRequirementById } = useProjectData()
  const [apiRequirement, setApiRequirement] = useState(null)
  const [apiVersions, setApiVersions] = useState(null)
  const [loadError, setLoadError] = useState('')
  const requirement = apiRequirement || getRequirementById(id)

  const versions = useMemo(
    () => [...(apiVersions || requirement?.versions || [])].sort((leftVersion, rightVersion) => leftVersion.versionNumber - rightVersion.versionNumber),
    [apiVersions, requirement?.versions]
  )

  const [selectedVersions, setSelectedVersions] = useState([])

  useEffect(() => {
    if (versions.length >= 2) {
      setSelectedVersions([versions[versions.length - 2].id, versions[versions.length - 1].id])
      return
    }

    if (versions.length === 1) {
      setSelectedVersions([versions[0].id])
      return
    }

    setSelectedVersions([])
  }, [versions])

  useEffect(() => {
    let isMounted = true

    async function loadBackendVersions() {
      setLoadError('')

      try {
        const [requirementResult, versionsResult] = await Promise.all([
          getRequirementApi(id),
          listRequirementVersionsApi(id)
        ])

        if (isMounted) {
          setApiRequirement(requirementResult.requirement)
          setApiVersions(versionsResult.versions)
        }
      } catch (error) {
        if (isMounted && !(error instanceof TypeError)) {
          setLoadError(error.message || 'Unable to load backend versions.')
        }
      }
    }

    loadBackendVersions()

    return () => {
      isMounted = false
    }
  }, [id])

  const sourceVersion = versions.find((version) => version.id === selectedVersions[0])
  const targetVersion = versions.find((version) => version.id === selectedVersions[1])

  const comparisonRows = useMemo(() => {
    if (!sourceVersion || !targetVersion) {
      return []
    }

    return SNAPSHOT_FIELDS.map((field) => {
      const sourceValue = formatSnapshotValue(sourceVersion.snapshot?.[field.key])
      const targetValue = formatSnapshotValue(targetVersion.snapshot?.[field.key])
      return {
        key: field.key,
        label: field.label,
        sourceValue,
        targetValue,
        hasChanged: sourceValue !== targetValue
      }
    })
  }, [sourceVersion, targetVersion])

  const handleBack = () => {
    navigate(`/requirements/${id}`)
  }

  const toggleVersion = (versionId) => {
    setSelectedVersions((previousSelection) => {
      if (previousSelection.includes(versionId)) {
        return previousSelection.filter((currentVersionId) => currentVersionId !== versionId)
      }

      if (previousSelection.length >= 2) {
        return [previousSelection[1], versionId]
      }

      return [...previousSelection, versionId]
    })
  }

  if (!requirement) {
    return (
      <MainLayout user={currentUser} role={currentUser.role}>
        <div className="version-history">
          <div className="version-history__title-section">
            <div className="version-history__title-content">
              <h1 className="version-history__title">Version History</h1>
              <p className="version-history__description">Requirement was not found.</p>
            </div>
            <div className="version-history__actions">
              <Button variant="secondary" onClick={handleBack}>
                Back
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
      <div className="version-history">
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

        <div className="version-history__title-section">
          <div className="version-history__title-content">
            <h1 className="version-history__title">Version History</h1>
            <p className="version-history__description">
              Select two versions to compare requirement changes in read-only mode.
            </p>
            {loadError && (
              <p className="version-history__description" style={{ color: '#c62828' }}>
                {loadError}
              </p>
            )}
          </div>
          <div className="version-history__actions">
            <Button variant="secondary" icon="history">
              {versions.length} Versions
            </Button>
          </div>
        </div>

        <div className="version-history__grid">
          <div className="version-history__versions">
            <div className="version-history__versions-list">
              {versions.length === 0 && (
                <div className="version-history__version-item">
                  <p className="version-history__version-summary">No versions found for this requirement.</p>
                </div>
              )}

              {versions.slice().reverse().map((version) => (
                <div
                  key={version.id}
                  className={`version-history__version-item ${selectedVersions.includes(version.id) ? 'version-history__version-item--selected' : ''}`}
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
                    {version.versionNumber === versions[versions.length - 1]?.versionNumber && (
                      <span className="version-history__version-badge">Current</span>
                    )}
                    <span className="version-history__version-label">{version.label}</span>
                  </div>
                  <div className="version-history__version-author">
                    <div className="version-history__version-avatar">
                      {String(version.actorName || 'S').charAt(0)}
                    </div>
                    <span className="version-history__version-name">{version.actorName || 'System'}</span>
                    <span className="version-history__version-date">
                      • {new Date(version.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="version-history__version-summary">{version.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="version-history__comparison">
            <div className="version-history__comparison-header">
              <div className="version-history__comparison-versions">
                <div className="version-history__comparison-version">
                  <span className="version-history__comparison-label">Source Version</span>
                  <div className="version-history__comparison-value">
                    <span className="version-history__comparison-dot version-history__comparison-dot--source" />
                    <span>{sourceVersion?.label || 'Not selected'}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined version-history__comparison-arrow">trending_flat</span>
                <div className="version-history__comparison-version">
                  <span className="version-history__comparison-label">Target Version</span>
                  <div className="version-history__comparison-value">
                    <span className="version-history__comparison-dot version-history__comparison-dot--target" />
                    <span>{targetVersion?.label || 'Not selected'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="version-history__diff">
              {comparisonRows.length === 0 && (
                <div className="version-history__diff-section">
                  <h4 className="version-history__diff-title">
                    <span className="material-symbols-outlined">info</span>
                    Select Two Versions
                  </h4>
                  <p className="version-history__version-summary">
                    Comparison requires at least two selected versions.
                  </p>
                </div>
              )}

              {comparisonRows.map((row) => (
                <div key={row.key} className="version-history__diff-section">
                  <h4 className="version-history__diff-title">
                    <span className="material-symbols-outlined">{row.hasChanged ? 'change_circle' : 'check_circle'}</span>
                    {row.label}
                  </h4>
                  <div className="version-history__diff-grid">
                    <div className="version-history__diff-divider" />
                    <div className="version-history__diff-col">
                      <div className={`version-history__diff-block ${row.hasChanged ? 'version-history__diff-block--removed' : 'version-history__diff-block--neutral'}`}>
                        <p className="version-history__diff-text" style={{ whiteSpace: 'pre-wrap' }}>{row.sourceValue}</p>
                      </div>
                    </div>
                    <div className="version-history__diff-col">
                      <div className={`version-history__diff-block ${row.hasChanged ? 'version-history__diff-block--added' : 'version-history__diff-block--neutral'}`}>
                        <p className="version-history__diff-text" style={{ whiteSpace: 'pre-wrap' }}>{row.targetValue}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="version-history__comparison-footer">
              <Button variant="secondary" onClick={handleBack}>
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default VersionHistory
