import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorsList from './DoctorsList';
import AddDoctorModal from './AddDoctorModal';
import "../../../styles/pages/admin/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('doctors');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    status: 'all'
  });

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/admin-login');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="dashboard-container">
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
                    value={filters.specialization}
                    onChange={handleFilterChange}
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
                    value={filters.status}
                    onChange={handleFilterChange}
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
                filters={filters}
              />
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="patients-management">
              <p>Patient management coming soon...</p>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="appointments-management">
              <p>Appointment management coming soon...</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-dashboard">
              <p>Analytics dashboard coming soon...</p>
            </div>
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
      </main>
    </div>
  );
};

export default AdminDashboard; 