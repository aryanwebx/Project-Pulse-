import { useAuth } from '../../contexts/AuthContext'
import { useCommunity } from '../../contexts/CommunityContext'

const Header = () => {
  const { user, logout } = useAuth()
  const { currentCommunity } = useCommunity()

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-4">
          {currentCommunity && (
            <div className="flex items-center space-x-2">
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                {currentCommunity.name}
              </span>
              <span className="text-sm text-gray-500">
                {currentCommunity.description}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="space-x-2">
              <a href="/login" className="btn-secondary">Login</a>
              <a href="/register" className="btn-primary">Sign Up</a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header