import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';

const ArchiveYearView = () => {
  const { yearId } = useParams();
  const [posts, setPosts] = useState([]);
  const [yearLabel, setYearLabel] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/posts?year_id=${yearId}`),
      api.get('/years'),
    ]).then(([postsRes, yearsRes]) => {
      setPosts(postsRes.data);
      const found = yearsRes.data.find(y => y.id === yearId);
      if (found) setYearLabel(found.label);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [yearId]);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner spinner-lg"></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <Link to="/archives" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Archives
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 className="page-title">{yearLabel}</h1>
          <span className="badge badge-archived">Sealed Yearbook</span>
        </div>
        <p className="page-subtitle">This collection is permanently archived and read-only</p>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No posts in this archive</h3>
          <p>This yearbook was sealed before any posts were added.</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
};

export default ArchiveYearView;
