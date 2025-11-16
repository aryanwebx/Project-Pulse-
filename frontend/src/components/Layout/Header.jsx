import {Link} from 'react-router'
import { useAuth } from '../../contexts/AuthContext'
import CommunityDisplay from '../Community/CommunityDisplay'
import NotificationBell from './NotificationBell';

const Header = () => {
  const { user, logout } = useAuth()
  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          {/* App Logo/Name */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">PP</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">Project Pulse</span>
          </div>
          
          {/* Community Display - Shows user's single community */}
          <div className="min-w-0 flex-1 max-w-md">
          {user.role!='super_admin' ? <CommunityDisplay/>:""}
            {/* <CommunityDisplay /> */}
          </div>
        </div>
        
        <div className="flex items-center space-x-3 shrink-0">
          {user ? (
            <div className="flex items-center space-x-3">
              <NotificationBell />
              <Link
                to="/app/profile"
                className='flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-100 transition-colors'
                title="Account Settings"
                >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.role}
                </p>
              </div>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="space-x-2">
              <a href="/login" className="btn-secondary text-sm">Login</a>
              <a href="/register" className="btn-primary text-sm">Sign Up</a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header