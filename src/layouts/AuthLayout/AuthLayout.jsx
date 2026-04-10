import './AuthLayout.css'

function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      {/* Left Panel - Branding */}
      <div className="auth-layout__branding">
        {/* Background Decorations */}
        <div className="auth-layout__bg-decor">
          <div className="auth-layout__blob auth-layout__blob--1"></div>
          <div className="auth-layout__blob auth-layout__blob--2"></div>
        </div>

        {/* Content */}
        <div className="auth-layout__branding-content">
          {/* Logo */}
          <div className="auth-layout__logo">
            <div className="auth-layout__logo-icon">
              <span className="material-symbols-outlined">account_tree</span>
            </div>
            <span className="auth-layout__logo-text">ReqFlow</span>
          </div>

          {/* Headline */}
          <h1 className="auth-layout__headline">
            Structure the chaos,<br />
            <span className="auth-layout__headline-accent">perfect the flow.</span>
          </h1>
          <p className="auth-layout__description">
            Enterprise requirements management designed for clarity. Create, trace,
            and manage complex systems with a digital sanctuary for critical thinking.
          </p>

          {/* Visual Grid */}
          <div className="auth-layout__visual">
            <div className="auth-layout__grid">
              <div className="auth-layout__grid-item auth-layout__grid-item--1"></div>
              <div className="auth-layout__grid-item auth-layout__grid-item--2"></div>
              <div className="auth-layout__grid-item auth-layout__grid-item--3"></div>
              <div className="auth-layout__grid-item auth-layout__grid-item--4"></div>
              <div className="auth-layout__grid-item auth-layout__grid-item--5"></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="auth-layout__stats">
          <div className="auth-layout__stat">
            <span className="auth-layout__stat-value">12k+</span>
            <span className="auth-layout__stat-label">Requirements tracked</span>
          </div>
          <div className="auth-layout__stat-divider"></div>
          <div className="auth-layout__stat">
            <span className="auth-layout__stat-value">99.9%</span>
            <span className="auth-layout__stat-label">Uptime reliability</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-layout__form-panel">
        <div className="auth-layout__form-container">
          {children}
        </div>

        {/* Footer */}
        <footer className="auth-layout__footer">
          <p>© 2026 ReqFlow Systems Inc. • Privacy • Security</p>
        </footer>
      </div>
    </div>
  )
}

export default AuthLayout
