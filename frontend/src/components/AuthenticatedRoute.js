
// File: src/components/AuthenticatedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function AuthenticatedRoute({ children }) {
  const { token } = useContext(AuthContext);
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}