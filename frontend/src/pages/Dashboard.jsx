import { useAuth } from '../contexts/AuthContext'
import { useCommunity } from '../contexts/CommunityContext'

const Dashboard = () => {
  const { user } = useAuth()
  const { currentCommunity } = useCommunity()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          {currentCommunity 
            ? `You're managing issues for ${currentCommunity.name}`
            : 'Select a community to get started'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600 mb-2">12</div>
          <div className="text-gray-600">Open Issues</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">8</div>
          <div className="text-gray-600">Resolved This Week</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
          <div className="text-gray-600">High Priority</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">New issue reported</p>
              <p className="text-sm text-gray-500">Park maintenance required</p>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Issue resolved</p>
              <p className="text-sm text-gray-500">Street light fixed</p>
            </div>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors">
            + Report New Issue
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors">
            📊 View Analytics
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard