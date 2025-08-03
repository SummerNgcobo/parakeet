import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './../pages/auth/AuthContext';

export default function AuthLayout({ allowedRoles, children }) {
  const { user, role } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}