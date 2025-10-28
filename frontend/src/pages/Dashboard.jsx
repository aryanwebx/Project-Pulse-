import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCommunity } from '../contexts/CommunityContext'
import { dashboardService } from '../services/dashboardService'
import { Link } from 'react-router'

const Dashboard = () => {
  const { user } = useAuth()
  const { currentCommunity,loading:communityLoading } = useCommunity()
  const [recentIssues, setRecentIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (currentCommunity) {
        setLoading(true)
        try {
          // Only load recent issues, stats are already in currentCommunity.stats
          const issuesData = await dashboardService.getRecentIssues(currentCommunity.community._id)
          console.log(issuesData.issues)
          setRecentIssues(issuesData.issues)
        } catch (error) {
          console.error('Failed to load dashboard data:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [currentCommunity])

  // Use stats from community object instead of separate API call
  const stats = currentCommunity?.community?.stats
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (communityLoading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show message if no community assigned
  if (!currentCommunity) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">🏘️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Community Assigned</h2>
          <p className="text-gray-600 mb-6">
            It looks like you haven't been assigned to a community yet.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-yellow-800 text-sm">
              Please contact your administrator to get added to a community.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        {currentCommunity && (
          <p className="text-gray-600">
            Managing issues for <span className="font-semibold text-primary-600">{currentCommunity.community.name}</span>
            {currentCommunity.community.description && (
              <span className="text-gray-500 text-sm ml-2">- {currentCommunity.community.description}</span>
            )}
          </p>
        )}
      </div>

      {/* Stats Grid - Using community.stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">{stats.issueCount || 0}</div>
            <div className="text-gray-600 font-medium">Total Issues</div>
            <div className="text-sm text-gray-500 mt-1">All time</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">{stats.activeIssueCount || 0}</div>
            <div className="text-gray-600 font-medium">Active Issues</div>
            <div className="text-sm text-gray-500 mt-1">Needs attention</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{stats.resolvedCount || 0}</div>
            <div className="text-gray-600 font-medium">Resolved</div>
            <div className="text-sm text-gray-500 mt-1">Completed issues</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{stats.memberCount || 0}</div>
            <div className="text-gray-600 font-medium">Community Members</div>
            <div className="text-sm text-gray-500 mt-1">Active users</div>
          </div>
        </div>
      )}

      {/* If no stats available, show a message */}
      {!stats && currentCommunity && (
        <div className="card text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stats Available</h3>
          <p className="text-gray-600">Start reporting issues to see community statistics</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/app/issues/new" 
              className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-colors group"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <span className="text-lg">📝</span>
              </div>
              <div>
                <div className="font-medium">Report New Issue</div>
                <div className="text-sm text-gray-500">Submit a new community issue</div>
              </div>
            </Link>
            
            <Link 
              to="/app/issues" 
              className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <div className="font-medium">View All Issues</div>
                <div className="text-sm text-gray-500">Browse and manage all issues</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Issues</h2>
            <Link 
              to="/app/issues" 
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentIssues.length > 0 ? (
              recentIssues.map((issue) => (
                <div key={issue._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-gray-900 truncate">{issue.title}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.urgency)}`}>
                        {issue.urgency}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                      <span>{issue.category}</span>
                      <span>•</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500 ml-4">
                    <span>upvote 👍</span>
                    <span className="text-sm">{issue.upvoteCount || 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>No issues reported yet</p>
                <p className="text-sm">Be the first to report an issue!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Community Info */}
      {currentCommunity && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Community Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">About {currentCommunity.community.name}</h3>
              <p className="text-gray-600 mb-4">
                {currentCommunity.community.description || 'No description provided.'}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <span className="text-gray-600">{currentCommunity.community.contactEmail}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-600">{currentCommunity.subdomain || 'No location set'}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Community Health</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Issue Resolution Rate</span>
                    <span className="font-medium">
                      {stats && stats.issueCount > 0 
                        ? `${Math.round(((stats.issueCount - stats.activeIssueCount) / stats.issueCount) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: stats && stats.issueCount > 0 
                          ? `${((stats.issueCount - stats.activeIssueCount) / stats.issueCount) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{stats?.activeIssueCount || 0}</div>
                    <div className="text-blue-800">Active Issues</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{stats?.memberCount || 0}</div>
                    <div className="text-green-800">Members</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard