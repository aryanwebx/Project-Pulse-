import { useState, useEffect } from 'react' // Import useEffect
import { useAuth } from '../../contexts/AuthContext'

const IssueHeader = ({ issue, onUpvote, isAdmin, onStatusUpdate }) => {
  const { user } = useAuth()
  const [upvoting, setUpvoting] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState(issue.status)
  const [adminNotes, setAdminNotes] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // *** FIX: Add state for upvoted status ***
  const [hasUpvoted, setHasUpvoted] = useState(issue.hasCurrentUserUpvoted || false)
  
  // *** FIX: Sync local state when the issue prop changes ***
  useEffect(() => {
    setHasUpvoted(issue.hasCurrentUserUpvoted || false)
  }, [issue.hasCurrentUserUpvoted])
  // *** END FIX ***


  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'High Priority'
      case 'medium': return 'Medium Priority'
      case 'low': return 'Low Priority'
      default: return 'Unknown Priority'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleUpvoteClick = async () => {
    // *** FIX: Disable if already upvoted or in progress ***
    if (upvoting || hasUpvoted) return
    
    setUpvoting(true)
    await onUpvote() // This calls the fixed function in IssueDetail.jsx
    setUpvoting(false)
    // The useEffect will automatically update `hasUpvoted` when the `issue` prop changes
  }

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === issue.status) {
      setShowStatusModal(false)
      return
    }

    setUpdatingStatus(true)
    await onStatusUpdate(newStatus, adminNotes)
    setUpdatingStatus(false)
    setShowStatusModal(false)
    setAdminNotes('')
  }

  return (
    <div className="card">
      {/* Status and Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(issue.status)}`}>
            {issue.status.replace('-', ' ').toUpperCase()}
          </span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.urgency)}`}></div>
            <span className="text-sm text-gray-600 font-medium">
              {getPriorityText(issue.urgency)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Upvote Button */}
          <button
            onClick={handleUpvoteClick}
            // *** FIX: Update disabled and className props ***
            disabled={upvoting || hasUpvoted}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors group/upvote
              ${
                hasUpvoted
                  ? 'bg-primary-50 border-primary-300 cursor-default' // Style for "already upvoted"
                  : 'border-gray-300 hover:border-primary-300 hover:bg-primary-50' // Style for "not upvoted"
              }
              ${
                upvoting
                  ? 'disabled:opacity-50' // Style for "in progress"
                  : 'disabled:opacity-70' // Style for "already upvoted"
              }
            `}
          >
            {upvoting ? (
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              // *** FIX: Update SVG style ***
              <svg 
                className={`w-5 h-5 transition-colors
                  ${
                    hasUpvoted
                      ? 'text-primary-600' // Color for "already upvoted"
                      : 'text-gray-600 group-hover/upvote:text-primary-600' // Color for "not upvoted"
                  }
                `} 
                fill={hasUpvoted ? 'currentColor' : 'none'} // Fill the icon if upvoted
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            )}
            {/* *** FIX: Update text style *** */}
            <span 
              className={`font-medium transition-colors
                ${
                  hasUpvoted
                    ? 'text-primary-700' // Color for "already upvoted"
                    : 'text-gray-700 group-hover/upvote:text-primary-600' // Color for "not upvoted"
                }
              `}
            >
              {issue.upvoteCount}
            </span>
          </button>
          {/* *** END FIX *** */}


          {/* Admin Status Update Button */}
          {isAdmin && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Update Status
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
        {issue.title}
      </h1>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {issue.createdBy?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900">{issue.createdBy?.name || 'Unknown User'}</span>
            <div>Reported {formatDate(issue.createdAt)}</div>
          </div>
        </div>

        {issue.assignedTo && (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {issue.assignedTo.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Assigned to</span>
              <div className="font-medium text-gray-900">{issue.assignedTo.name}</div>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Issue Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="open">Open</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this status update..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus}
                className="btn-primary px-4 py-2 disabled:opacity-50"
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IssueHeader