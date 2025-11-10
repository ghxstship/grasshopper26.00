/**
 * CommentThread Component
 * GHXSTSHIP Entertainment Platform - Threaded comments system
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './CommentThread.module.css'

export interface Comment {
  id: string
  author: string
  content: string
  timestamp: Date
  replies?: Comment[]
  mentions?: string[]
  attachments?: Array<{ name: string; url: string }>
}

export interface CommentThreadProps {
  comments: Comment[]
  onCommentAdd?: (content: string, parentId?: string) => void
  onCommentEdit?: (commentId: string, content: string) => void
  onCommentDelete?: (commentId: string) => void
  currentUser?: string
  className?: string
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  onCommentAdd,
  onCommentEdit,
  onCommentDelete,
  currentUser,
  className = '',
}) => {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleAddComment = () => {
    if (newComment.trim()) {
      onCommentAdd?.(newComment)
      setNewComment('')
    }
  }

  const handleAddReply = (parentId: string) => {
    if (replyContent.trim()) {
      onCommentAdd?.(replyContent, parentId)
      setReplyContent('')
      setReplyingTo(null)
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${styles.comment} ${isReply ? styles.reply : ''}`}>
      <div className={styles.commentHeader}>
        <span className={styles.author}>{comment.author}</span>
        <span className={styles.timestamp}>{getRelativeTime(comment.timestamp)}</span>
      </div>

      <div className={styles.commentContent}>
        <p className={styles.content}>{comment.content}</p>
        
        {comment.attachments && comment.attachments.length > 0 && (
          <div className={styles.attachments}>
            {comment.attachments.map((attachment, idx) => (
              <a key={idx} href={attachment.url} className={styles.attachment}>
                📎 {attachment.name}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className={styles.commentActions}>
        <button
          className={styles.actionButton}
          onClick={() => setReplyingTo(comment.id)}
        >
          Reply
        </button>
        {currentUser === comment.author && onCommentEdit && (
          <button className={styles.actionButton}>Edit</button>
        )}
        {currentUser === comment.author && onCommentDelete && (
          <button
            className={styles.actionButton}
            onClick={() => onCommentDelete(comment.id)}
          >
            Delete
          </button>
        )}
      </div>

      {replyingTo === comment.id && (
        <div className={styles.replyBox}>
          <textarea
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className={styles.replyInput}
            rows={2}
          />
          <div className={styles.replyActions}>
            <button
              className={styles.cancelButton}
              onClick={() => {
                setReplyingTo(null)
                setReplyContent('')
              }}
            >
              Cancel
            </button>
            <button
              className={styles.submitButton}
              onClick={() => handleAddReply(comment.id)}
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.replies}>
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  )

  return (
    <div className={`${styles.thread} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Comments</h3>
        <span className={styles.count}>{comments.length}</span>
      </div>

      <div className={styles.newComment}>
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className={styles.commentInput}
          rows={3}
        />
        <button className={styles.submitButton} onClick={handleAddComment}>
          Post Comment
        </button>
      </div>

      <div className={styles.comments}>
        {comments.map(comment => renderComment(comment))}
      </div>
    </div>
  )
}

CommentThread.displayName = 'CommentThread'
