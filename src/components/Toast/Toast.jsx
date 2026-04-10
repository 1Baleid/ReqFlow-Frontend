import { useEffect } from 'react'
import './Toast.css'

function Toast({
  isOpen,
  onClose,
  title,
  message,
  variant = 'success', // 'success', 'error', 'warning', 'info'
  duration = 5000,
  showUndo = false,
  onUndo
}) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  }

  return (
    <div className={`toast toast--${variant}`}>
      <span
        className="material-symbols-outlined toast__icon"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icons[variant]}
      </span>
      <div className="toast__content">
        <p className="toast__title">{title}</p>
        {message && <p className="toast__message">{message}</p>}
      </div>
      {showUndo && onUndo && (
        <>
          <div className="toast__divider" />
          <button className="toast__undo" onClick={onUndo}>
            Undo
          </button>
        </>
      )}
      <button className="toast__close" onClick={onClose}>
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  )
}

export default Toast
