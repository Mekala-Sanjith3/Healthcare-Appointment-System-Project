import React, { useState } from 'react';
import { medicalRecordsApi } from '../../../services/api';
import '../../../styles/pages/doctor/AddMedicalRecordModal.css';

const AddMedicalRecordModal = ({ isOpen, onClose, appointment, onRecordAdded }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    description: '',
    prescription: '',
    treatmentPlan: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      // Create medical record data from form and appointment
      const medicalRecordData = {
        patient_id: appointment.patientId || appointment.patient_id,
        patientId: appointment.patientId || appointment.patient_id,
        doctor_id: appointment.doctorId || appointment.doctor_id,
        doctorId: appointment.doctorId || appointment.doctor_id,
        doctor_name: appointment.doctorName || appointment.doctor_name || "Dr. Unknown",
        doctorName: appointment.doctorName || appointment.doctor_name || "Dr. Unknown",
        specialty: appointment.doctorSpecialization || appointment.specialty || "General Medicine",
        diagnosis: formData.diagnosis,
        description: formData.description,
        prescription: formData.prescription,
        prescriptions: formData.prescription,
        treatment_plan: formData.treatmentPlan,
        treatmentPlan: formData.treatmentPlan,
        notes: formData.notes,
        appointment_id: appointment.id,
        appointmentId: appointment.id
      };

      // Call API to create the medical record
      const response = await medicalRecordsApi.addMedicalRecord(medicalRecordData);
      
      // Show success message
      setSuccessMessage('Medical record saved successfully');
      
      // Reset the form
      setFormData({
        diagnosis: '',
        description: '',
        prescription: '',
        treatmentPlan: '',
        notes: ''
      });

      // Notify parent component
      if (onRecordAdded) {
        onRecordAdded(response);
      }

      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error adding medical record:', err);
      setError('Failed to save medical record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="medical-record-modal-overlay">
      <div className="medical-record-modal">
        <button className="close-modal-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="modal-header">
          <h2>Add Medical Record</h2>
          <div className="patient-info">
            <span>Patient: {appointment.patientName || appointment.patient_name}</span>
            <span>Date: {appointment.appointmentDate || appointment.date}</span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <p>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="diagnosis">
              <i className="fas fa-stethoscope"></i>
              Diagnosis *
            </label>
            <input
              type="text"
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Primary diagnosis"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              <i className="fas fa-file-medical-alt"></i>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Detailed description of the patient's condition"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="prescription">
              <i className="fas fa-prescription-bottle-alt"></i>
              Prescription
            </label>
            <textarea
              id="prescription"
              name="prescription"
              value={formData.prescription}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Medications, dosage, frequency, etc."
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="treatmentPlan">
              <i className="fas fa-clipboard-list"></i>
              Treatment Plan
            </label>
            <textarea
              id="treatmentPlan"
              name="treatmentPlan"
              value={formData.treatmentPlan}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Recommended treatment plan and follow-up steps"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="notes">
              <i className="fas fa-sticky-note"></i>
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-control"
              rows="2"
              placeholder="Any additional notes or recommendations"
            ></textarea>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : 'Save Medical Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicalRecordModal; 