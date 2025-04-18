import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorsList from './DoctorsList';
import PatientsList from './PatientsList';
import AppointmentsList from './AppointmentsList';
import AnalyticsDashboard from './AnalyticsDashboard';
import AddDoctorModal from './AddDoctorModal';
import AddPatientModal from './AddPatientModal';
import AddAppointmentModal from './AddAppointmentModal';
import ChartConfigurator from './ChartConfigurator';
import { adminApi } from '../../../services/api';
import "../../../styles/pages/admin/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('doctors');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilters, setDoctorFilters] = useState({
    specialization: '',
    status: 'all'
  });
  const [patientFilters, setPatientFilters] = useState({
    bloodGroup: '',
    gender: ''
  });
  const [appointmentFilters, setAppointmentFilters] = useState({
    status: 'all',
    date: ''
  });
  const [refreshAppointments, setRefreshAppointments] = useState(0);

  // Verify authentication on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'ADMIN') {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/admin-login');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDoctorFilterChange = (e) => {
    setDoctorFilters({
      ...doctorFilters,
      [e.target.name]: e.target.value
    });
  };

  const handlePatientFilterChange = (e) => {
    setPatientFilters({
      ...patientFilters,
      [e.target.name]: e.target.value
    });
  };

  const handleAppointmentFilterChange = (e) => {
    setAppointmentFilters({
      ...appointmentFilters,
      [e.target.name]: e.target.value
    });
  };

  // Function to handle adding a new appointment
  const handleAddAppointment = (newAppointment) => {
    setShowAddAppointmentModal(false);
    // Trigger a refresh of the appointments list
    setRefreshAppointments(prev => prev + 1);
  };

  return (
    <div className="dashboard-container">
      {/* Initialize Chart.js globally */}
      <ChartConfigurator />
      
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <i className="fas fa-hospital-user"></i>
          <h2>Admin Portal</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            <i className="fas fa-user-md"></i>
            Manage Doctors
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            <i className="fas fa-users"></i>
            Manage Patients
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <i className="fas fa-calendar-check"></i>
            Appointments
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="fas fa-chart-bar"></i>
            Analytics
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>
              {activeTab === 'doctors' && 'Doctor Management'}
              {activeTab === 'patients' && 'Patient Management'}
              {activeTab === 'appointments' && 'Appointment Management'}
              {activeTab === 'analytics' && 'Analytics Dashboard'}
            </h1>
          </div>
          <div className="header-actions">
            {activeTab === 'doctors' && (
              <button 
                className="add-button"
                onClick={() => setShowAddDoctorModal(true)}
              >
                <i className="fas fa-plus"></i>
                Add New Doctor
              </button>
            )}
            {activeTab === 'patients' && (
              <button 
                className="add-button"
                onClick={() => setShowAddPatientModal(true)}
              >
                <i className="fas fa-plus"></i>
                Add New Patient
              </button>
            )}
            {activeTab === 'appointments' && (
              <button 
                className="add-button"
                onClick={() => setShowAddAppointmentModal(true)}
              >
                <i className="fas fa-plus"></i>
                Add New Appointment
              </button>
            )}
          </div>
        </header>

        <div className="dashboard-content">
          {activeTab === 'doctors' && (
            <div className="doctors-management">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Search doctors by name, specialization..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="filters">
                  <select 
                    name="specialization"
                    value={doctorFilters.specialization}
                    onChange={handleDoctorFilterChange}
                  >
                    <option value="">All Specializations</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Psychiatry">Psychiatry</option>
                  </select>
                  <select 
                    name="status"
                    value={doctorFilters.status}
                    onChange={handleDoctorFilterChange}
                  >
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <DoctorsList 
                searchTerm={searchTerm}
                filters={doctorFilters}
              />
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="patients-management">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Search patients by name, email, phone..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="filters">
                  <select 
                    name="bloodGroup"
                    value={patientFilters.bloodGroup}
                    onChange={handlePatientFilterChange}
                  >
                    <option value="">All Blood Groups</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  <select 
                    name="gender"
                    value={patientFilters.gender}
                    onChange={handlePatientFilterChange}
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <PatientsList 
                searchTerm={searchTerm}
                filters={patientFilters}
              />
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="appointments-management">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Search appointments by patient name, doctor name..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="filters">
                  <select 
                    name="status"
                    value={appointmentFilters.status}
                    onChange={handleAppointmentFilterChange}
                  >
                    <option value="all">All Status</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <input 
                    type="date"
                    name="date"
                    value={appointmentFilters.date}
                    onChange={handleAppointmentFilterChange}
                    className="date-filter"
                  />
                </div>
              </div>

              <AppointmentsList
                searchTerm={searchTerm}
                filters={appointmentFilters}
                refreshTrigger={refreshAppointments}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}
        </div>

        <AddDoctorModal 
          isOpen={showAddDoctorModal}
          onClose={() => setShowAddDoctorModal(false)}
          onAdd={() => {
            // Refresh the doctors list
            window.location.reload();
          }}
        />

        <AddPatientModal 
          isOpen={showAddPatientModal}
          onClose={() => setShowAddPatientModal(false)}
          onAdd={() => {
            // Refresh the patients list
            window.location.reload();
          }}
        />

        <AddAppointmentModal 
          isOpen={showAddAppointmentModal}
          onClose={() => setShowAddAppointmentModal(false)}
          onAdd={handleAddAppointment}
        />
      </main>
    </div>
  );
};

export default AdminDashboard; 