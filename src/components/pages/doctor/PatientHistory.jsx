import React, { useState, useEffect } from 'react';
import { doctorApi } from '../../../services/api';
import PatientSearch from './PatientSearch';

const PatientHistory = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('records');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctorId, setDoctorId] = useState('');

  useEffect(() => {
    // Get doctorId from localStorage
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setDoctorId(userData.id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    
    const fetchPatientData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch medical records
        const history = await doctorApi.getPatientMedicalHistory(selectedPatient.id);
        setMedicalHistory(history);
        
        // Fetch appointment history
        const appointments = await doctorApi.getPatientAppointments(selectedPatient.id);
        setAppointmentHistory(appointments);
      } catch (err) {
        console.error('Failed to fetch patient data:', err);
        setError('Failed to load patient information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [selectedPatient]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('records'); // Reset to medical records tab when new patient is selected
  };

  const renderMedicalRecords = () => {
    if (isLoading) {
      return <div className="loading-spinner">Loading medical history...</div>;
    }
    
    if (medicalHistory.length === 0) {
      return (
        <div className="no-history-message">
          <p>No medical records found for this patient.</p>
        </div>
      );
    }
    
    return (
      <div className="medical-records">
        <h4>Medical Records</h4>
        <div className="medical-timeline">
          {medicalHistory.map(record => (
            <div key={record.id} className="medical-record">
              <div className="record-date">
                {new Date(record.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="record-details">
                <h5>Diagnosis: {record.diagnosis}</h5>
                <div className="record-section">
                  <h6>Prescription</h6>
                  <p>{record.prescription || 'No prescription given'}</p>
                </div>
                <div className="record-section">
                  <h6>Notes</h6>
                  <p>{record.notes || 'No notes recorded'}</p>
                </div>
                <div className="record-footer">
                  <span>Attending Physician: {record.doctorName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAppointmentHistory = () => {
    if (isLoading) {
      return <div className="loading-spinner">Loading appointment history...</div>;
    }
    
    if (appointmentHistory.length === 0) {
      return (
        <div className="no-history-message">
          <p>No appointment records found for this patient.</p>
        </div>
      );
    }
    
    return (
      <div className="appointment-history">
        <h4>Appointment History</h4>
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Doctor</th>
            </tr>
          </thead>
          <tbody>
            {appointmentHistory.map(appointment => (
              <tr key={appointment.id} className={`status-${appointment.status.toLowerCase()}`}>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>{appointment.type}</td>
                <td>
                  <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                    {appointment.status}
                  </span>
                </td>
                <td>{appointment.doctorName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="content-card">
      <div className="card-header">
        <h2>Patient History</h2>
      </div>
      
      <div className="card-content">
        <PatientSearch onSelectPatient={handleSelectPatient} doctorId={doctorId} />
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        {selectedPatient ? (
          <div className="patient-history-container">
            <div className="patient-profile">
              <div className="patient-profile-header">
                <div className="large-avatar">
                  {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="patient-profile-details">
                  <h3>{selectedPatient.name}</h3>
                  <p>
                    <span className="patient-id">{selectedPatient.id}</span>
                    <span className="separator">•</span>
                    <span className="patient-age">{selectedPatient.age} years</span>
                    <span className="separator">•</span>
                    <span className="patient-gender">{selectedPatient.gender}</span>
                    {selectedPatient.bloodGroup && (
                      <>
                        <span className="separator">•</span>
                        <span className="patient-blood-group">Blood: {selectedPatient.bloodGroup}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="patient-history-tabs">
                <button 
                  className={`tab-button ${activeTab === 'records' ? 'active' : ''}`}
                  onClick={() => setActiveTab('records')}
                >
                  Medical Records
                </button>
                <button 
                  className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  Appointment History
                </button>
              </div>
              
              <div className="tab-content">
                {activeTab === 'records' 
                  ? renderMedicalRecords() 
                  : renderAppointmentHistory()
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="message-placeholder">
            <p>Search for a patient to view their medical history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientHistory; 