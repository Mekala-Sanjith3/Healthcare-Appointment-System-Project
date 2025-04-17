import React, { useState } from 'react';
import '../../../styles/pages/admin/AddAppointmentModal.css';

const AddAppointmentModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    doctorName: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    time: '09:00 AM',
    type: 'Consultation',
    status: 'PENDING',
    notes: ''
  });

  const [patientOptions, setPatientOptions] = useState([
    { id: 'P10023', name: 'Mekal Srujitha' },
    { id: 'P10045', name: 'J Umesh Chandra' },
    { id: 'P10056', name: 'Mannava Ganesh' },
    { id: 'P10078', name: 'Karthik Reddy' },
    { id: 'P10089', name: 'Rahul Kumar' }
  ]);

  const [doctorOptions, setDoctorOptions] = useState([
    { id: 'D0045', name: 'Dr. Sarah Johnson', specialization: 'Dermatology' },
    { id: 'D0032', name: 'Dr. Michael Chen', specialization: 'Orthopedics' },
    { id: 'D0023', name: 'Dr. Emily Wilson', specialization: 'Cardiology' }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Update associated IDs when a name is selected
    if (name === 'patientName') {
      const selectedPatient = patientOptions.find(patient => patient.name === value);
      if (selectedPatient) {
        setFormData(prev => ({ ...prev, patientId: selectedPatient.id }));
      }
    } else if (name === 'doctorName') {
      const selectedDoctor = doctorOptions.find(doctor => doctor.name === value);
      if (selectedDoctor) {
        setFormData(prev => ({ ...prev, doctorId: selectedDoctor.id }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create a new appointment with a generated ID
    const newAppointment = {
      id: Date.now(), // Use timestamp as a temporary ID
      ...formData,
      createdAt: new Date().toISOString().split('T')[0] // Today's date as creation date
    };
    
    onAdd(newAppointment);
  };

  if (!isOpen) return null;

  return (
    <div className="add-appointment-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add New Appointment</h3>
          <button 
            className="close-btn"
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h4>
                <i className="fas fa-user"></i> Patient Information
              </h4>
              <div className="form-group">
                <label htmlFor="patientName">Patient Name</label>
                <select
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Patient</option>
                  {patientOptions.map(patient => (
                    <option key={patient.id} value={patient.name}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="patientId">Patient ID</label>
                <input
                  type="text"
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  readOnly
                  className="readonly-input"
                />
              </div>
            </div>

            <div className="form-section">
              <h4>
                <i className="fas fa-user-md"></i> Doctor Information
              </h4>
              <div className="form-group">
                <label htmlFor="doctorName">Doctor Name</label>
                <select
                  id="doctorName"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctorOptions.map(doctor => (
                    <option key={doctor.id} value={doctor.name}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="doctorId">Doctor ID</label>
                <input
                  type="text"
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  readOnly
                  className="readonly-input"
                />
              </div>
            </div>

            <div className="form-section">
              <h4>
                <i className="fas fa-calendar-alt"></i> Appointment Details
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
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
                  <label htmlFor="time">Time</label>
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Appointment Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Check-up">Check-up</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Test Results">Test Results</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Vaccination">Vaccination</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`status-${formData.status.toLowerCase()}`}
                    required
                  >
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Add any additional notes or details..."
                ></textarea>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-btn">
                <i className="fas fa-calendar-plus"></i> Schedule Appointment
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={onClose}
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

export default AddAppointmentModal; 