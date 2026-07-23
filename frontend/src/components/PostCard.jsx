import React, { useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const AVATAR_COLORS = ['avatar-blue', 'avatar-purple', 'avatar-green'];
const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
const getAvatarClass = (id = '') => AVATAR_COLORS[id.charCodeAt(0) % 3];

const HeartFill = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const HeartOutline = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="18" height="18">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="18" height="18">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="14" height="14">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const roleBadgeClass = { admin: 'badge-admin', teacher: 'badge-teacher', student: 'badge-student' };

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const PostCard = ({ post, onPostDeleted }) => {
  const { user } = useContext(AuthContext);
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const isLikedByMe = likes.some(l => l.user_id === user?.id);
  const canDelete = !post.is_archived && (post.author_id === user?.id || user?.role === 'teacher' || user?.role === 'admin');
  const canModerate = !post.is_archived && (user?.role === 'teacher' || user?.role === 'admin');

  const handleLike = async () => {
    if (post.is_archived || isLiking) return;
    setIsLiking(true);
    const prev = [...likes];
    setLikes(isLikedByMe ? likes.filter(l => l.user_id !== user.id) : [...likes, { user_id: user.id }]);
    try {
      await api.post(`/posts/${post.id}/like`);
    } catch {
      setLikes(prev);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || post.is_archived || isCommenting) return;
    setIsCommenting(true);
    try {
      const res = await api.post(`/posts/${post.id}/comments`, { body: newComment });
      setComments([...comments, { ...res.data, author: user }]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      onPostDeleted?.(post.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  const avatarClass = getAvatarClass(post.author_id || '');

  return (
    <div className="card post-card">
      {/* Header */}
      <div className="post-header">
        <div className="post-author">
          <div className={`avatar ${avatarClass}`}>{getInitials(post.author?.full_name)}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="author-name">{post.author?.full_name}</span>
              <span className={`badge ${roleBadgeClass[post.author?.role] || ''}`}>{post.author?.role}</span>
              {post.is_archived && <span className="badge badge-archived">Archived</span>}
            </div>
            <div className="post-time">{timeAgo(post.created_at)}</div>
          </div>
        </div>
        {canDelete && (
          <button onClick={handleDeletePost} className="btn btn-danger btn-sm" title="Delete post">
            <TrashIcon /> Delete
          </button>
        )}
      </div>

      {/* Image */}
      <div className="post-image-container">
        <img src={post.image_url} alt="Post" className="post-image" loading="lazy" />
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button
          onClick={handleLike}
          disabled={post.is_archived}
          className={`action-btn ${isLikedByMe ? 'liked' : ''}`}
        >
          {isLikedByMe ? <HeartFill /> : <HeartOutline />}
          {likes.length > 0 && <span>{likes.length}</span>}
        </button>
        <button className="action-btn" disabled>
          <ChatIcon />
          {comments.length > 0 && <span>{comments.length}</span>}
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="post-body">
          <div className="post-caption">
            <strong>{post.author?.full_name}</strong>{post.caption}
          </div>
        </div>
      )}

      {/* Comments */}
      {comments.length > 0 && (
        <div className="comments-section">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-content">
                <strong>{c.author?.full_name || 'User'}</strong>{c.body}
              </div>
              {(c.author_id === user?.id || canModerate) && (
                <button
                  onClick={() => handleDeleteComment(c.id)}
                  className="comment-delete btn-ghost"
                  title="Delete comment"
                  style={{ padding: '0.1rem 0.25rem', borderRadius: '4px', color: 'var(--text-3)' }}
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Comment Form */}
      {!post.is_archived && (
        <form onSubmit={handleAddComment} className="comment-form">
          <div className={`avatar ${avatarClass}`} style={{ width: '24px', height: '24px', fontSize: '0.6rem' }}>
            {getInitials(user?.full_name)}
          </div>
          <input
            type="text"
            className="comment-input"
            placeholder="Add a comment…"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            className="comment-submit"
            disabled={!newComment.trim() || isCommenting}
          >
            {isCommenting ? '…' : 'Post'}
          </button>
        </form>
      )}
    </div>
  );
};

export default PostCard;
