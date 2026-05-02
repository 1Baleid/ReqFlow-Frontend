import AuthGuard from './AuthGuard'
import RoleGuard from './RoleGuard'

/**
 * ProtectedRoute - Combines auth and role protection
 * @param {ReactNode} children - The protected component
 * @param {string[]} roles - Optional array of allowed roles
 * @param {ReactNode} fallback - Optional loading fallback
 */
function ProtectedRoute({ children, roles, fallback }) {
  return (
    <AuthGuard fallback={fallback}>
      {roles && roles.length > 0 ? (
        <RoleGuard allowedRoles={roles}>
          {children}
        </RoleGuard>
      ) : (
        children
      )}
    </AuthGuard>
  )
}

export default ProtectedRoute
