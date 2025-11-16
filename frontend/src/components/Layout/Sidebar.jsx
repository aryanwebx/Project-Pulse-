import { NavLink } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'
import { useCommunity } from '../../contexts/CommunityContext';


const Sidebar = () => {
  const { user } = useAuth()

  const navItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/app/issues', label: 'All Issues', icon: '🐛' },
  ]

  // Add Admin link for Community Admins
  if (user?.role === 'community_admin') {
    navItems.push({ path: '/app/admin', label: 'Admin', icon: '⚙️' })
  }
  
  // *** NEW: Add Super Admin link for Super Admins ***
  if (user?.role === 'super_admin') {
    // A super admin might also be a community admin, add both links
    // or just the super admin link which is more powerful.
    // Let's add an "Admin" link (for their own community)
    // navItems.push({ path: '/app/admin', label: 'Community Admin', icon: '⚙️' })
    // And a "Super Admin" link (for platform management)
    navItems.push({ path: '/app/superadmin', label: 'Super Admin', icon: '👑' })
  }


  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen shrink-0">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Project Pulse</h2>
        <p className="text-sm text-gray-500">Community Platform</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Quick Stats in Sidebar */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 text-sm mb-2">Quick Access</h3>
          <div className="space-y-2">
            <NavLink
              to="/app/issues?status=open"
              className="flex items-center justify-between text-sm text-gray-600 hover:text-gray-900"
            >
              <span>Open Issues</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">12</span>
            </NavLink>
            <NavLink
              to="/app/issues?priority=high"
              className="flex items-center justify-between text-sm text-gray-600 hover:text-gray-900"
            >
              <span>High Priority</span>
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">3</span>
            </NavLink>
          </div>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar