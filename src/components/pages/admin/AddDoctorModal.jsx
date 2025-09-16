import React, { useState } from 'react';
import { adminApi } from '../../../services/realtimeApi';
import '../../../styles/pages/admin/AddDoctorModal.css';

const AddDoctorModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    qualification: '',
    experience: '',
    clinicAddress: '',
    role: 'DOCTOR',
    status: 'ACTIVE'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log("Submitting doctor data:", formData);
      await adminApi.createDoctor(formData);
      
      onAdd();
      onClose();
    } catch (err) {
      console.error("Error adding doctor:", err);
      setError(err.message || 'Failed to add doctor');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Doctor</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="specialization">Specialization</label>
            <select
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            >
              <option value="">Select Specialization</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Psychiatry">Psychiatry</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="qualification">Qualification</label>
            <input
              type="text"
              id="qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience">Experience (years)</label>
            <input
              type="text"
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="clinicAddress">Clinic Address</label>
            <textarea
              id="clinicAddress"
              name="clinicAddress"
              value={formData.clinicAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <><i className="fas fa-spinner fa-spin"></i> Adding...</>
              ) : (
                'Add Doctor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorModal; 