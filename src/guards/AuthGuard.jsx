import { Navigate, useLocation } from 'react-router-dom'
import { useProjectData } from '../context/ProjectDataContext'
import { isAuthenticated, getStoredAuthUser } from '../member-a-auth-entry/session'
import { PageLoader } from '../components/Skeleton'

/**
 * AuthGuard - Protects routes that require authentication
 * Redirects to login if not authenticated
 * Shows loading state while checking auth
 */
function AuthGuard({ children, fallback = null }) {
  const location = useLocation()
  const { currentUser, isLoading } = useProjectData()

  // Show loading while checking authentication
  if (isLoading) {
    return fallback || <PageLoader message="Checking authentication..." />
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Save the attempted URL for redirecting after login
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, message: 'Please log in to continue' }}
      />
    )
  }

  // Wait for user data to load
  if (!currentUser) {
    const storedUser = getStoredAuthUser()
    if (!storedUser) {
      return <Navigate to="/login" replace />
    }
    // Still loading user data
    return fallback || <PageLoader message="Loading user data..." />
  }

  return children
}

export default AuthGuard
