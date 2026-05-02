import { Navigate } from 'react-router-dom'
import { useProjectData } from '../context/ProjectDataContext'
import { getDefaultRouteForRole } from '../member-a-auth-entry/session'

/**
 * RoleGuard - Restricts access based on user roles
 * Redirects to unauthorized page or default route if role not allowed
 */
function RoleGuard({
  children,
  allowedRoles = [],
  redirectTo = '/unauthorized',
  showUnauthorized = true
}) {
  const { currentUser } = useProjectData()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  const userRole = currentUser.role?.toLowerCase()
  const isAllowed = allowedRoles.some(role => role.toLowerCase() === userRole)

  if (!isAllowed) {
    if (showUnauthorized) {
      return (
        <Navigate
          to={redirectTo}
          replace
          state={{
            from: getDefaultRouteForRole(userRole),
            requiredRoles: allowedRoles,
            userRole: userRole
          }}
        />
      )
    }
    // Silently redirect to user's default route
    return <Navigate to={getDefaultRouteForRole(userRole)} replace />
  }

  return children
}

export default RoleGuard
