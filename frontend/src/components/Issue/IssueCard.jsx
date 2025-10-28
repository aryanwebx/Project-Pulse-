import { Link } from 'react-router'
import { useState, useEffect } from 'react'
import { issueService } from '../../services/issueService'

const IssueCard = ({ issue, onUpvote }) => {
  const [upvoting, setUpvoting] = useState(false)
  const [currentUpvotes, setCurrentUpvotes] = useState(issue.upvoteCount || 0)
  const [hasUpvoted, setHasUpvoted] = useState(issue.hasCurrentUserUpvoted || false)

  useEffect(() => {
    setCurrentUpvotes(issue.upvoteCount || 0)
  }, [issue.upvoteCount])


  useEffect(() => {
    setHasUpvoted(issue.hasCurrentUserUpvoted || false)
  }, [issue.hasCurrentUserUpvoted])


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
      case 'high': return 'High'
      case 'medium': return 'Medium'
      case 'low': return 'Low'
      default: return 'Unknown'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(dateString)
  }

  const handleUpvote = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (upvoting || hasUpvoted) return
    
    try {
      setUpvoting(true)
      
      // apiResponse will be { issue: {...} } based on your screenshot
      const apiResponse = await issueService.upvoteIssue(issue._id)
      
      // *** FIX ***
      // The actual issue object is one level deeper, inside the 'issue' key
      const updatedIssue = apiResponse.issue 
      // *** END FIX ***
      
      if (updatedIssue && typeof updatedIssue.upvoteCount === 'number') {
        const newUpvotes = updatedIssue.upvoteCount
        setCurrentUpvotes(newUpvotes)
        
        // Also read the new `hasCurrentUserUpvoted` property from the API response
        setHasUpvoted(updatedIssue.hasCurrentUserUpvoted) 
        
        if (onUpvote) {
          onUpvote(issue._id, newUpvotes)
        }
      } else {
        // Updated warning message for clarity
        console.warn('Upvote API call did not return an updated issue object.')
      }
    } catch (error) {
      console.error('Failed to upvote:', error)
    } finally {
      setUpvoting(false)
    }
  }

  return (
    <Link 
      to={`/app/issues/${issue._id}`}
      className="block group"
    >
      <div className="card hover:shadow-lg transition-all duration-300 border border-gray-200 group-hover:border-primary-300 h-full flex flex-col">
        {/* Header with status and priority */}
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
            {issue.status.replace('-', ' ')}
          </span>
          <div className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.urgency)}`}></div>
            <span className="text-xs text-gray-500 font-medium">
              {getPriorityText(issue.urgency)}
            </span>
          </div>
        </div>

        {/* Issue title and description */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {issue.title}
          </h3>
          
          {issue.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {issue.description}
            </p>
          )}

          {/* Category and location */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
              {issue.category}
            </span>
            {issue.location && (
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                <span className="text-xs">{issue.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Footer with metadata */}
        <div className="border-t border-gray-100 pt-3 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {issue.createdBy?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                <div className="font-medium text-gray-700">{issue.createdBy?.name || 'Unknown'}</div>
                <div>{getTimeAgo(issue.createdAt)}</div>
              </div>
            </div>

            {/* Upvote button */}
            <button
              onClick={handleUpvote}
              // *** NEW ***
              // Disable if upvoting OR if user has already upvoted
              disabled={upvoting || hasUpvoted}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg border transition-colors group/upvote
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
                <div className="w-3 h-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                // *** NEW ***
                // Change SVG color if upvoted
                <svg 
                  className={`w-4 h-4 transition-colors
                    ${
                      hasUpvoted
                        ? 'text-primary-600' // Color for "already upvoted"
                        : 'text-gray-400 group-hover/upvote:text-primary-600' // Color for "not upvoted"
                    }
                  `} 
                  fill={hasUpvoted ? 'currentColor' : 'none'} // Fill the icon if upvoted
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              )}
              {/* *** NEW *** */}
              {/* Change text color if upvoted */}
              <span 
                className={`text-sm font-medium transition-colors
                  ${
                    hasUpvoted
                      ? 'text-primary-700' // Color for "already upvoted"
                      : 'text-gray-700 group-hover/upvote:text-primary-600' // Color for "not upvoted"
                  }
                `}
              >
                {currentUpvotes}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default IssueCard