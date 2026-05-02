import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import { setStoredAuthSession, getDefaultRouteForRole } from '../../member-a-auth-entry/session'
import { registerUser } from '../../services/authApi'
import '../Login/Login.css'

const ROLE_OPTIONS = [
  { value: 'client', label: 'Client' },
  { value: 'member', label: 'Team Member' },
  { value: 'manager', label: 'Manager' }
]

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'client',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverMessage, setServerMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previousState) => ({
      ...previousState,
      [name]: value
    }))

    if (errors[name]) {
      setErrors((previousState) => ({
        ...previousState,
        [name]: ''
      }))
    }

    if (serverMessage) {
      setServerMessage('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!formData.name.trim()) {
      nextErrors.name = 'Full name is required'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      nextErrors.email = 'Invalid email format'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsLoading(true)
    setServerMessage('')

    try {
      const payload = await registerUser(formData)
      setStoredAuthSession({
        token: payload.token,
        user: payload.user
      })
      navigate(getDefaultRouteForRole(payload.user.role), { replace: true })
    } catch (error) {
      setServerMessage(error.message || 'Unable to create your account.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up a ReqFlow workspace identity and continue into the product."
    >
      <div className="login__header">
        <h2 className="login__title">Create your account</h2>
        <p className="login__subtitle">Use a real email so your team can assign and track work with you.</p>
      </div>

      <form className="login__form" onSubmit={handleSubmit}>
        <div className="login__field">
          <label className="login__label" htmlFor="name">Full name</label>
          <div className="login__input-wrapper">
            <span className="login__input-icon material-symbols-outlined">person</span>
            <input
              id="name"
              name="name"
              type="text"
              className={`login__input ${errors.name ? 'login__input--error' : ''}`}
              placeholder="Abdullah Al-Rashid"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>
          {errors.name && <div className="login__error"><span className="material-symbols-outlined">error</span><span>{errors.name}</span></div>}
        </div>

        <div className="login__field">
          <label className="login__label" htmlFor="signup-email">Email address</label>
          <div className="login__input-wrapper">
            <span className="login__input-icon material-symbols-outlined">mail</span>
            <input
              id="signup-email"
              name="email"
              type="email"
              className={`login__input ${errors.email ? 'login__input--error' : ''}`}
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          {errors.email && <div className="login__error"><span className="material-symbols-outlined">error</span><span>{errors.email}</span></div>}
        </div>

        <div className="login__field">
          <label className="login__label" htmlFor="role">Role</label>
          <div className="login__input-wrapper">
            <span className="login__input-icon material-symbols-outlined">badge</span>
            <select
              id="role"
              name="role"
              className="login__input login__input--select"
              value={formData.role}
              onChange={handleChange}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="login__field">
          <label className="login__label" htmlFor="signup-password">Password</label>
          <div className="login__input-wrapper">
            <span className="login__input-icon material-symbols-outlined">lock</span>
            <input
              id="signup-password"
              name="password"
              type="password"
              className={`login__input ${errors.password ? 'login__input--error' : ''}`}
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
          {errors.password && <div className="login__error"><span className="material-symbols-outlined">error</span><span>{errors.password}</span></div>}
        </div>

        <div className="login__field">
          <label className="login__label" htmlFor="confirmPassword">Confirm password</label>
          <div className="login__input-wrapper">
            <span className="login__input-icon material-symbols-outlined">verified_user</span>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`login__input ${errors.confirmPassword ? 'login__input--error' : ''}`}
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
          {errors.confirmPassword && <div className="login__error"><span className="material-symbols-outlined">error</span><span>{errors.confirmPassword}</span></div>}
        </div>

        {serverMessage && (
          <div className="login__banner login__banner--error">
            <span className="material-symbols-outlined">priority_high</span>
            <span>{serverMessage}</span>
          </div>
        )}

        <button type="submit" className="login__submit" disabled={isLoading}>
          <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </form>

      <p className="login__contact">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default Signup
