import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/realtimeApi';
import DoctorProfileModal from './DoctorProfileModal';
import '../../../styles/pages/admin/DoctorsList.css';

const DoctorsList = ({ searchTerm, filters }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await adminApi.getAllDoctors();
      console.log("Fetched doctors:", data);
      setDoctors(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError(err.message || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (doctorId, newStatus) => {
    try {
      await adminApi.updateDoctorStatus(doctorId, newStatus);
      // Refresh the doctors list
      fetchDoctors();
    } catch (err) {
      console.error("Error updating doctor status:", err);
      setError(err.message || 'Failed to update doctor status');
    }
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

    try {
      await adminApi.deleteDoctor(doctorId);
      // Refresh the doctors list
      fetchDoctors();
    } catch (err) {
      console.error("Error deleting doctor:", err);
      setError(err.message || 'Failed to delete doctor');
    }
  };

  const handleViewProfile = (doctor) => {
    setSelectedDoctor(doctor);
    setModalMode('view');
    setShowProfileModal(true);
  };

  const handleEditProfile = (doctor) => {
    setSelectedDoctor(doctor);
    setModalMode('edit');
    setShowProfileModal(true);
  };

  const handleProfileModalClose = (wasUpdated) => {
    setShowProfileModal(false);
    setSelectedDoctor(null);
    if (wasUpdated) {
      fetchDoctors();
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchTerm.toLowerCase() === '' ||
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.specialization && doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor.email && doctor.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecialization = filters.specialization === '' ||
      doctor.specialization === filters.specialization;

    const matchesStatus = filters.status === 'all' ||
      doctor.status === filters.status;

    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Loading doctors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <i className="fas fa-exclamation-circle"></i>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <>
      <div className="doctors-table">
        {filteredDoctors.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-user-md"></i>
            <p>No doctors found matching your criteria</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>
                    <div className="doctor-info">
                      <div className="doctor-avatar">
                        {doctor.name.charAt(0)}
                      </div>
                      <div className="doctor-details">
                        <span className="doctor-name">{doctor.name}</span>
                        <span className="doctor-qualification">{doctor.qualification}</span>
                      </div>
                    </div>
                  </td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.experience} years</td>
                  <td>{doctor.email}</td>
                  <td>
                    <select
                      className={`status-select status-${doctor.status ? doctor.status.toLowerCase() : 'active'}`}
                      value={doctor.status || 'ACTIVE'}
                      onChange={(e) => handleStatusChange(doctor.id, e.target.value)}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="PENDING">Pending</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="view-btn" 
                        title="View Details"
                        onClick={() => handleViewProfile(doctor)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="edit-btn" 
                        title="Edit Doctor"
                        onClick={() => handleEditProfile(doctor)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="delete-btn" 
                        title="Delete Doctor"
                        onClick={() => handleDelete(doctor.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showProfileModal && selectedDoctor && (
        <DoctorProfileModal
          isOpen={showProfileModal}
          onClose={handleProfileModalClose}
          doctorId={selectedDoctor.id}
          mode={modalMode}
        />
      )}
    </>
  );
};

export default DoctorsList; 