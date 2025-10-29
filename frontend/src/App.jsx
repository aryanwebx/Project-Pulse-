import { BrowserRouter as Router, Routes, Route } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import { CommunityProvider } from './contexts/CommunityContext'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Issues from './pages/Issues'
import CreateIssue from './pages/CreateIssue'
import IssueDetail from './pages/IssueDetail'
import AdminDashboard from './pages/AdminDashboard'
import ManageUsers from './pages/ManageUsers'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CommunityProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes with app layout */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="issues" element={<Issues />} />
               <Route path="issues/new" element={<CreateIssue />} />
              <Route path="issues/:id" element={<IssueDetail />} />
              {/* *** 3. ADD Admin Routes *** */}
              {/* This parent route uses AdminRoute AND renders an Outlet */}
              <Route path="admin" element={<AdminRoute />}>
                {/* Child routes rendered by the Outlet */}
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<ManageUsers />} />
                {/* Add more admin routes here later (e.g., settings) */}
              </Route>
              {/* *** End Admin Routes *** */}
            </Route>

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </CommunityProvider>
      </AuthProvider>
    </Router>
  )
}

export default App