import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../components/pages/home/HomePage';
import DoctorLogin from '../components/pages/doctor/DoctorLogin';
import DoctorRegister from '../components/pages/doctor/DoctorRegister';
import DoctorDashboard from '../components/pages/doctor/DoctorDashboard';
import PatientLogin from '../components/pages/patient/PatientLogin';
import PatientRegister from '../components/pages/patient/PatientRegister';
import PatientDashboard from '../components/pages/patient/PatientDashboard';
import AdminLogin from '../components/pages/admin/AdminLogin';
import AdminRegister from '../components/pages/admin/AdminRegister';
import AdminDashboard from '../components/pages/admin/AdminDashboard';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      
      {/* Admin Routes */}
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-register" element={<AdminRegister />} />
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Doctor Routes */}
      <Route path="/doctor-login" element={<DoctorLogin />} />
      <Route path="/doctor-register" element={<DoctorRegister />} />
      <Route 
        path="/doctor/*" 
        element={
          <ProtectedRoute allowedRole="DOCTOR">
            <DoctorDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Patient Routes */}
      <Route path="/patient-login" element={<PatientLogin />} />
      <Route path="/patient-register" element={<PatientRegister />} />
      <Route 
        path="/patient/*" 
        element={
          <ProtectedRoute allowedRole="PATIENT">
            <PatientDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;