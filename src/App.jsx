/* eslint-disable react/prop-types */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
import { ProjectDataProvider } from './context/ProjectDataContext'

function App() {
  return (
    <ProjectDataProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manager" element={<ManagerDashboard />} />

          {/* Requirements */}
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/requirements/new" element={<CreateRequirement />} />
          <Route path="/requirements/:id" element={<RequirementDetail />} />
          <Route path="/requirements/:id/edit" element={<EditRequirement />} />
          <Route path="/requirements/:id/versions" element={<VersionHistory />} />
          <Route path="/manager/requirements" element={<AllRequirementsManager />} />

          {/* Other routes */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<CreateProject />} />
          <Route path="/projects/:projectId/edit" element={<CreateProject />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/team" element={<Team />} />
          <Route path="/traceability" element={<PlaceholderPage title="Traceability" />} />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ProjectDataProvider>
  )
}

// Temporary placeholder component
function PlaceholderPage({ title }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Manrope, sans-serif',
      fontSize: '2rem',
      color: '#2b3437',
      background: '#f8f9fa'
    }}>
      {title} - Coming Soon
    </div>
  )
}

export default App
