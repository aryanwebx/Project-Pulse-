import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'; // Use react-router-dom
import { useAuth } from '../contexts/AuthContext'
import { useCommunity } from '../contexts/CommunityContext'
import { issueService } from '../services/issueService'
import IssueHeader from '../components/Issue/IssueHeader'
import IssueImages from '../components/Issue/IssueImages'
import IssueDetails from '../components/Issue/IssueDetails'
import CommentSection from '../components/Issue/CommentSection'
import StatusHistory from '../components/Issue/StatusHistory'
import io from 'socket.io-client' // *** 1. IMPORT io ***

// *** 2. DEFINE Socket Server URL (use environment variable from Vite) ***
// Make sure VITE_API_URL is set in your frontend/.env file
const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const IssueDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentCommunity } = useCommunity()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // --- Effect to load initial issue data ---
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts quickly

    const loadIssue = async () => {
      try {
        setLoading(true);
        setError(''); // Reset error on new load attempt
        console.log(`Fetching issue ${id}...`);
        const issueData = await issueService.getIssueById(id);
        console.log("Fetched initial issue data:", issueData);
        if (isMounted) {
            setIssue(issueData); // issueData should be the unwrapped issue object
        }
      } catch (err) { // Changed 'error' to 'err' to avoid conflict
        console.error('Failed to load issue:', err);
         if (isMounted) {
             const errMsg = err.response?.data?.error || err.message || 'Failed to load issue details. Please try again.';
            setError(errMsg);
         }
      } finally {
         if (isMounted) {
            setLoading(false);
         }
      }
    };

    if (id) {
        loadIssue();
    } else {
        if (isMounted) {
            setError("Invalid issue ID provided.");
            setLoading(false);
        }
    }

    // Cleanup function to set isMounted to false when component unmounts
    return () => {
        console.log(`IssueDetail unmounting (or ID changing from ${id})`);
        isMounted = false;
    };
  }, [id]); // Re-run effect if the 'id' parameter changes

  // --- 3. WebSocket Listener Effect ---
  useEffect(() => {
    // Only connect if we have a valid issue ID *and* the issue data has loaded
    if (!id || !issue) {
        console.log("Socket: Skipping connection (no id or initial issue data yet).");
        return; // Don't connect until the initial data is loaded
    }

    console.log(`Socket: Attempting to connect to ${SOCKET_SERVER_URL} for issue ${id}`);
    const socket = io(SOCKET_SERVER_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
    });

    // --- Socket Event Handlers ---
    socket.on('connect', () => {
        console.log(`🔌 Socket connected with ID: ${socket.id}`);
        socket.emit('join:issue', id);
        console.log(`Socket: Emitted 'join:issue' for room ${id}`);
    });

    socket.on('disconnect', (reason) => {
        console.log(`🔥 Socket disconnected: ${reason}`);
    });

    socket.on('connect_error', (error) => {
        console.error(`❌ Socket connection error:`, error.message);
    });

    // --- Application Event Listeners ---
    socket.on('comment:new', (newComment) => {
      console.log('Socket: Received new comment:', newComment);
      setIssue((prevIssue) => {
        if (!prevIssue) return null;
        if (prevIssue.comments && prevIssue.comments.some(c => c._id === newComment._id)) {
          console.log(`Socket: Ignored duplicate 'comment:new' for comment ${newComment._id}`);
          return prevIssue;
        }
        console.log(`Socket: Adding new comment ${newComment._id} to state.`);
        return {
          ...prevIssue,
          comments: [...(prevIssue.comments || []), newComment]
        };
      });
    });

    socket.on('issue:update', (updatedIssueFromServer) => {
      console.log('Socket: Received issue update:', updatedIssueFromServer);
      // Replace state with the latest data from the server
      setIssue(updatedIssueFromServer);
    });

    // --- Cleanup Function ---
    return () => {
      console.log(`Socket: Disconnecting from room ${id}`);
      socket.disconnect();
    };
    // Re-run this effect if the ID changes OR if the initial `issue` object load completes
  }, [id, issue?._id]); // Dependency on issue?._id ensures connection only after initial load

  // --- Action Handlers ---

  // Handle upvote (sends API request, update comes via socket)
  const handleUpvote = async () => {
    if (!issue) return;
    try {
      console.log(`Upvoting issue ${issue._id}...`);
      await issueService.upvoteIssue(issue._id);
      console.log(`Upvote API call successful for ${issue._id}. Waiting for socket update.`);
      // NO setIssue here - socket 'issue:update' listener handles it
    } catch (err) {
      console.error('Failed to upvote:', err.response?.data?.error || err.message);
      setError(`Upvote failed: ${err.response?.data?.error || err.message}`);
    }
  };

  // Handle status update (sends API request, update comes via socket)
  const handleStatusUpdate = async (newStatus, adminNotes = '') => {
    if (!issue) return;
    try {
        console.log(`Updating status for ${issue._id} to ${newStatus}...`);
      await issueService.updateIssueStatus(issue._id, newStatus, adminNotes);
      console.log(`Status update API call successful for ${issue._id}. Waiting for socket update.`);
      // NO setIssue here - socket 'issue:update' listener handles it
    } catch (err) {
      console.error('Failed to update status:', err.response?.data?.error || err.message);
      setError(`Status update failed: ${err.response?.data?.error || err.message}`);
    }
  };

  // Handle comment added (called by form *and* socket listener)
  const handleCommentAdded = (newComment) => {
    console.log(`handleCommentAdded called with comment ID: ${newComment?._id}`);
    setIssue((prevIssue) => {
      if (!prevIssue) return null;
      // Prevent duplicates
      if (prevIssue.comments && prevIssue.comments.some(c => c._id === newComment._id)) {
        console.log(`handleCommentAdded: Comment ${newComment._id} already exists, skipping state update.`);
        return prevIssue;
      }
       console.log(`handleCommentAdded: Adding comment ${newComment._id} to state.`);
      return {
        ...prevIssue,
        comments: [...(prevIssue.comments || []), newComment]
      };
    });
  };

  // --- Render Logic ---
  if (loading) {
     return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
            {/* Improved Loading Skeleton */}
            <div className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-6"></div> {/* Back link skel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                         <div className="card h-40 bg-gray-200 rounded-lg"></div> {/* Header skel */}
                         <div className="card h-64 bg-gray-200 rounded-lg"></div> {/* Details skel */}
                         <div className="card h-48 bg-gray-200 rounded-lg"></div> {/* Comments skel */}
                    </div>
                    <div className="space-y-6">
                        <div className="card h-32 bg-gray-200 rounded-lg"></div> {/* Sidebar skel 1 */}
                        <div className="card h-32 bg-gray-200 rounded-lg"></div> {/* Sidebar skel 2 */}
                    </div>
                </div>
            </div>
        </div>
     );
  }

  if (error) {
     return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card bg-red-50 border border-red-200 text-center py-16">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-red-800 mb-4">Error Loading Issue</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <Link
                to="/app/issues"
                className="btn-secondary inline-flex items-center space-x-2"
            >
                <span>Back to Issues List</span>
            </Link>
            </div>
        </div>
     );
  }

  if (!issue) {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h1>
            <p className="text-gray-600 mb-6">The specific issue you are looking for could not be found, or it may have been deleted.</p>
            <Link
                to="/app/issues"
                className="btn-primary inline-flex items-center space-x-2"
            >
                <span>Back to Issues List</span>
            </Link>
            </div>
        </div>
    );
  }

  // Determine if the current user is an admin for UI elements
  const isAdmin = user?.role === 'community_admin' || user?.role === 'super_admin';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10"> {/* Add padding bottom */}
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to="/app/issues"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Issues List</span>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <IssueHeader
            issue={issue} // Pass the complete, updated issue object
            onUpvote={handleUpvote} // Pass the handler
            isAdmin={isAdmin}
            onStatusUpdate={handleStatusUpdate} // Pass the handler
          />
          {/* Conditionally render IssueImages */}
          {issue.images && issue.images.length > 0 && (
            <IssueImages images={issue.images} />
          )}
          <IssueDetails issue={issue} />
          <CommentSection
            issue={issue} // Pass the complete, updated issue object
            onCommentAdded={handleCommentAdded} // Pass the handler
          />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-6"> {/* Optional: Make sidebar sticky */}
          <StatusHistory issue={issue} />

          {/* AI Analysis Card (Check if data exists) */}
          {issue.aiAnalysis && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                 <span role="img" aria-label="AI brain" className="mr-2 text-xl">🧠</span>
                AI Analysis
              </h3>
              <div className="space-y-3 text-sm">
                {/* Display AI fields only if they exist */}
                {issue.aiAnalysis.predictedCategory && (
                  <div>
                    <span className="text-gray-600">Predicted Category:</span>
                    <p className="font-medium text-gray-900">{issue.aiAnalysis.predictedCategory}</p>
                  </div>
                )}
                 {issue.aiAnalysis.sentiment && (
                  <div>
                    <span className="text-gray-600">Sentiment:</span>
                    <p className="font-medium text-gray-900 capitalize">{issue.aiAnalysis.sentiment}</p>
                  </div>
                )}
                 {issue.aiAnalysis.summary && (
                  <div>
                    <span className="text-gray-600">AI Summary:</span>
                    <p className="text-gray-700 italic">"{issue.aiAnalysis.summary}"</p>
                  </div>
                )}
                 {issue.aiAnalysis.suggestedTags && issue.aiAnalysis.suggestedTags.length > 0 && (
                     <div>
                        <span className="text-gray-600">Suggested Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                        {issue.aiAnalysis.suggestedTags.map((tag, index) => (
                            <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
                            >
                            {tag}
                            </span>
                        ))}
                        </div>
                    </div>
                )}
                 {/* Confidence (Optional) */}
                {issue.aiAnalysis.confidence !== undefined && issue.aiAnalysis.confidence !== null && (
                    <div>
                        <span className="text-sm text-gray-600">Prediction Confidence:</span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(issue.aiAnalysis.confidence || 0) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                            {Math.round((issue.aiAnalysis.confidence || 0) * 100)}%
                        </span>
                    </div>
                )}
              </div>
            </div>
          )}

          {/* Community Info Card */}
          {currentCommunity?.community && ( // Check if community data is loaded
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
                  {/* Display subdomain or fallback */}
                  <span>{currentCommunity.community.subdomain || 'N/A'}</span>
                </div>
                 {/* Display Contact Email */}
                 {currentCommunity.community.contactEmail && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                           <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                           <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                        </svg>
                        <a href={`mailto:${currentCommunity.community.contactEmail}`} className="hover:text-primary-600">{currentCommunity.community.contactEmail}</a>
                    </div>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IssueDetail