import { Navigate, Outlet } from 'react-router' // Import Outlet
import { useAuth } from '../contexts/AuthContext'

const AdminRoute = () => {
  const { user } = useAuth()

  // Check if user exists and has the required role
  const isAdmin = user?.role === 'community_admin' || user?.role === 'super_admin'

  if (!isAdmin) {
    // Redirect non-admins to the main application dashboard
    console.log('AdminRoute: User is not admin, redirecting.')
    return <Navigate to="/app/dashboard" replace />
  }

  // If user is admin, render the nested admin routes (using Outlet)
  console.log('AdminRoute: User is admin, allowing access.')
  return <Outlet /> // Renders the matched child route (AdminDashboard or ManageUsers)
}

export default AdminRoute