import { useMemo } from 'react';

const StatusHistory = ({ issue }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // --- FIX: Use correct status names ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'acknowledged': return 'bg-yellow-500'; // Added
      case 'in_progress': return 'bg-blue-500'; // Fixed
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Open';
      case 'acknowledged': return 'Acknowledged'; // Added
      case 'in_progress': return 'In Progress'; // Fixed
      case 'resolved': return 'Resolved';
      default: return (status || '').replace(/_/g, ' '); // Handle unknown
    }
  }
  // --- END FIX ---

  // --- FIX: Read from issue.comments and filter ---
  // Use useMemo to filter the comments array only when issue.comments changes
  const statusHistory = useMemo(() => {
    if (!issue || !issue.comments) {
      return [];
    }
    // Find all comments that were created by an admin during a status update
    return issue.comments
      .filter(comment => comment.isAdminUpdate === true)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Ensure they are in order
  }, [issue.comments]);
  // --- END FIX ---

  // Show nothing if there's no history
  if (statusHistory.length === 0) {
    // You could show a "Created" status as a fallback
    return (
        <div className="card">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
             <div className="flex space-x-3">
                <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2 py-1 rounded text-xs font-medium text-white bg-red-500">Open</span>
                        <span className="text-xs text-gray-500">{formatDate(issue.createdAt)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">{issue.createdBy?.name || 'System'}</span>
                        <span>: Issue Created</span>
                    </div>
                </div>
             </div>
        </div>
    );
  }

  // Render the filtered history
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
      
      <div className="space-y-4">
        {/* Manually add the "Created" event first */}
         <div className="flex space-x-3">
            <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
            </div>
            <div className="flex-1 pb-4">
                <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-1 rounded text-xs font-medium text-white bg-red-500">Open</span>
                    <span className="text-xs text-gray-500">{formatDate(issue.createdAt)}</span>
                </div>
                <div className="text-sm text-gray-600">
                    <span className="font-medium">{issue.createdBy?.name || 'System'}</span>
                    <span>: Issue Created</span>
                </div>
            </div>
         </div>

        {/* Map over the admin comments */}
        {statusHistory.map((history, index) => (
          <div key={history._id} className="flex space-x-3">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              {/* --- FIX: Use correct status field --- */}
              <div className={`w-3 h-3 rounded-full ${getStatusColor(history.statusUpdate.newStatus)}`}></div>
              {index < statusHistory.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center space-x-2 mb-1">
                {/* --- FIX: Use correct status field --- */}
                <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(history.statusUpdate.newStatus)}`}>
                  {getStatusText(history.statusUpdate.newStatus)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(history.createdAt)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                {/* --- FIX: Use author and content --- */}
                <span className="font-medium">{history.author?.name || 'System'}</span>
                {history.content && (
                  <span className="italic">: "{history.content}"</span> // Display the note
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