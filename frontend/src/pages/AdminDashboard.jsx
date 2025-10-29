import { Link } from 'react-router'

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
        <p className="text-gray-600 mb-6">
          Manage your community users and settings from this section.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
                to="/app/admin/users"
                className="block p-6 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
                <h3 className="font-semibold text-blue-800 mb-2">Manage Users</h3>
                <p className="text-sm text-blue-700">View, edit roles, and manage community members.</p>
            </Link>
            {/* Add more links here later, e.g., for Community Settings */}
             <div
                className="block p-6 bg-gray-50 rounded-lg border border-gray-200 cursor-not-allowed"
             >
                <h3 className="font-semibold text-gray-500 mb-2">Community Settings (Coming Soon)</h3>
                <p className="text-sm text-gray-400">Configure community details and preferences.</p>
            </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard