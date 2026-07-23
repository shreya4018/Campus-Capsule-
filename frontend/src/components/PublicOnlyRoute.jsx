import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * PublicOnlyRoute: redirects to home if the user is ALREADY authenticated.
 * Use this to wrap /login and /register so logged-in users don't see them.
 */
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return null; // Wait for auth check to finish

  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
};

export default PublicOnlyRoute;
