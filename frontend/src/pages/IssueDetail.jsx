import { useParams, Link } from 'react-router'

const IssueDetail = () => {
  const { id } = useParams()

  return (
    <div className="max-w-4xl mx-auto">
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

      <div className="card text-center py-16">
        <div className="text-6xl mb-4">🔧</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Issue Details</h1>
        <p className="text-gray-600 mb-6">
          Detailed view for issue #{id}
        </p>
        <p className="text-gray-500 text-sm">
          This page will show complete issue details, comments, and updates.
        </p>
      </div>
    </div>
  )
}

export default IssueDetail