import { useState, useEffect } from 'react'; // Keep useEffect
import { useAuth } from '../../contexts/AuthContext';

const IssueHeader = ({ issue, onUpvote, isAdmin, onStatusUpdate }) => {
  const { user } = useAuth();
  const [upvoting, setUpvoting] = useState(false);
  // State for the Status Update Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState(issue.status);
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  // State for Upvote button appearance
  const [hasUpvoted, setHasUpvoted] = useState(issue.hasCurrentUserUpvoted || false);

  // Sync local state when the main issue prop changes (e.g., from socket update)
  useEffect(() => {
    setHasUpvoted(issue.hasCurrentUserUpvoted || false);
    // Also reset the modal's selected status if the issue's actual status changes
    setNewStatus(issue.status);
  }, [issue.hasCurrentUserUpvoted, issue.status]); // Depend on both properties


  // --- Helper Functions ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Added acknowledged
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500'; // Keep default for 'critical' or others
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'critical': return 'Critical Priority';
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Unknown Priority';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- Event Handlers ---
  const handleUpvoteClick = async () => {
    if (upvoting || hasUpvoted) return; // Prevent multiple clicks
    setUpvoting(true);
    try {
        await onUpvote(); // Call parent handler (IssueDetail)
    } catch (error) {
        console.error("Upvote failed in header:", error);
    } finally {
        setUpvoting(false);
    }
    // State updates (hasUpvoted, issue.upvoteCount) happen via props from IssueDetail
  };

  // Handler for submitting the status update modal
  const handleStatusSubmit = async () => {
    // Check if status actually changed
    if (!newStatus || newStatus === issue.status) {
      setShowStatusModal(false); // Close modal if no change
      setAdminNotes(''); // Clear notes
      return;
    }

    setUpdatingStatus(true);
    try {
        // Call the handler passed from IssueDetail
        await onStatusUpdate(newStatus, adminNotes);
        // Success: Close modal (state update happens via socket in IssueDetail)
        setShowStatusModal(false);
        setAdminNotes(''); // Clear notes on success
    } catch (error) {
        console.error("Status update failed in header:", error);
        // Optionally show error within the modal itself
        alert(`Failed to update status: ${error.message || 'Please try again.'}`);
    } finally {
        setUpdatingStatus(false);
    }
  };

  return (
    <div className="card shadow-sm rounded-lg"> {/* Added shadow/rounded */}
      {/* Status and Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200"> {/* Added border */}
        {/* Status/Priority Display */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2"> {/* Added wrap */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium border whitespace-nowrap ${getStatusColor(issue.status)}`}>
            {/* Handle potential undefined status gracefully */}
            {(issue.status || 'unknown').replace(/_/g, ' ').toUpperCase()}
          </span>
          <div className="flex items-center space-x-1.5"> {/* Adjusted spacing */}
            <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.urgency)}`}></div>
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
              {getPriorityText(issue.urgency)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 shrink-0"> {/* Prevent shrinking */}
          {/* Upvote Button */}
          <button
            onClick={handleUpvoteClick}
            disabled={upvoting || hasUpvoted}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors group/upvote text-sm font-medium
              ${ hasUpvoted ? 'bg-indigo-50 border-indigo-300 cursor-default' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'}
              ${ upvoting ? 'opacity-50 cursor-wait' : (hasUpvoted ? 'opacity-70' : '') }
            `}
            title={hasUpvoted ? "You have upvoted this issue" : "Upvote this issue"}
          >
            {upvoting ? (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg /* Thumbs Up SVG */
                className={`w-5 h-5 transition-colors ${ hasUpvoted ? 'text-indigo-600' : 'text-gray-500 group-hover/upvote:text-indigo-600' }`}
                fill={hasUpvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"
              >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            )}
            <span
              className={`transition-colors ${ hasUpvoted ? 'text-indigo-700' : 'text-gray-700 group-hover/upvote:text-indigo-700'}`}
            >
              {issue.upvoteCount ?? 0}
            </span>
          </button>

          {/* Admin Status Update Button - Conditionally Rendered */}
          {isAdmin && (
            <button
              onClick={() => {
                  setNewStatus(issue.status); // Reset modal status on open
                  setAdminNotes(''); // Clear notes on open
                  setShowStatusModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Update Status
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 wrap-break-word"> {/* Allow title to wrap */}
        {issue.title}
      </h1>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
         {/* Reporter Info */}
          <div className="flex items-center space-x-2">
            {/* Basic Avatar Placeholder */}
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden" title={issue.createdBy?.name || 'Unknown User'}>
                <span className="text-gray-600 text-sm font-medium">
                {issue.createdBy?.name?.charAt(0).toUpperCase() || '?'}
                </span>
            </div>
            <div>
                <span className="font-medium text-gray-900">{issue.createdBy?.name || 'Unknown User'}</span>
                <div className="text-xs text-gray-500">Reported {formatDate(issue.createdAt)}</div>
            </div>
        </div>

        {/* Assigned To Info (if applicable) */}
        {issue.assignedTo && (
            <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
                 <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden" title={`Assigned to ${issue.assignedTo.name}`}>
                    <span className="text-gray-600 text-xs font-medium">
                        {issue.assignedTo.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                 </div>
                 <div>
                    <span className="text-xs text-gray-500">Assigned to</span>
                    <div className="font-medium text-gray-900 text-sm">{issue.assignedTo.name}</div>
                </div>
            </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        // Modal backdrop (handles closing on outside click)
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={() => setShowStatusModal(false)} // Close on backdrop click
            role="dialog" // Accessibility
            aria-modal="true"
            aria-labelledby="status-modal-title"
        >
          {/* Modal content (prevents closing when clicking inside) */}
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4 overflow-hidden transform transition-all duration-300"
            onClick={e => e.stopPropagation()} // Prevent backdrop click handler
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
                 <h3 id="status-modal-title" className="text-lg font-semibold text-gray-900">Update Issue Status</h3>
                 <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label="Close modal"
                 >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              {/* Status Select */}
              <div>
                <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">
                  New Status *
                </label>
                <select
                  id="status-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  aria-required="true"
                >
                  {/* Valid status options from your backend model */}
                  <option value="open">Open</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Admin Notes Textarea */}
              <div>
                <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes (Optional)
                </label>
                <textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any relevant notes about this status change..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none sm:text-sm"
                  maxLength={500}
                />
                 <p className="mt-1 text-xs text-gray-500 text-right">{adminNotes.length}/500</p>
              </div>
            </div>

            {/* Modal Footer/Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusSubmit} // Use the correct handler
                // Disable if loading OR if the status hasn't actually changed
                disabled={updatingStatus || newStatus === issue.status}
                className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {updatingStatus ? (
                     <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                     </div>
                ) : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IssueHeader;