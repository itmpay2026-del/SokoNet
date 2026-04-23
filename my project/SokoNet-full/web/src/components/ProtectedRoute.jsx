/**
 * Protected Route Component
 * Redirects unauthenticated users to login
 */

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthCtx } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthCtx);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}
