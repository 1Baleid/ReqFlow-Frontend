import { useState } from 'react'
import Modal from '../Modal'
import Button from '../Button'
import './RejectModal.css'

function RejectModal({ isOpen, onClose, requirementId, requirementTitle, onReject }) {
  const [justification, setJustification] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!justification.trim()) {
      setError('Justification is required to reject a requirement')
      return
    }

    onReject(justification)
    setJustification('')
    setError('')
    onClose()
  }

  const handleClose = () => {
    setJustification('')
    setError('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Requirement"
      subtitle={`Requirement: ${requirementId} ${requirementTitle}`}
      icon="block"
      iconVariant="error"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit}>
            Confirm Rejection
          </Button>
        </>
      }
    >
      <div className="reject-modal__content">
        <div className="reject-modal__field">
          <label className="reject-modal__label">Justification for Rejection</label>
          <textarea
            className={`reject-modal__textarea ${error ? 'reject-modal__textarea--error' : ''}`}
            placeholder="Please provide detailed reasoning for rejecting this requirement..."
            rows={4}
            value={justification}
            onChange={(e) => {
              setJustification(e.target.value)
              if (error) setError('')
            }}
          />
          {error && (
            <div className="reject-modal__error">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default RejectModal
