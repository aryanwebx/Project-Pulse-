import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { useCommunity } from '../contexts/CommunityContext'
import { issueService } from '../services/issueService'
import IssueHeader from '../components/Issue/IssueHeader'
import IssueImages from '../components/Issue/IssueImages'
import IssueDetails from '../components/Issue/IssueDetails'
import CommentSection from '../components/Issue/CommentSection'
import StatusHistory from '../components/Issue/StatusHistory'

const IssueDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentCommunity } = useCommunity()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadIssue = async () => {
      try {
        setLoading(true)
        // This service call now returns the unwrapped issue object
        const issueData = await issueService.getIssueById(id)
        setIssue(issueData)
      } catch (error) {
        console.error('Failed to load issue:', error)
        setError('Failed to load issue details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadIssue()
  }, [id])

  // *** FIX: Replace the old handleUpvote function ***
  const handleUpvote = async () => {
    if (!issue) return

    try {
      // The service returns { issue: {...} }
      const apiResponse = await issueService.upvoteIssue(issue._id)
      
      // Check if the response is valid and has the new issue object
      if (apiResponse && apiResponse.issue) {
        // Replace the entire issue state with the updated object from the server
        setIssue(apiResponse.issue)
      } else {
        console.warn('Upvote response did not contain an updated issue object.')
      }
    } catch (error) {
      console.error('Failed to upvote:', error)
    }
  }
  // *** END FIX ***

  const handleStatusUpdate = async (newStatus, adminNotes = '') => {
    if (!issue) return

    try {
      // This service call now returns the unwrapped, updated issue
      const updatedIssue = await issueService.updateIssueStatus(issue._id, newStatus, adminNotes)
      setIssue(updatedIssue) // Set the new issue object
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleCommentAdded = (newComment) => {
    if (!issue) return

    setIssue(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment] // Safely add to comments array
    }))
  }

  if (loading) {
    return (
      // Loading skeleton...
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      // Error message...
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/app/issues" 
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>Back to Issues</span>
          </Link>
        </div>
      </div>
    )
  }

  if (!issue) {
    return (
      // No issue found...
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h1>
          <p className="text-gray-600 mb-6">The issue you're looking for doesn't exist.</p>
          <Link 
            to="/app/issues" 
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>Back to Issues</span>
          </Link>
        </div>
      </div>
    )
  }

  const isAdmin = user?.role === 'community_admin' || user?.role === 'super_admin'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link 
          to="/app/issues" 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Issues</span>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Header */}
          <IssueHeader 
            issue={issue} 
            onUpvote={handleUpvote}
            isAdmin={isAdmin}
            onStatusUpdate={handleStatusUpdate}
          />

          {/* Image Gallery */}
          {issue.images && issue.images.length > 0 && (
            <IssueImages images={issue.images} />
          )}

          {/* Description & Details */}
          <IssueDetails issue={issue} />

          {/* Comments Section */}
          <CommentSection 
            issue={issue}
            onCommentAdded={handleCommentAdded}
          />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Status History */}
          <StatusHistory issue={issue} />

          {/* AI Analysis */}
          {issue.aiAnalysis && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                AI Analysis
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(issue.aiAnalysis.confidence || 0) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round((issue.aiAnalysis.confidence || 0) * 100)}% confident
                  </span>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Suggested Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {issue.aiAnalysis.suggestedTags?.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Community Info */}
          {currentCommunity && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Community</h3>
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">{currentCommunity.community.name}</p>
                {currentCommunity.community.description && (
                  <p className="text-sm text-gray-600">{currentCommunity.community.description}</p>
                )}
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <span>{currentCommunity.community.subdomain || 'Community Area'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IssueDetail