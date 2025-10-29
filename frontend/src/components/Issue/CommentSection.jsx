import { useState, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { issueService } from '../../services/issueService'
import Comment from './Comment' // Import the new component

// This is the top-level form for *new* (non-reply) comments
const NewCommentForm = ({ issueId, onCommentAdded }) => {
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
        parentComment: null // This is a top-level comment
      }
      
      const result = await issueService.addComment(issueId, commentData)
      onCommentAdded(result) // Pass the new comment up
      setContent('')
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

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
            disabled={submitting}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {content.length}/500 characters
            </span>
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

// This helper function builds the nested tree
const buildCommentTree = (comments = []) => {
  const commentsMap = new Map()
  const topLevelComments = []

  // Initialize map and add 'replies' array
  for (const comment of comments) {
    const commentWithReplies = { ...comment, replies: [] }
    commentsMap.set(comment._id, commentWithReplies)
  }

  // Build the tree
  for (const comment of commentsMap.values()) {
    if (comment.parentComment) {
      const parent = commentsMap.get(comment.parentComment)
      if (parent) {
        parent.replies.push(comment)
      } else {
        // Orphan reply, treat as top-level
        topLevelComments.push(comment)
      }
    } else {
      // This is a top-level comment
      topLevelComments.push(comment)
    }
  }
  
  return topLevelComments
}


const CommentSection = ({ issue, onCommentAdded }) => {
  const { user } = useAuth()
  
  // Use useMemo to build the tree only when issue.comments changes
  const commentTree = useMemo(() => buildCommentTree(issue.comments), [issue.comments])

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Comments ({issue.comments?.length || 0})
      </h3>

      {/* Comment List */}
      <div className="space-y-4 mb-6">
        {commentTree.length > 0 ? (
          commentTree.map(comment => (
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
        <NewCommentForm 
          issueId={issue._id}
          onCommentAdded={onCommentAdded}
        />
      ) : (
        <div className="border-t border-gray-200 pt-4 text-center">
          <p className="text-gray-600">Please log in to add comments</p>
        </div>
      )}
    </div>
  )
}

export default CommentSection