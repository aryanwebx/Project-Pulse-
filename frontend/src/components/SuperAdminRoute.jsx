import { Navigate, Outlet } from 'react-router'; // Use react-router-dom
import { useAuth } from '../contexts/AuthContext';

const SuperAdminRoute = () => {
  const { user } = useAuth();

  if (user?.role !== 'super_admin') {
    // Redirect non-superadmins to the regular dashboard
    console.log('SuperAdminRoute: Access Denied. User is not super_admin.');
    return <Navigate to="/app/dashboard" replace />;
  }

  // If user is super_admin, render the nested routes (e.g., ManageCommunities)
  return <Outlet />;
};

export default SuperAdminRoute;