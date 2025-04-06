import React, { useState, useEffect } from 'react';
import '../../../styles/pages/admin/DoctorProfileModal.css';

const DoctorProfileModal = ({ isOpen, onClose, doctorId, mode = 'view' }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    qualification: '',
    experience: '',
    clinicAddress: '',
    status: '',
    consultationFee: '',
    availabilitySchedule: ''
  });
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (isOpen && doctorId) {
      fetchDoctorDetails();
    }
  }, [isOpen, doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/doctors/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctor details');
      }

      const data = await response.json();
      setDoctor(data);
      setFormData({
        name: data.name,
        email: data.email,
        specialization: data.specialization,
        qualification: data.qualification,
        experience: data.experience,
        clinicAddress: data.clinicAddress,
        status: data.status,
        consultationFee: data.consultationFee || '',
        availabilitySchedule: data.availabilitySchedule || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleFileUpload = async (type, file) => {
    if (!file) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `http://localhost:8080/api/admin/doctors/${doctorId}/${type}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`);
      }

      const updatedDoctor = await response.json();
      setDoctor(updatedDoctor);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api/admin/doctors/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update doctor details');
      }

      const updatedDoctor = await response.json();
      setDoctor(updatedDoctor);
      setIsEditing(false);
      onClose(true); // true indicates successful update
    } catch (err) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="doctor-profile-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Doctor Profile' : 'Doctor Profile'}</h2>
          <button className="close-button" onClick={() => onClose(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading doctor details...</span>
          </div>
        ) : error ? (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="profile-header">
              <div className="profile-picture-section">
                {doctor?.profilePicture ? (
                  <img 
                    src={`http://localhost:8080/uploads/profile-pictures/${doctor.profilePicture}`}
                    alt="Doctor profile"
                    className="profile-picture"
                  />
                ) : (
                  <div className="doctor-avatar">
                    {doctor?.name.charAt(0)}
                  </div>
                )}
                {isEditing && (
                  <div className="upload-section">
                    <label className="upload-button">
                      <i className="fas fa-camera"></i>
                      <span>Update Picture</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('profile-picture', e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="status-badge" data-status={doctor?.status.toLowerCase()}>
                {doctor?.status}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  <i className="fas fa-user"></i>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-envelope"></i>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-stethoscope"></i>
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-graduation-cap"></i>
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-briefcase"></i>
                  Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-hospital"></i>
                  Clinic Address
                </label>
                <input
                  type="text"
                  name="clinicAddress"
                  value={formData.clinicAddress}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-dollar-sign"></i>
                  Consultation Fee
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  disabled={!isEditing}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-calendar"></i>
                  Availability Schedule
                </label>
                <input
                  type="text"
                  name="availabilitySchedule"
                  value={formData.availabilitySchedule}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g., Mon-Fri 9AM-5PM"
                />
              </div>
            </div>

            {isEditing && (
              <div className="credentials-section">
                <h3>Upload Credentials</h3>
                <div className="upload-section">
                  <label className="upload-button">
                    <i className="fas fa-file-medical"></i>
                    <span>Upload Credentials</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload('credentials', e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {doctor?.credentialsFile && (
                    <span className="file-name">
                      Current file: {doctor.credentialsFile}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="form-actions">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    className="save-button"
                    disabled={saveLoading || uploadLoading}
                  >
                    {saveLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setIsEditing(false)}
                    disabled={saveLoading || uploadLoading}
                  >
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit"></i>
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DoctorProfileModal; 