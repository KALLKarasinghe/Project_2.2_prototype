import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSystemStore } from './SystemContext';

// Protects routes from unauthorized access
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser } = useSystemStore();

  // If there is no authenticated user
  if (!currentUser) {
    // If trying to access admin, redirect to admin login
    if (requiredRole === 'Admin') {
      return <Navigate to="/admin" replace />;
    }
    // For any other protected route, redirect to standard login
    return <Navigate to="/login" replace />;
  }

  // Check role authorization if requiredRole is provided
  if (requiredRole && currentUser.role?.toLowerCase() !== requiredRole.toLowerCase()) {
    // Redirect to home if user doesn't have the required role
    return <Navigate to="/" replace />;
  }

  // Allow access
  return children;
};

export default ProtectedRoute;
