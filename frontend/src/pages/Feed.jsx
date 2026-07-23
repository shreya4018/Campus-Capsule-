import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const SkeletonCard = () => (
  <div className="card post-card skeleton-card">
    <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem' }}>
      <div className="skel" style={{ width: 34, height: 34, borderRadius: '50%' }} />
      <div style={{ flex: 1 }}>
        <div className="skel" style={{ width: '40%', height: 12, borderRadius: 4, marginBottom: 6 }} />
        <div className="skel" style={{ width: '25%', height: 10, borderRadius: 4 }} />
      </div>
    </div>
    <div className="skel" style={{ width: '100%', height: 300 }} />
    <div style={{ padding: '1rem' }}>
      <div className="skel" style={{ width: '60%', height: 10, borderRadius: 4 }} />
    </div>
  </div>
);

const StatPill = ({ icon, label, value }) => (
  <div className="stat-pill">
    <span className="stat-icon">{icon}</span>
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
);

const Feed = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [years, setYears] = useState([]);
  const [activeYearId, setActiveYearId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [yearsLoaded, setYearsLoaded] = useState(false);

  // Load academic years first
  useEffect(() => {
    api.get('/years').then(res => {
      const all = res.data;
      setYears(all);
      // Default to the most recent active year
      const active = all.find(y => !y.is_archived) || all[0];
      if (active) setActiveYearId(active.id);
      setYearsLoaded(true);
    }).catch(console.error);
  }, []);

  // Load posts when active year changes
  useEffect(() => {
    if (!yearsLoaded) return;
    setLoading(true);
    const url = activeYearId ? `/posts?year_id=${activeYearId}` : '/posts';
    api.get(url).then(res => setPosts(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [activeYearId, yearsLoaded]);

  const handlePostDeleted = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  const activeYear = years.find(y => y.id === activeYearId);
  const totalLikes = posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (p.comments?.length || 0), 0);

  return (
    <div>
      {/* Hero Header */}
      <div className="feed-hero">
        <div className="feed-hero-text">
          <h1 className="page-title">
            {activeYear ? activeYear.label : 'Campus Feed'}
            {activeYear?.is_archived && <span className="badge badge-archived" style={{ marginLeft: '0.6rem', verticalAlign: 'middle' }}>Archived</span>}
          </h1>
          <p className="page-subtitle">
            Welcome back, <strong style={{ color: 'var(--text)' }}>{user?.full_name?.split(' ')[0]}</strong> — your school's living yearbook
          </p>
        </div>
        {!activeYear?.is_archived && (
          <Link to="/create" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Memory
          </Link>
        )}
      </div>

      {/* Stats Bar */}
      {!loading && posts.length > 0 && (
        <div className="stats-bar">
          <StatPill icon="📸" label="memories" value={posts.length} />
          <StatPill icon="❤️" label="likes" value={totalLikes} />
          <StatPill icon="💬" label="comments" value={totalComments} />
        </div>
      )}

      {/* Year Tabs */}
      {years.length > 1 && (
        <div className="year-tabs">
          {years.map(y => (
            <button
              key={y.id}
              onClick={() => setActiveYearId(y.id)}
              className={`year-tab ${y.id === activeYearId ? 'active' : ''}`}
            >
              {y.label}
              {y.is_archived && <span className="badge badge-archived" style={{ marginLeft: '0.35rem', fontSize: '0.6rem' }}>sealed</span>}
            </button>
          ))}
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <><SkeletonCard /><SkeletonCard /></>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📷</div>
          <h3>No memories yet</h3>
          <p>Be the first to capture a moment for the {activeYear?.label} yearbook.</p>
          {!activeYear?.is_archived && (
            <Link to="/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>Share a Memory</Link>
          )}
        </div>
      ) : (
        posts.map(post => (
          <PostCard key={post.id} post={post} onPostDeleted={handlePostDeleted} />
        ))
      )}
    </div>
  );
};

export default Feed;
