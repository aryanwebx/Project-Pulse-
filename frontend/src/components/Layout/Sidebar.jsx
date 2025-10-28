import { NavLink } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'

const Sidebar = () => {
  const { user } = useAuth()

  const navItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/app/issues', label: 'All Issues', icon: '🐛' },
  ]

  if (user?.role === 'admin' || user?.role === 'super_admin') {
    navItems.push({ path: '/app/admin', label: 'Admin', icon: '⚙️' })
  }

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Project Pulse</h2>
        <p className="text-sm text-gray-500">Community Platform</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium border-l-4 border-primary-600'
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
      </nav>
    </aside>
  )
}

export default Sidebar