import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';
import Archives from './pages/Archives';
import ArchiveYearView from './pages/ArchiveYearView';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <div className="app-wrapper">
          <Navbar />
          <Routes>
            {/* Public-only routes: redirect to home if already logged in */}
            <Route path="/login" element={
              <PublicOnlyRoute><Login /></PublicOnlyRoute>
            } />
            <Route path="/register" element={
              <PublicOnlyRoute><Register /></PublicOnlyRoute>
            } />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <div className="main-content"><Feed /></div>
              </ProtectedRoute>
            } />
            <Route path="/create" element={
              <ProtectedRoute>
                <div className="main-content"><CreatePost /></div>
              </ProtectedRoute>
            } />
            <Route path="/archives" element={
              <ProtectedRoute>
                <div className="main-content"><Archives /></div>
              </ProtectedRoute>
            } />
            <Route path="/archives/:yearId" element={
              <ProtectedRoute>
                <div className="main-content"><ArchiveYearView /></div>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="main-content"><Profile /></div>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="main-content" style={{ maxWidth: '960px' }}><AdminDashboard /></div>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
