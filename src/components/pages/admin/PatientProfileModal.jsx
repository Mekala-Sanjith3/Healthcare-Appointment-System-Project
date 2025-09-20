import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/realtimeApi';
import '../../../styles/pages/admin/PatientProfileModal.css';

const PatientProfileModal = ({ isOpen, onClose, patientId, onUpdate }) => {
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    bloodGroup: '',
    age: '',
    gender: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [medicalRecordFile, setMedicalRecordFile] = useState(null);
  const [uploadType, setUploadType] = useState('');

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientDetails();
    }
  }, [isOpen, patientId]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const fetchPatientDetails = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getPatientById(patientId);
      setPatient(data);
      setFormData({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        bloodGroup: data.bloodGroup,
        age: data.age,
        gender: data.gender
      });
      setError(null);
    } catch (err) {
      setError('Failed to load patient details. Please try again later.');
      console.error('Error fetching patient details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e, type) => {
    if (e.target.files.length > 0) {
      if (type === 'profile-picture') {
        setProfileImage(e.target.files[0]);
      } else {
        setMedicalRecordFile(e.target.files[0]);
      }
      setUploadType(type);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadType) return;
    
    const file = uploadType === 'profile-picture' ? profileImage : medicalRecordFile;
    if (!file) return;
    
    try {
      await adminApi.uploadPatientFile(patientId, file, uploadType);
      fetchPatientDetails();
      setProfileImage(null);
      setMedicalRecordFile(null);
      setUploadType('');
    } catch (err) {
      setError(`Failed to upload ${uploadType}. Please try again later.`);
      console.error(`Error uploading ${uploadType}:`, err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updatePatient(patientId, formData);
      setIsEditing(false);
      fetchPatientDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Failed to update patient. Please try again later.');
      console.error('Error updating patient:', err);
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="loading">Loading patient details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="error">{error}</div>
          <div className="modal-actions">
            <button className="close-button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 10000,
        padding: '20px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="modal-container patient-profile-modal"
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 'auto',
          position: 'relative'
        }}
      >
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Patient Profile' : 'Patient Profile'}</h2>
          <button className="close-icon" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="profile-section">
            <div className="profile-image-section">
              <div className="profile-image">
                {patient.profilePicture ? (
                  <img 
                    src={`http://localhost:8080/uploads/patient-profile-pictures/${patient.profilePicture}`} 
                    alt={`${patient.name}'s profile`} 
                  />
                ) : (
                  <div className="profile-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
              {!isEditing && (
                <div className="upload-controls">
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profile-picture')}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="profile-picture" className="upload-button">
                    <i className="fas fa-upload"></i>
                    Upload Profile Picture
                  </label>
                  {profileImage && (
                    <button 
                      className="confirm-upload"
                      onClick={handleFileUpload}
                    >
                      <i className="fas fa-check"></i>
                      Confirm Upload
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="patient-info">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phoneNumber">Phone Number</label>
                      <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="bloodGroup">Blood Group</label>
                      <select
                        id="bloodGroup"
                        name="bloodGroup"
                        value={formData.bloodGroup || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="age">Age</label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="gender">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-button">
                      <i className="fas fa-save"></i>
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => setIsEditing(false)}
                    >
                      <i className="fas fa-times"></i>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="info-details">
                  <div className="info-row">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{patient.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{patient.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone:</span>
                    <span className="info-value">{patient.phoneNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Address:</span>
                    <span className="info-value">{patient.address}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Blood Group:</span>
                    <span className="info-value">{patient.bloodGroup || 'Not specified'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Age:</span>
                    <span className="info-value">{patient.age || 'Not specified'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Gender:</span>
                    <span className="info-value">{patient.gender || 'Not specified'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="medical-records-section">
              <h3>Medical Records</h3>
              <div className="records-container">
                {patient.medicalRecords ? (
                  <div className="record-item">
                    <i className="fas fa-file-medical"></i>
                    <span>{patient.medicalRecords}</span>
                    <a 
                      href={`http://localhost:8080/uploads/medical-records/${patient.medicalRecords}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-link"
                    >
                      <i className="fas fa-download"></i>
                      Download
                    </a>
                  </div>
                ) : (
                  <p>No medical records uploaded.</p>
                )}

                <div className="upload-controls">
                  <input
                    type="file"
                    id="medical-records"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'medical-records')}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="medical-records" className="upload-button">
                    <i className="fas fa-upload"></i>
                    Upload Medical Records
                  </label>
                  {medicalRecordFile && (
                    <button 
                      className="confirm-upload"
                      onClick={handleFileUpload}
                    >
                      <i className="fas fa-check"></i>
                      Confirm Upload
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!isEditing && (
            <button 
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              <i className="fas fa-edit"></i>
              Edit Profile
            </button>
          )}
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientProfileModal; 