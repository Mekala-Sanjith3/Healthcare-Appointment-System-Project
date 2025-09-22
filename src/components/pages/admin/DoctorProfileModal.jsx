import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/realtimeApi';
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

  const fetchDoctorDetails = async () => {
    try {
      const data = await adminApi.getDoctorById(doctorId);
      setDoctor(data);
      setFormData({
        name: data.name,
        email: data.email,
        specialization: data.specialization,
        qualification: data.qualification,
        experience: data.experience,
        clinicAddress: data.clinicAddress,
        status: data.status || 'ACTIVE',
        consultationFee: data.consultationFee || '',
        availabilitySchedule: data.availabilitySchedule || ''
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching doctor details:", err);
      setError(err.message || 'Failed to fetch doctor details');
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
    try {
      const result = await adminApi.uploadDoctorFile(doctorId, file, type);
      // Update the doctor with the new file URL if needed
      fetchDoctorDetails(); // Refresh doctor data
    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
      setError(err.message || `Failed to upload ${type}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError(null);

    try {
      const updatedDoctor = await adminApi.updateDoctor(doctorId, formData);
      setDoctor(updatedDoctor);
      setIsEditing(false);
      onClose(true); // true indicates successful update
    } catch (err) {
      console.error("Error updating doctor details:", err);
      setError(err.message || 'Failed to update doctor details');
    } finally {
      setSaveLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="doctor-profile-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose(false);
        }
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Doctor Profile' : 'Doctor Details'}</h2>
          <button className="close-icon" onClick={() => onClose(false)}>
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
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="profile-header">
              <div className="profile-picture-section">
                {doctor?.profilePicture ? (
                  <img 
                    src={doctor.profilePicture}
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
              <div className="status-badge" data-status={doctor?.status?.toLowerCase() || 'active'}>
                {doctor?.status || 'ACTIVE'}
              </div>
            </div>

            <div className="doctor-details">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-item">
                  <label>Name:</label>
                  <div className="detail-value">
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    ) : (
                      formData.name || 'N/A'
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <div className="detail-value">
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    ) : (
                      formData.email || 'N/A'
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <label>ID:</label>
                  <div className="detail-value">{doctor?.id || 'N/A'}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Professional Information</h3>
                <div className="detail-item">
                  <label>Specialization:</label>
                  <div className="detail-value">
                    {isEditing ? (
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                      />
                    ) : (
                      formData.specialization || 'N/A'
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Qualification:</label>
                  <div className="detail-value">
                    {isEditing ? (
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                      />
                    ) : (
                      formData.qualification || 'N/A'
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Experience:</label>
                  <div className="detail-value">
                    {isEditing ? (
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                      />
                    ) : (
                      formData.experience || 'N/A'
                    )}
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Practice Information</h3>
                <div className="detail-item">
                  <label>Clinic Address:</label>
                  <div className="detail-value">
                    {isEditing ? (
                      <input
                        type="text"
                        name="clinicAddress"
                        value={formData.clinicAddress}
                        onChange={handleChange}
                      />
                    ) : (
                      formData.clinicAddress || 'N/A'
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Consultation Fee:</label>
                  <div className="detail-value">
                    {isEditing ? (
                      <input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      formData.consultationFee ? `$${formData.consultationFee}` : 'N/A'
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Availability:</label>
                  <div className="detail-value">
                    {isEditing ? (
                      <input
                        type="text"
                        name="availabilitySchedule"
                        value={formData.availabilitySchedule}
                        onChange={handleChange}
                        placeholder="e.g., Mon-Fri 9AM-5PM"
                      />
                    ) : (
                      formData.availabilitySchedule || 'N/A'
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <div className="detail-value">
                    {isEditing ? (
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${formData.status?.toLowerCase() || 'active'}`}>
                        {formData.status || 'ACTIVE'}
                      </span>
                    )}
                  </div>
                </div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfileModal; 