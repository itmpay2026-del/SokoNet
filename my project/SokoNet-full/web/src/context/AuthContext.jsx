/**
 * Auth Context
 * Manages user authentication state globally
 */

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthCtx = createContext();

export default function AuthContext({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Fetch user profile
  useEffect(() => {
    if (token) {
      axios.get('/api/users/profile')
        .then(res => {
          setUser(res.data.user);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}
