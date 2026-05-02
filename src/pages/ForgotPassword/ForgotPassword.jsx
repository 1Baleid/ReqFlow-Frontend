import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import { forgotPassword } from '../../services/authApi'
import '../Login/Login.css'

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setError('Invalid email format')
      return
    }

    setError('')
    setStatus('loading')
    setMessage('')

    try {
      const response = await forgotPassword({ email })
      setStatus('success')
      setMessage(response.message)
    } catch (requestError) {
      setStatus('error')
      setMessage(requestError.message || 'Unable to send reset instructions.')
    }
  }

  return (
    <AuthLayout
      title="Recover access"
      subtitle="Reset access safely without losing your workflow context."
    >
      <div className="login__header">
        <h2 className="login__title">Forgot your password?</h2>
        <p className="login__subtitle">Enter the email you use for ReqFlow and we will continue from there.</p>
      </div>

      <form className="login__form" onSubmit={handleSubmit}>
        <div className="login__field">
          <label className="login__label" htmlFor="forgot-email">Email address</label>
          <div className="login__input-wrapper">
            <span className="login__input-icon material-symbols-outlined">alternate_email</span>
            <input
              id="forgot-email"
              name="email"
              type="email"
              className={`login__input ${error ? 'login__input--error' : ''}`}
              placeholder="name@company.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError('')
                setMessage('')
                if (status !== 'idle') {
                  setStatus('idle')
                }
              }}
              autoComplete="email"
            />
          </div>
          {error && <div className="login__error"><span className="material-symbols-outlined">error</span><span>{error}</span></div>}
        </div>

        {message && (
          <div className={`login__banner ${status === 'success' ? 'login__banner--success' : 'login__banner--error'}`}>
            <span className="material-symbols-outlined">
              {status === 'success' ? 'mark_email_read' : 'priority_high'}
            </span>
            <span>{message}</span>
          </div>
        )}

        <button type="submit" className="login__submit" disabled={status === 'loading'}>
          <span>{status === 'loading' ? 'Sending...' : 'Send Reset Instructions'}</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </form>

      <p className="login__contact">
        Remembered it? <Link to="/login">Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default ForgotPassword
