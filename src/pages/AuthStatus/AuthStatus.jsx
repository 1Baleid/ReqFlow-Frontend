import { Link } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import '../Login/Login.css'

const PAGE_CONTENT = {
  notFound: {
    badge: '404',
    title: 'This route does not exist',
    description: 'The page you requested is missing, moved, or no longer part of the current workspace flow.',
    primaryLabel: 'Go to Login',
    primaryTo: '/login',
    secondaryLabel: 'Open Dashboard',
    secondaryTo: '/dashboard'
  },
  unauthorized: {
    badge: '403',
    title: 'Access denied',
    description: 'Your current role does not have permission to open this page. Use a valid workspace role or return to a safe route.',
    primaryLabel: 'Go to Login',
    primaryTo: '/login',
    secondaryLabel: 'Open Dashboard',
    secondaryTo: '/dashboard'
  }
}

function AuthStatus({ variant = 'notFound' }) {
  const content = PAGE_CONTENT[variant] || PAGE_CONTENT.notFound

  return (
    <AuthLayout
      title={content.title}
      subtitle={content.description}
    >
      <div className="login__status">
        <span className="login__status-code">{content.badge}</span>
        <h2 className="login__title">{content.title}</h2>
        <p className="login__subtitle login__subtitle--spaced">{content.description}</p>

        <div className="login__status-actions">
          <Link className="login__submit login__submit--link" to={content.primaryTo}>
            <span>{content.primaryLabel}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
          <Link className="login__ghost-link" to={content.secondaryTo}>
            {content.secondaryLabel}
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

export default AuthStatus
