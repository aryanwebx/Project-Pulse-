import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { issueService } from '../../services/issueService';
import Comment from './Comment'; // Import the new component

// This is the top-level form for *new* (non-reply) comments
// MODIFIED: Accept 'issue' as a prop
const NewCommentForm = ({ issue, onCommentAdded }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Add state for AI generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Check if user is an admin
  const isAdmin = user?.role === 'community_admin' || user?.role === 'super_admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const commentData = {
        content: content.trim(),
        parentComment: null, // This is a top-level comment
      };

      // issueService.addComment already returns the populated comment
      const newComment = await issueService.addComment(issue._id, commentData);
      onCommentAdded(newComment); // Pass the new comment up
      setContent('');
    } catch (error) {
      console.error('Failed to post comment:', error);
      // Optionally set an error state to show to the user
    } finally {
      setSubmitting(false);
    }
  };

  // Add handler for the new AI button
  const handleGenerateReply = async () => {
    setIsGenerating(true);
    setAiError('');
    try {
      const data = await issueService.getAiReply(issue._id);
      setContent(data.suggestedReply + '\n\n'); // Set textarea content
    } catch (error) {
      setAiError(error.message || 'Failed to generate reply.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4">
      <div className="flex space-x-3">
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-medium">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a new comment..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            disabled={submitting || isGenerating} // Disable while submitting or generating
          />
          {/* AI Error Message */}
          {aiError && (
            <p className="text-xs text-red-600 mt-1">{aiError}</p>
          )}

          {/* MODIFIED: Button row */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {content.length}/500 characters
            </span>
            <div className="flex space-x-2">
              {/* AI Reply Button - Show only for admins */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleGenerateReply}
                  disabled={isGenerating || submitting}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 flex items-center"
                  title="Generate an AI-assisted reply based on issue status"
                >
                  {isGenerating ? (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <span className="mr-1.5 text-base">✨</span>
                  )}
                  {isGenerating ? 'Generating...' : 'AI Reply'}
                </button>
              )}
              {/* Post Comment Button */}
              <button
                type="submit"
                disabled={!content.trim() || submitting || isGenerating}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

// This helper function builds the nested tree
const buildCommentTree = (comments = []) => {
  // --- FIX: Filter out admin status updates ---
  const userComments = comments.filter((comment) => !comment.isAdminUpdate);
  // --- END FIX ---

  const commentsMap = new Map();
  const topLevelComments = [];

  // Initialize map and add 'replies' array
  for (const comment of userComments) { // Use filtered list
    const commentWithReplies = { ...comment, replies: [] };
    commentsMap.set(comment._id, commentWithReplies);
  }

  // Build the tree
  for (const comment of commentsMap.values()) {
    if (comment.parentComment) {
      const parent = commentsMap.get(comment.parentComment);
      if (parent) {
        parent.replies.push(comment);
      } else {
        // Orphan reply, treat as top-level
        topLevelComments.push(comment);
      }
    } else {
      // This is a top-level comment
      topLevelComments.push(comment);
    }
  }

  // Sort top-level comments by date (oldest first)
  topLevelComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Note: You might also want to sort replies within their parent
  for (const comment of commentsMap.values()) {
    if (comment.replies.length > 1) {
      comment.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
  }

  return topLevelComments;
};

const CommentSection = ({ issue, onCommentAdded }) => {
  const { user } = useAuth();

  // Use useMemo to build the tree only when issue.comments changes
  const commentTree = useMemo(() => buildCommentTree(issue.comments), [issue.comments]);

  // Get the count of *only* user-facing comments
  const userCommentCount = useMemo(() => {
    return (issue.comments || []).filter(comment => !comment.isAdminUpdate).length;
  }, [issue.comments]);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Comments ({userCommentCount}) {/* Show filtered count */}
      </h3>

      {/* Comment List */}
      <div className="space-y-4 mb-6">
        {commentTree.length > 0 ? (
          commentTree.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              issueId={issue._id}
              onCommentAdded={onCommentAdded}
              replies={comment.replies}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>No comments yet</p>
            <p className="text-sm">Be the first to comment on this issue</p>
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      {user ? (
        // Pass the full 'issue' object to NewCommentForm
        <NewCommentForm
          issue={issue} // <-- Pass the issue object here
          onCommentAdded={onCommentAdded}
        />
      ) : (
        <div className="border-t border-gray-200 pt-4 text-center">
          <p className="text-gray-600">Please log in to add comments</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;