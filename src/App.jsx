import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import AuthStatus from './pages/AuthStatus'
import Dashboard from './pages/Dashboard'
import Requirements from './pages/Requirements'
import CreateRequirement from './pages/CreateRequirement'
import RequirementDetail from './pages/RequirementDetail'
import EditRequirement from './pages/EditRequirement'
import VersionHistory from './pages/VersionHistory'
import AllRequirementsManager from './pages/AllRequirementsManager'
import ManagerDashboard from './pages/ManagerDashboard'
import Team from './pages/Team'
import Settings from './pages/Settings'
import Projects from './pages/Projects'
import CreateProject from './pages/CreateProject'
import { ProjectDataProvider, useProjectData } from './context/ProjectDataContext'
import { getDefaultRouteForRole, isAuthenticated } from './member-a-auth-entry/session'

function AuthGate({ children }) {
  const { currentUser } = useProjectData()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (!currentUser) {
    return null
  }

  return children
}

function RoleGate({ allowedRoles, children }) {
  const { currentUser } = useProjectData()
  const fallbackRoute = currentUser ? getDefaultRouteForRole(currentUser.role) : '/login'

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace state={{ from: fallbackRoute }} />
  }

  return children
}

function TraceabilityRedirect() {
  const { currentUser } = useProjectData()

  if (currentUser.role === 'manager') {
    return <Navigate to="/manager/requirements" replace />
  }

  return <Navigate to="/requirements" replace />
}

function AppRoutes() {
  const { currentUser } = useProjectData()
  const hasSession = isAuthenticated()
  const defaultRoute = getDefaultRouteForRole(currentUser?.role)

  return (
    <Routes>
      <Route
        path="/login"
        element={hasSession ? <Navigate to={defaultRoute} replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={hasSession ? <Navigate to={defaultRoute} replace /> : <Signup />}
      />
      <Route
        path="/forgot-password"
        element={hasSession ? <Navigate to={defaultRoute} replace /> : <ForgotPassword />}
      />
      <Route
        path="/unauthorized"
        element={<AuthStatus variant="unauthorized" />}
      />

      <Route
        path="/dashboard"
        element={
          <AuthGate>
            <RoleGate allowedRoles={['client', 'member']}>
              <Dashboard />
            </RoleGate>
          </AuthGate>
        }
      />
      <Route
        path="/manager"
        element={
          <AuthGate>
            <RoleGate allowedRoles={['manager']}>
              <ManagerDashboard />
            </RoleGate>
          </AuthGate>
        }
      />

      <Route
        path="/requirements"
        element={
          <AuthGate>
            <Requirements />
          </AuthGate>
        }
      />
      <Route
        path="/requirements/new"
        element={
          <AuthGate>
            <CreateRequirement />
          </AuthGate>
        }
      />
      <Route
        path="/requirements/:id"
        element={
          <AuthGate>
            <RequirementDetail />
          </AuthGate>
        }
      />
      <Route
        path="/requirements/:id/edit"
        element={
          <AuthGate>
            <EditRequirement />
          </AuthGate>
        }
      />
      <Route
        path="/requirements/:id/versions"
        element={
          <AuthGate>
            <VersionHistory />
          </AuthGate>
        }
      />
      <Route
        path="/manager/requirements"
        element={
          <AuthGate>
            <RoleGate allowedRoles={['manager']}>
              <AllRequirementsManager />
            </RoleGate>
          </AuthGate>
        }
      />

      <Route
        path="/projects"
        element={
          <AuthGate>
            <Projects />
          </AuthGate>
        }
      />
      <Route
        path="/projects/new"
        element={
          <AuthGate>
            <CreateProject />
          </AuthGate>
        }
      />
      <Route
        path="/projects/:projectId/edit"
        element={
          <AuthGate>
            <CreateProject />
          </AuthGate>
        }
      />
      <Route
        path="/settings"
        element={
          <AuthGate>
            <RoleGate allowedRoles={['manager']}>
              <Settings />
            </RoleGate>
          </AuthGate>
        }
      />
      <Route
        path="/team"
        element={
          <AuthGate>
            <RoleGate allowedRoles={['manager']}>
              <Team />
            </RoleGate>
          </AuthGate>
        }
      />
      <Route
        path="/traceability"
        element={
          <AuthGate>
            <TraceabilityRedirect />
          </AuthGate>
        }
      />

      <Route path="/" element={<Navigate to={hasSession ? defaultRoute : '/login'} replace />} />
      <Route path="*" element={<AuthStatus variant="notFound" />} />
    </Routes>
  )
}

function App() {
  return (
    <ProjectDataProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ProjectDataProvider>
  )
}

export default App
