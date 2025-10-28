import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useCommunity } from '../contexts/CommunityContext'
import { useAuth } from '../contexts/AuthContext'
import { issueService } from '../services/issueService'
import IssueForm from '../components/Issue/IssueForm'

const CreateIssue = () => {
  const navigate = useNavigate()
  const { currentCommunity } = useCommunity()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (formData) => {
    if (!currentCommunity) {
      setError('No community selected')
      return
    }

    setLoading(true)
    setError('')

    try {
      const issueData = {
        ...formData,
        community: currentCommunity.community._id,
        createdBy: user._id
      }

      console.log('Submitting issue:', issueData)
      const result = await issueService.createIssue(issueData)
      console.log('Issue created successfully:', result)

      // Redirect to the new issue detail page or issues list
      navigate('/app/issues', { 
        state: { message: 'Issue reported successfully!' } 
      })
    } catch (error) {
      console.error('Failed to create issue:', error)
      setError(error.response?.data?.message || 'Failed to create issue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/app/issues')
  }

  if (!currentCommunity) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">🏘️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Community Selected</h1>
          <p className="text-gray-600 mb-6">
            Please select a community to report issues.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Issues</span>
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">Report New Issue</h1>
        <p className="text-gray-600 mt-2">
          Report an issue for {currentCommunity.community.name}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Issue Form */}
      <IssueForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        community={currentCommunity}
      />
    </div>
  )
}

export default CreateIssue