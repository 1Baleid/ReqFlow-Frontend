import { useNavigate } from 'react-router-dom'
import Avatar from '../Avatar'
import './RequirementCard.css'

const STATUS_STYLES = {
  draft: 'requirement-card__status--draft',
  'under-review': 'requirement-card__status--under-review',
  approved: 'requirement-card__status--approved',
  rejected: 'requirement-card__status--rejected',
  locked: 'requirement-card__status--locked'
}

const STATUS_LABELS = {
  draft: 'Draft',
  'under-review': 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  locked: 'Locked'
}

function RequirementCard({ requirement, onClick }) {
  const navigate = useNavigate()
  const { id, title, status, updatedAt, version, assignee } = requirement

  const handleClick = () => {
    if (onClick) {
      onClick(requirement)
    } else {
      navigate(`/requirements/${id}`)
    }
  }

  const handleMenuClick = (e) => {
    e.stopPropagation()
    // TODO: Show menu dropdown
  }

  // Format the ID (e.g., "REQ-042" -> display as REQ and 042 separately)
  const idParts = id.split('-')
  const idPrefix = idParts[0] || 'REQ'
  const idNumber = idParts[1] || id

  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '-') || 'draft'

  return (
    <div className="requirement-card" onClick={handleClick}>
      {/* ID Badge */}
      <div className="requirement-card__id">
        <span className="requirement-card__id-prefix">{idPrefix}</span>
        <span className="requirement-card__id-number">{idNumber}</span>
      </div>

      {/* Content */}
      <div className="requirement-card__content">
        <div className="requirement-card__header">
          <h3 className="requirement-card__title">{title}</h3>
          <span className={`requirement-card__status ${STATUS_STYLES[normalizedStatus] || ''}`}>
            {STATUS_LABELS[normalizedStatus] || status}
          </span>
        </div>
        <div className="requirement-card__meta">
          <span className="requirement-card__meta-item">
            <span className="material-symbols-outlined">schedule</span>
            {updatedAt}
          </span>
          <span className="requirement-card__meta-item">
            <span className="material-symbols-outlined">account_tree</span>
            V {version}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="requirement-card__actions">
        {assignee && (
          <div className="requirement-card__assignee">
            <Avatar
              src={assignee.avatar}
              name={assignee.name}
              size="sm"
            />
          </div>
        )}
        <button
          className="requirement-card__menu"
          onClick={handleMenuClick}
          aria-label="More options"
        >
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>
    </div>
  )
}

export default RequirementCard
