import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

const CreatePost = () => {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/years').then(res => {
      const active = res.data.filter(y => !y.is_archived);
      setYears(active);
      if (active.length > 0) setSelectedYearId(active[0].id);
    }).catch(console.error);
  }, []);

  const handleFile = (file) => {
    setError('');
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) { setError('Only JPG, PNG, or WebP images are allowed.'); return; }
    if (file.size > MAX_SIZE) { setError('Image must be smaller than 5MB.'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const removeImage = () => {
    setImage(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { setError('Please select an image.'); return; }
    if (!selectedYearId) { setError('Please select an academic year.'); return; }

    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('image', image);
    formData.append('academic_year_id', selectedYearId);
    if (caption.trim()) formData.append('caption', caption.trim());

    try {
      // For multipart uploads we must NOT add trailing slash from interceptor
      // Call axios directly with explicit trailing slash
      await api.post('/posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to create post. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Create Post</h1>
        <p className="page-subtitle">Share a memory with your school community</p>
      </div>

      <div className="create-post-card">
        <div className="create-post-body">
          {error && (
            <div className="error-banner" style={{ marginBottom: '1.25rem' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Academic Year */}
            <div className="form-group">
              <label className="form-label" htmlFor="year">Academic Year</label>
              {years.length === 0 ? (
                <div className="error-banner">No active academic year found. Ask an admin to create one.</div>
              ) : (
                <select
                  id="year"
                  className="form-control"
                  value={selectedYearId}
                  onChange={e => setSelectedYearId(e.target.value)}
                >
                  {years.map(y => (
                    <option key={y.id} value={y.id}>{y.label}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">Photo</label>
              {preview ? (
                <div className="image-preview">
                  <img src={preview} alt="Preview" />
                  <button type="button" className="image-preview-remove" onClick={removeImage} title="Remove image">
                    ×
                  </button>
                </div>
              ) : (
                <div
                  className="upload-zone"
                  style={{ borderColor: dragOver ? 'rgba(255,255,255,0.4)' : undefined, background: dragOver ? 'var(--bg-3)' : undefined }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleInputChange}
                    id="imageFile"
                  />
                  <div className="upload-zone-icon">📷</div>
                  <div className="upload-zone-text">Drag & drop or click to browse</div>
                  <div className="upload-zone-hint">JPG, PNG, WebP — max 5 MB</div>
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="form-group">
              <label className="form-label" htmlFor="caption">Caption <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                id="caption"
                className="form-control"
                placeholder="Write something about this memory…"
                rows={3}
                value={caption}
                onChange={e => setCaption(e.target.value)}
              />
            </div>

            <div className="form-footer">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || !image || years.length === 0}>
                {isSubmitting ? (
                  <><div className="spinner"></div> Uploading…</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Share Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
