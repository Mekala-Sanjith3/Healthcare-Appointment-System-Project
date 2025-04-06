import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    // Not logged in, redirect to login page based on role
    switch (allowedRole) {
      case 'ADMIN':
        return <Navigate to="/admin-login" />;
      case 'DOCTOR':
        return <Navigate to="/doctor-login" />;
      case 'PATIENT':
        return <Navigate to="/patient-login" />;
      default:
        return <Navigate to="/" />;
    }
  }

  if (userRole !== allowedRole) {
    // Wrong role, redirect to appropriate dashboard
    switch (userRole) {
      case 'ADMIN':
        return <Navigate to="/admin" />;
      case 'DOCTOR':
        return <Navigate to="/doctor" />;
      case 'PATIENT':
        return <Navigate to="/patient" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute; 