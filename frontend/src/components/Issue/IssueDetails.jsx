const IssueDetails = ({ issue }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Details</h3>
      
      <div className="space-y-6">
        {/* Description */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Category:</span>
                <div className="font-medium text-gray-900">{issue.category}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Location:</span>
                <div className="font-medium text-gray-900">{issue.location}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Reported:</span>
                <div className="font-medium text-gray-900">{formatDate(issue.createdAt)}</div>
              </div>
              {issue.updatedAt !== issue.createdAt && (
                <div>
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <div className="font-medium text-gray-900">{formatDate(issue.updatedAt)}</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Status Information</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Current Status:</span>
                <div className="font-medium text-gray-900 capitalize">{issue.status.replace('-', ' ')}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Priority:</span>
                <div className="font-medium text-gray-900 capitalize">{issue.urgency}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Upvotes:</span>
                <div className="font-medium text-gray-900">{issue.upvoteCount}</div>
              </div>
              {issue.assignedTo && (
                <div>
                  <span className="text-sm text-gray-600">Assigned To:</span>
                  <div className="font-medium text-gray-900">{issue.assignedTo.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueDetails