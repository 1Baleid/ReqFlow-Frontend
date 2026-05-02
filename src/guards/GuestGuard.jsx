import { Navigate } from 'react-router-dom'
import { useProjectData } from '../context/ProjectDataContext'
import { isAuthenticated, getDefaultRouteForRole } from '../member-a-auth-entry/session'

/**
 * GuestGuard - For routes that should only be accessible when NOT logged in
 * Redirects authenticated users to their dashboard
 */
function GuestGuard({ children, redirectTo }) {
  const { currentUser } = useProjectData()

  if (isAuthenticated() && currentUser) {
    const defaultRoute = redirectTo || getDefaultRouteForRole(currentUser.role)
    return <Navigate to={defaultRoute} replace />
  }

  return children
}

export default GuestGuard
