import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { issueService } from '../../services/issueService'

// Utility to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// A dedicated form for replying
const CommentForm = ({ issueId, parentCommentId, onCommentAdded, onCancel }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const commentData = {
        content: content.trim(),
        parentComment: parentCommentId // This is the key for nesting
      }
      
      const result = await issueService.addComment(issueId, commentData)
      onCommentAdded(result) // Pass the new comment up
      setContent('')
      if (onCancel) onCancel() // Close the reply box
    } catch (error) {
      console.error('Failed to post reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 ml-11">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        disabled={submitting}
      />
      <div className="flex items-center justify-end space-x-2 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="btn-primary px-3 py-1 text-sm disabled:opacity-50"
        >
          {submitting ? 'Replying...' : 'Reply'}
        </button>
      </div>
    </form>
  )
}

// The main recursive component
const Comment = ({ comment, issueId, onCommentAdded, replies = [] }) => {
  const { user } = useAuth()
  const [showReplyBox, setShowReplyBox] = useState(false)

  return (
    <div className="flex space-x-3">
      {/* Avatar */}
      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shrink-0">
        <span className="text-white text-sm font-medium">
          {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        {/* Comment Body */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900 text-sm">
              {comment.author?.name || 'Unknown User'}
            </span>
            <span className="text-gray-500 text-xs">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
        
        {/* Reply Button */}
        {user && (
          <div className="mt-2 ml-2">
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Reply
            </button>
          </div>
        )}

        {/* Reply Form (shows on click) */}
        {showReplyBox && (
          <CommentForm
            issueId={issueId}
            parentCommentId={comment._id}
            onCommentAdded={onCommentAdded}
            onCancel={() => setShowReplyBox(false)}
          />
        )}

        {/* Render Replies (Recursive) */}
        <div className="space-y-4 mt-4">
          {replies.map(reply => (
            <Comment
              key={reply._id}
              comment={reply}
              issueId={issueId}
              onCommentAdded={onCommentAdded}
              replies={reply.replies} // This is the recursion
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Comment