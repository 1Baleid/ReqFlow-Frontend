import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

// Demo user accounts
const DEMO_USERS = {
  'abdullah@kfupm.edu.sa': { password: 'abdullah123', role: 'client', redirect: '/dashboard' },
  'omar@kfupm.edu.sa': { password: 'omar123', role: 'member', redirect: '/dashboard' },
  'khalid@kfupm.edu.sa': { password: 'khalid123', role: 'manager', redirect: '/manager' }
}

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })
  const creatureRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!creatureRef.current) return
      const rect = creatureRef.current.getBoundingClientRect()
      const creatureCenterX = rect.left + rect.width / 2
      const creatureCenterY = rect.top + rect.height / 2

      const deltaX = e.clientX - creatureCenterX
      const deltaY = e.clientY - creatureCenterY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxOffset = 4

      const offsetX = (deltaX / Math.max(distance, 100)) * maxOffset
      const offsetY = (deltaY / Math.max(distance, 100)) * maxOffset

      setEyeOffset({ x: offsetX, y: offsetY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Check demo credentials
    const user = DEMO_USERS[formData.email.toLowerCase()]
    if (!user || user.password !== formData.password) {
      setErrors({ email: 'Invalid email or password' })
      return
    }

    // Store user role in localStorage for session persistence
    localStorage.setItem('userRole', user.role)
    localStorage.setItem('userEmail', formData.email.toLowerCase())

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      navigate(user.redirect)
    }, 800)
  }

  return (
    <div className="login">
      {/* Left Panel - Branding */}
      <div className="login__branding">
        <div className="login__branding-bg">
          <div className="login__blob login__blob--1"></div>
          <div className="login__blob login__blob--2"></div>
        </div>

        <div className="login__branding-content">
          {/* Logo */}
          <div className="login__logo">
            <div className="login__logo-icon">
              <span className="material-symbols-outlined">account_tree</span>
            </div>
            <span className="login__logo-text">ReqFlow</span>
          </div>

          {/* Headline */}
          <h1 className="login__headline">
            Structure the chaos,<br />
            <span className="login__headline-accent">perfect the flow.</span>
          </h1>

          <p className="login__description">
            Enterprise requirements management designed for clarity. Create, trace, and manage complex systems with a digital sanctuary for critical thinking.
          </p>

          {/* Visual Grid */}
          <div className="login__visual">
            <div className="login__grid">
              {/* Card with status badge */}
              <div className="login__grid-item login__grid-item--1">
                <div className="login__grid-content">
                  <div className="login__grid-badge login__grid-badge--green">
                    <span className="login__grid-badge-dot"></span>
                  </div>
                  <div className="login__grid-lines">
                    <div className="login__grid-line login__grid-line--1"></div>
                    <div className="login__grid-line login__grid-line--2"></div>
                  </div>
                </div>
              </div>
              {/* Card with flow diagram */}
              <div className="login__grid-item login__grid-item--2">
                <div className="login__grid-content">
                  <div className="login__grid-flow">
                    <div className="login__grid-node login__grid-node--1"></div>
                    <div className="login__grid-connector"></div>
                    <div className="login__grid-node login__grid-node--2"></div>
                    <div className="login__grid-connector"></div>
                    <div className="login__grid-node login__grid-node--3"></div>
                  </div>
                </div>
              </div>
              {/* Card with checkmarks */}
              <div className="login__grid-item login__grid-item--3">
                <div className="login__grid-content">
                  <div className="login__grid-checks">
                    <div className="login__grid-check login__grid-check--1">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div className="login__grid-check login__grid-check--2">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Wide card with progress */}
              <div className="login__grid-item login__grid-item--4">
                <div className="login__grid-content">
                  <div className="login__grid-progress">
                    <div className="login__grid-progress-bar"></div>
                  </div>
                  <div className="login__grid-lines">
                    <div className="login__grid-line login__grid-line--3"></div>
                    <div className="login__grid-line login__grid-line--4"></div>
                  </div>
                </div>
              </div>
              {/* Accent card with pulse */}
              <div className="login__grid-item login__grid-item--5">
                <div className="login__grid-content">
                  <div className="login__grid-pulse">
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cute Creature */}
        <div className="login__creature" ref={creatureRef}>
          <div className="login__creature-body">
            <div className="login__creature-face">
              <div className="login__creature-eye login__creature-eye--left">
                <div
                  className="login__creature-pupil"
                  style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
                />
              </div>
              <div className="login__creature-eye login__creature-eye--right">
                <div
                  className="login__creature-pupil"
                  style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
                />
              </div>
              <div className="login__creature-blush login__creature-blush--left" />
              <div className="login__creature-blush login__creature-blush--right" />
            </div>
            <div className="login__creature-ears">
              <div className="login__creature-ear login__creature-ear--left" />
              <div className="login__creature-ear login__creature-ear--right" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="login__form-panel">
        <div className="login__form-wrapper">
          {/* Mobile Logo */}
          <div className="login__mobile-logo">
            <div className="login__mobile-logo-icon">
              <span className="material-symbols-outlined">account_tree</span>
            </div>
            <span className="login__mobile-logo-text">ReqFlow</span>
          </div>

          {/* Header */}
          <div className="login__header">
            <h2 className="login__title">Welcome back</h2>
            <p className="login__subtitle">Enter your credentials to access your workspace.</p>
          </div>

          {/* Demo Credentials */}
          <div className="login__demo-hint">
            <div className="login__demo-title">
              <span className="material-symbols-outlined">info</span>
              Demo Credentials
            </div>
            <div className="login__demo-credentials">
              <div className="login__demo-item">
                <span className="login__demo-role">Client:</span>
                <span>abdullah@kfupm.edu.sa / abdullah123</span>
              </div>
              <div className="login__demo-item">
                <span className="login__demo-role">Manager:</span>
                <span>khalid@kfupm.edu.sa / khalid123</span>
              </div>
              <div className="login__demo-item">
                <span className="login__demo-role">Member:</span>
                <span>omar@kfupm.edu.sa / omar123</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="login__form" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="login__field">
              <label className="login__label" htmlFor="email">Email address</label>
              <div className="login__input-wrapper">
                <span className="login__input-icon material-symbols-outlined">mail</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`login__input ${errors.email ? 'login__input--error' : ''}`}
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <div className="login__error">
                  <span className="material-symbols-outlined">error</span>
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="login__field">
              <div className="login__label-row">
                <label className="login__label" htmlFor="password">Password</label>
                <a href="#" className="login__forgot">Forgot password?</a>
              </div>
              <div className="login__input-wrapper">
                <span className="login__input-icon material-symbols-outlined">lock</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`login__input ${errors.password ? 'login__input--error' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button type="button" className="login__toggle-password">
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              </div>
              {errors.password && (
                <div className="login__error">
                  <span className="material-symbols-outlined">error</span>
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Remember Me */}
            <div className="login__remember">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                className="login__checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe" className="login__remember-label">
                Keep me logged in
              </label>
            </div>

            {/* Submit */}
            <button type="submit" className="login__submit" disabled={isLoading}>
              <span>{isLoading ? 'Logging in...' : 'Log In'}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          {/* Divider */}
          <div className="login__divider">
            <span>Or continue with</span>
          </div>

          {/* Social Login */}
          <div className="login__social">
            <button type="button" className="login__social-btn">
              <svg className="login__social-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
            <button type="button" className="login__social-btn">
              <span className="material-symbols-outlined login__social-icon-sso">cloud</span>
              <span>SSO</span>
            </button>
          </div>

          {/* Contact Admin */}
          <p className="login__contact">
            Don't have an account? <a href="#">Contact your admin</a>
          </p>
        </div>

        {/* Footer */}
        <footer className="login__footer">
          <p>© 2026 ReqFlow Systems Inc. • Privacy • Security</p>
        </footer>
      </div>
    </div>
  )
}

export default Login
