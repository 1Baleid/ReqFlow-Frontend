import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
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

function AuthGate({ children }) {
  const { currentUser } = useProjectData()
  const isAuthenticated = Boolean(localStorage.getItem('userEmail'))

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!currentUser) {
    return null
  }

  return children
}

function RoleGate({ allowedRoles, children }) {
  const { currentUser } = useProjectData()
  const fallbackRoute = currentUser?.role === 'manager' ? '/manager' : '/dashboard'

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={fallbackRoute} replace />
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
  const isAuthenticated = Boolean(localStorage.getItem('userEmail'))
  const defaultRoute = currentUser?.role === 'manager' ? '/manager' : '/dashboard'

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <Login />}
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

      <Route path="/" element={<Navigate to={isAuthenticated ? defaultRoute : '/login'} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? defaultRoute : '/login'} replace />} />
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
