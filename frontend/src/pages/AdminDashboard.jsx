import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [years, setYears] = useState([]);
  const [newYearLabel, setNewYearLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [creatingYear, setCreatingYear] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/years')])
      .then(([usersRes, yearsRes]) => {
        setUsers(usersRes.data);
        setYears(yearsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreateYear = async (e) => {
    e.preventDefault();
    if (!newYearLabel.trim()) return;
    setCreatingYear(true);
    try {
      const res = await api.post('/years', { label: newYearLabel.trim() });
      setYears(prev => [res.data, ...prev]);
      setNewYearLabel('');
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingYear(false);
    }
  };

  const handleArchiveYear = async (yearId) => {
    if (!window.confirm('Archive this year permanently? All posts will become read-only.')) return;
    try {
      const res = await api.post(`/years/${yearId}/archive`);
      setYears(prev => prev.map(y => y.id === yearId ? res.data : y));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(`/users/${userId}/role?role=${newRole}`);
      setUsers(prev => prev.map(u => u.id === userId ? res.data : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusToggle = async (userId, isActive) => {
    try {
      const res = await api.patch(`/users/${userId}/status?is_active=${!isActive}`);
      setUsers(prev => prev.map(u => u.id === userId ? res.data : u));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="page-loader">
      <div className="spinner spinner-lg"></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage users, academic years, and the archive workflow</p>
      </div>

      {/* Academic Years */}
      <div className="admin-section">
        <div className="admin-section-header">
          <span className="admin-section-title">Academic Years</span>
          <form onSubmit={handleCreateYear} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 2025-2026"
              value={newYearLabel}
              onChange={e => setNewYearLabel(e.target.value)}
              style={{ width: '140px', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!newYearLabel.trim() || creatingYear}>
              {creatingYear ? <div className="spinner"></div> : '+ Create'}
            </button>
          </form>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {years.length === 0 ? (
              <tr><td colSpan={4} style={{ color: 'var(--text-3)', textAlign: 'center', padding: '1.5rem' }}>No academic years yet.</td></tr>
            ) : years.map(year => (
              <tr key={year.id}>
                <td style={{ fontWeight: 500 }}>{year.label}</td>
                <td>
                  {year.is_archived
                    ? <span className="year-status-archived">● Archived</span>
                    : <span className="year-status-active">● Active</span>
                  }
                </td>
                <td style={{ color: 'var(--text-2)' }}>{new Date(year.created_at).toLocaleDateString()}</td>
                <td>
                  {!year.is_archived ? (
                    <button onClick={() => handleArchiveYear(year.id)} className="btn btn-secondary btn-sm">
                      Seal & Archive
                    </button>
                  ) : (
                    <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>Sealed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Users */}
      <div className="admin-section">
        <div className="admin-section-header">
          <span className="admin-section-title">Users <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>({users.length})</span></span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.full_name}</td>
                  <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{u.email}</td>
                  <td>
                    <select
                      className="inline-select"
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleStatusToggle(u.id, u.is_active)}
                      className="status-dot"
                      style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}
                      title={u.is_active ? 'Click to deactivate' : 'Click to activate'}
                    >
                      <span className={u.is_active ? 'status-dot status-active' : 'status-dot status-inactive'}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
