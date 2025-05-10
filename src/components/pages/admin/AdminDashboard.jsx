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
import MedicalRecordsView from './MedicalRecordsView';
import { adminApi } from '../../../services/api';
import "../../../styles/pages/admin/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('doctors');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [showAddMedicalRecordModal, setShowAddMedicalRecordModal] = useState(false);
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
  const [medicalRecordFilters, setMedicalRecordFilters] = useState({
    recordType: '',
    dateFrom: '',
    dateTo: ''
  });
  const [staffFilters, setStaffFilters] = useState({
    role: '',
    department: ''
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

  const handleMedicalRecordFilterChange = (e) => {
    setMedicalRecordFilters({
      ...medicalRecordFilters,
      [e.target.name]: e.target.value
    });
  };

  const handleStaffFilterChange = (e) => {
    setStaffFilters({
      ...staffFilters,
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
            className={`nav-item ${activeTab === 'medical-records' ? 'active' : ''}`}
            onClick={() => setActiveTab('medical-records')}
          >
            <i className="fas fa-file-medical"></i>
            Medical Records
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <i className="fas fa-user-nurse"></i>
            Staff Management
          </button>

          <button 
            className={`nav-item ${activeTab === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveTab('finance')}
          >
            <i className="fas fa-money-bill-wave"></i>
            Finance
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="fas fa-chart-bar"></i>
            Analytics
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog"></i>
            System Settings
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
              {activeTab === 'medical-records' && 'Medical Records Management'}
              {activeTab === 'staff' && 'Staff Management'}
              {activeTab === 'finance' && 'Financial Management'}
              {activeTab === 'analytics' && 'Analytics Dashboard'}
              {activeTab === 'settings' && 'System Settings'}
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
            {activeTab === 'medical-records' && (
              <button 
                className="add-button"
                onClick={() => setShowAddMedicalRecordModal(true)}
              >
                <i className="fas fa-plus"></i>
                Add New Medical Record
              </button>
            )}
            {activeTab === 'staff' && (
              <button 
                className="add-button"
                onClick={() => {/* Add staff handler */}}
              >
                <i className="fas fa-plus"></i>
                Add New Staff Member
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

          {activeTab === 'medical-records' && (
            <div className="medical-records-management">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Search records by patient name, diagnosis..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="filters">
                  <select 
                    name="recordType"
                    value={medicalRecordFilters.recordType}
                    onChange={handleMedicalRecordFilterChange}
                  >
                    <option value="">All Record Types</option>
                    <option value="Diagnosis">Diagnosis</option>
                    <option value="Lab Test">Lab Test</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Imaging">Imaging</option>
                    <option value="Surgery">Surgery</option>
                  </select>
                  <div className="date-filter-group">
                    <input 
                      type="date"
                      name="dateFrom"
                      value={medicalRecordFilters.dateFrom}
                      onChange={handleMedicalRecordFilterChange}
                      className="date-filter"
                      placeholder="From"
                    />
                    <input 
                      type="date"
                      name="dateTo"
                      value={medicalRecordFilters.dateTo}
                      onChange={handleMedicalRecordFilterChange}
                      className="date-filter"
                      placeholder="To"
                    />
                  </div>
                </div>
              </div>

              <MedicalRecordsView 
                searchTerm={searchTerm}
                filters={medicalRecordFilters}
              />
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="staff-management">
              <div className="search-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Search staff by name, role, department..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="filters">
                  <select 
                    name="role"
                    value={staffFilters.role}
                    onChange={handleStaffFilterChange}
                  >
                    <option value="">All Roles</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Lab Technician">Lab Technician</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                  <select 
                    name="department"
                    value={staffFilters.department}
                    onChange={handleStaffFilterChange}
                  >
                    <option value="">All Departments</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Outpatient">Outpatient</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              <div className="staff-list-placeholder">
                <div className="info-message">
                  <i className="fas fa-info-circle"></i>
                  <p>Staff management module is under development. Coming soon!</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="finance-management">
              <div className="finance-dashboard">
                <div className="finance-summary">
                  <div className="finance-card">
                    <div className="finance-icon">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="finance-data">
                      <h3>Total Revenue</h3>
                      <p className="finance-value">$128,450</p>
                      <p className="finance-trend positive">
                        <i className="fas fa-arrow-up"></i> 12.5% from last month
                      </p>
                    </div>
                  </div>
                  <div className="finance-card">
                    <div className="finance-icon">
                      <i className="fas fa-hand-holding-usd"></i>
                    </div>
                    <div className="finance-data">
                      <h3>Outstanding</h3>
                      <p className="finance-value">$18,245</p>
                      <p className="finance-trend negative">
                        <i className="fas fa-arrow-up"></i> 5.2% from last month
                      </p>
                    </div>
                  </div>
                  <div className="finance-card">
                    <div className="finance-icon">
                      <i className="fas fa-chart-pie"></i>
                    </div>
                    <div className="finance-data">
                      <h3>Expenses</h3>
                      <p className="finance-value">$76,210</p>
                      <p className="finance-trend positive">
                        <i className="fas fa-arrow-down"></i> 3.8% from last month
                      </p>
                    </div>
                  </div>
                  <div className="finance-card">
                    <div className="finance-icon">
                      <i className="fas fa-balance-scale"></i>
                    </div>
                    <div className="finance-data">
                      <h3>Net Profit</h3>
                      <p className="finance-value">$52,240</p>
                      <p className="finance-trend positive">
                        <i className="fas fa-arrow-up"></i> 8.7% from last month
                      </p>
                    </div>
                  </div>
                </div>
                <div className="info-message">
                  <i className="fas fa-info-circle"></i>
                  <p>Detailed financial reporting module is under development. Coming soon!</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}

          {activeTab === 'settings' && (
            <div className="system-settings">
              <div className="settings-container">
                <div className="settings-card">
                  <h3>System Configuration</h3>
                  <div className="settings-section">
                    <h4>General Settings</h4>
                    <div className="settings-form-group">
                      <label>Hospital Name</label>
                      <input type="text" defaultValue="Healthcare Appointment System" />
                    </div>
                    <div className="settings-form-group">
                      <label>Contact Email</label>
                      <input type="email" defaultValue="admin@healthcaresystem.com" />
                    </div>
                    <div className="settings-form-group">
                      <label>Contact Phone</label>
                      <input type="tel" defaultValue="+1 (555) 123-4567" />
                    </div>
                  </div>
                  <div className="settings-section">
                    <h4>Notification Settings</h4>
                    <div className="settings-form-group">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">Email Notifications</span>
                      </label>
                    </div>
                    <div className="settings-form-group">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">SMS Notifications</span>
                      </label>
                    </div>
                    <div className="settings-form-group">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">System Notifications</span>
                      </label>
                    </div>
                  </div>
                  <div className="settings-actions">
                    <button className="settings-button save">Save Changes</button>
                    <button className="settings-button cancel">Reset</button>
                  </div>
                </div>
                <div className="settings-card">
                  <h3>Security Settings</h3>
                  <div className="settings-section">
                    <h4>Password Policy</h4>
                    <div className="settings-form-group">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">Require Complex Passwords</span>
                      </label>
                    </div>
                    <div className="settings-form-group">
                      <label>Password Expiry (days)</label>
                      <input type="number" defaultValue="90" min="0" />
                    </div>
                  </div>
                  <div className="settings-section">
                    <h4>Two-Factor Authentication</h4>
                    <div className="settings-form-group">
                      <label className="toggle-switch">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">Enable for All Staff</span>
                      </label>
                    </div>
                  </div>
                  <div className="settings-actions">
                    <button className="settings-button save">Save Changes</button>
                    <button className="settings-button cancel">Reset</button>
                  </div>
                </div>
              </div>
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