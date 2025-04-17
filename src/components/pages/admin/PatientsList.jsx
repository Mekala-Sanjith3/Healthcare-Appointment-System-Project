import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/api';
import PatientProfileModal from './PatientProfileModal';
import '../../../styles/pages/admin/PatientsList.css';

const PatientsList = ({ searchTerm, filters }) => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllPatients();
      setPatients(data);
      setError(null);
    } catch (err) {
      setError('Failed to load patients. Please try again later.');
      console.error('Error fetching patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = (patient) => {
    setSelectedPatient(patient);
    setShowProfileModal(true);
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await adminApi.deletePatient(patientId);
        setPatients(patients.filter(patient => patient.id !== patientId));
      } catch (err) {
        setError('Failed to delete patient. Please try again later.');
        console.error('Error deleting patient:', err);
      }
    }
  };

  const filteredPatients = patients.filter(patient => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by blood group if specified
    const matchesBloodGroup = !filters.bloodGroup || patient.bloodGroup === filters.bloodGroup;
    
    // Filter by gender if specified
    const matchesGender = !filters.gender || patient.gender === filters.gender;
    
    return matchesSearch && matchesBloodGroup && matchesGender;
  });

  if (isLoading) {
    return <div className="loading">Loading patients...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="patients-list-container">
      {filteredPatients.length === 0 ? (
        <div className="no-patients-message">
          <p>No patients found matching your criteria.</p>
        </div>
      ) : (
        <table className="patients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Blood Group</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.email}</td>
                <td>{patient.phoneNumber}</td>
                <td>{patient.bloodGroup || 'N/A'}</td>
                <td>{patient.age || 'N/A'}</td>
                <td>{patient.gender || 'N/A'}</td>
                <td className="actions-cell">
                  <button 
                    className="view-button"
                    onClick={() => handleViewProfile(patient)}
                  >
                    <i className="fas fa-eye"></i>
                    View
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeletePatient(patient.id)}
                  >
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showProfileModal && selectedPatient && (
        <PatientProfileModal 
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          patientId={selectedPatient.id}
          onUpdate={fetchPatients}
        />
      )}
    </div>
  );
};

export default PatientsList; 