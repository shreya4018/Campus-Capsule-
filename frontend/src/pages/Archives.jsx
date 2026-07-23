import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const Archives = () => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/years')
      .then(res => setYears(res.data.filter(y => y.is_archived)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner spinner-lg"></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Yearbook Archives</h1>
        <p className="page-subtitle">Browse permanently preserved yearbook collections</p>
      </div>

      {years.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗂️</div>
          <h3>No archived yearbooks yet</h3>
          <p>Archived academic years will appear here once an admin closes and seals a year.</p>
        </div>
      ) : (
        <div className="archives-grid">
          {years.map(year => (
            <Link key={year.id} to={`/archives/${year.id}`} className="archive-card">
              <div className="archive-card-icon">🎓</div>
              <div className="archive-card-label">{year.label}</div>
              <span className="badge badge-archived">Sealed</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Archives;
