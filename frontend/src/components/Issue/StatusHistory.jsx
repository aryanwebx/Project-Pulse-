const StatusHistory = ({ issue }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-500'
      case 'in-progress': return 'bg-blue-500'
      case 'resolved': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Open'
      case 'in-progress': return 'In Progress'
      case 'resolved': return 'Resolved'
      default: return status
    }
  }

  if (!issue.statusHistory || issue.statusHistory.length === 0) {
    return null
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
      
      <div className="space-y-4">
        {issue.statusHistory.map((history, index) => (
          <div key={index} className="flex space-x-3">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(history.status)}`}></div>
              {index < issue.statusHistory.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(history.status)}`}>
                  {getStatusText(history.status)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(history.createdAt)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                <span className="font-medium">{history.updatedBy?.name || 'System'}</span>
                {history.notes && (
                  <span>: {history.notes}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatusHistory