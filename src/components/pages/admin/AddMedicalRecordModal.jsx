import React, { useState, useEffect } from 'react';
import { medicalRecordsApi, adminApi } from '../../../services/realtimeApi';
import '../../../styles/pages/admin/AddMedicalRecordModal.css';

const AddMedicalRecordModal = ({ isOpen, onClose, onAdd, patients = [], doctors = [] }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    doctorId: '',
    doctorName: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    followUpDate: '',
    testResults: []
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
    } else {
      setFormData({
        patientId: '',
        patientName: '',
        doctorId: '',
        doctorName: '',
        diagnosis: '',
        prescription: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        followUpDate: '',
        testResults: []
      });
    }
  }, [isOpen]);

  // Fallback self-fetch if lists empty
  useEffect(() => {
    const loadIfEmpty = async () => {
      try {
        if ((!patients || patients.length === 0) || (!doctors || doctors.length === 0)) {
          const [p, d] = await Promise.all([
            adminApi.getAllPatients(),
            adminApi.getAllDoctors()
          ]);
          // Only set if still empty to avoid overriding parent-provided lists
          if (!patients || patients.length === 0) {
            // mutate via local state by replacing props usage where mapped
          }
        }
      } catch (e) {
        console.error('Fallback load for modal failed', e);
      }
    };
    if (isOpen) loadIfEmpty();
  }, [isOpen, patients, doctors]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Update IDs when selection changes
    if (name === 'patientName') {
      const selectedPatient = patients.find(patient => patient.name === value);
      setFormData(prev => ({
        ...prev,
        patientId: selectedPatient?.id || '',
        patientName: value
      }));
    } else if (name === 'doctorName') {
      const selectedDoctor = doctors.find(doctor => doctor.name === value);
      setFormData(prev => ({
        ...prev,
        doctorId: selectedDoctor?.id || '',
        doctorName: value
      }));
    }
  };

  const handleAddTestResult = () => {
    setFormData({
      ...formData,
      testResults: [...formData.testResults, { name: '', value: '', date: new Date().toISOString().split('T')[0] }]
    });
  };

  const handleTestResultChange = (index, field, value) => {
    const updatedTestResults = [...formData.testResults];
    updatedTestResults[index] = {
      ...updatedTestResults[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      testResults: updatedTestResults
    });
  };

  const handleRemoveTestResult = (index) => {
    const updatedTestResults = formData.testResults.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      testResults: updatedTestResults
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (!formData.patientId || !formData.doctorId) {
      setError('Please select both a patient and doctor');
      setIsSubmitting(false);
      return;
    }

    try {
      // Persist to backend
      const payload = {
        patientId: String(formData.patientId),
        doctorId: String(formData.doctorId),
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        notes: formData.notes,
        recordDate: formData.date
      };
      await medicalRecordsApi.addMedicalRecord(payload);
      if (onAdd) onAdd();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create medical record. Please try again.');
      console.error('Error creating medical record:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container add-medical-record-modal">
        <div className="modal-header">
          <h2>Add New Medical Record</h2>
          <button className="close-icon" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Patient & Doctor Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="patientName">Patient *</label>
                  <select
                    id="patientName"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.name}>{patient.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="doctorName">Doctor *</label>
                  <select
                    id="doctorName"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.name}>{doctor.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Medical Details</h3>
              <div className="form-group">
                <label htmlFor="diagnosis">Diagnosis *</label>
                <input
                  type="text"
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prescription">Prescription</label>
                <textarea
                  id="prescription"
                  name="prescription"
                  value={formData.prescription}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Dates</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Record Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="followUpDate">Follow-up Date</label>
                  <input
                    type="date"
                    id="followUpDate"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3>Test Results</h3>
                <button 
                  type="button" 
                  className="add-test-btn" 
                  onClick={handleAddTestResult}
                >
                  <i className="fas fa-plus"></i> Add Test
                </button>
              </div>
              
              {formData.testResults.length > 0 ? (
                formData.testResults.map((test, index) => (
                  <div key={index} className="test-result-item">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Test Name</label>
                        <input
                          type="text"
                          value={test.name}
                          onChange={(e) => handleTestResultChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Result Value</label>
                        <input
                          type="text"
                          value={test.value}
                          onChange={(e) => handleTestResultChange(index, 'value', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Test Date</label>
                        <input
                          type="date"
                          value={test.date}
                          onChange={(e) => handleTestResultChange(index, 'date', e.target.value)}
                          required
                        />
                      </div>
                      <button 
                        type="button" 
                        className="remove-test-btn" 
                        onClick={() => handleRemoveTestResult(index)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-tests-message">No test results added</p>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus"></i> Add Medical Record
                  </>
                )}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedicalRecordModal; 