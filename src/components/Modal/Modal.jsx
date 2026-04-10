import { useEffect } from 'react'
import './Modal.css'

function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconVariant = 'default', // 'default', 'error', 'success', 'warning'
  size = 'medium', // 'small', 'medium', 'large'
  children,
  footer
}) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal__overlay" onClick={handleOverlayClick}>
      <div className={`modal modal--${size}`}>
        {/* Header */}
        <div className="modal__header">
          <div className="modal__header-content">
            {icon && (
              <div className={`modal__icon modal__icon--${iconVariant}`}>
                <span className="material-symbols-outlined">{icon}</span>
              </div>
            )}
            <div className="modal__header-text">
              <h3 className="modal__title">{title}</h3>
              {subtitle && <p className="modal__subtitle">{subtitle}</p>}
            </div>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Close modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
