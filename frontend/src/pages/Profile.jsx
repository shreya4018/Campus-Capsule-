import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const roleBadgeClass = { admin: 'badge-admin', teacher: 'badge-teacher', student: 'badge-student' };

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all years then all posts and filter by current user
    Promise.all([api.get('/years'), api.get('/posts')])
      .then(async ([yearsRes]) => {
        const years = yearsRes.data;
        const allPosts = [];
        for (const year of years) {
          try {
            const res = await api.get(`/posts?year_id=${year.id}`);
            allPosts.push(...res.data);
          } catch { /* skip */ }
        }
        setMyPosts(allPosts.filter(p => p.author_id === user?.id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const totalLikes = myPosts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);

  return (
    <div>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {getInitials(user?.full_name)}
        </div>
        <div className="profile-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="page-title" style={{ fontSize: '1.25rem' }}>{user?.full_name}</h1>
            <span className={`badge ${roleBadgeClass[user?.role] || ''}`}>{user?.role}</span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginTop: '0.2rem' }}>{user?.email}</p>
          <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar" style={{ marginBottom: '2rem' }}>
        <div className="stat-pill">
          <span className="stat-icon">📸</span>
          <span className="stat-value">{myPosts.length}</span>
          <span className="stat-label">posts</span>
        </div>
        <div className="stat-pill">
          <span className="stat-icon">❤️</span>
          <span className="stat-value">{totalLikes}</span>
          <span className="stat-label">total likes</span>
        </div>
      </div>

      {/* Photo Grid */}
      <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
        Your Memories
      </h2>
      {loading ? (
        <div className="page-loader"><div className="spinner spinner-lg"></div></div>
      ) : myPosts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No posts yet</h3>
          <p>You haven't shared any memories yet.</p>
        </div>
      ) : (
        <div className="photo-grid">
          {myPosts.map(post => (
            <div key={post.id} className="photo-grid-item">
              <img src={post.image_url} alt={post.caption || 'Memory'} />
              <div className="photo-grid-overlay">
                <span>❤️ {post.likes?.length || 0}</span>
                <span>💬 {post.comments?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
