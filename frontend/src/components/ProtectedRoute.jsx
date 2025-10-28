import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { useCommunity } from '../contexts/CommunityContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { loading: communityLoading } = useCommunity()
  const location = useLocation()

  const loading = authLoading || communityLoading

  console.log('ProtectedRoute Check:', { 
    isAuthenticated, 
    authLoading, 
    communityLoading,
    currentPath: location.pathname 
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your community...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  console.log('User authenticated, rendering protected content')
  return children
}

export default ProtectedRoute