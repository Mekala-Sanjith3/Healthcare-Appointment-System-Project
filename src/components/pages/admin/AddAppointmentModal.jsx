import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/realtimeApi';
import '../../../styles/pages/admin/AddAppointmentModal.css';

const AddAppointmentModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    patientEmail: '',
    doctorName: '',
    doctorId: '',
    doctorSpecialization: '',
    appointmentDate: new Date().toISOString().split('T')[0], // Today's date
    appointmentTime: '09:00 AM',
    appointmentType: 'Consultation',
    status: 'PENDING',
    notes: ''
  });

  const [patientOptions, setPatientOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch patients and doctors from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch patients
        const patientsData = await adminApi.getAllPatients();
        setPatientOptions(patientsData.map(patient => ({
          id: patient.id,
          name: patient.firstName + ' ' + patient.lastName,
          email: patient.email
        })));
        
        // Fetch doctors
        const doctorsData = await adminApi.getAllDoctors();
        setDoctorOptions(doctorsData.map(doctor => ({
          id: doctor.id,
          name: 'Dr. ' + doctor.firstName + ' ' + doctor.lastName,
          specialization: doctor.specialization
        })));
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Update associated data when a name is selected
    if (name === 'patientName') {
      const selectedPatient = patientOptions.find(patient => patient.name === value);
      if (selectedPatient) {
        setFormData(prev => ({ 
          ...prev, 
          patientId: selectedPatient.id,
          patientEmail: selectedPatient.email
        }));
      }
    } else if (name === 'doctorName') {
      const selectedDoctor = doctorOptions.find(doctor => doctor.name === value);
      if (selectedDoctor) {
        setFormData(prev => ({ 
          ...prev, 
          doctorId: selectedDoctor.id,
          doctorSpecialization: selectedDoctor.specialization
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Format the appointment data for the API
      const appointmentData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        doctorId: formData.doctorId,
        doctorName: formData.doctorName,
        doctorSpecialization: formData.doctorSpecialization,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        appointmentType: formData.appointmentType,
        status: formData.status,
        notes: formData.notes
      };
      
      // Call the API to create the appointment
      const newAppointment = await adminApi.createAppointment(appointmentData);
      
      // Call the parent component's callback
      onAdd(newAppointment);
      
      // Reset the form
      setFormData({
        patientName: '',
        patientId: '',
        patientEmail: '',
        doctorName: '',
        doctorId: '',
        doctorSpecialization: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '09:00 AM',
        appointmentType: 'Consultation',
        status: 'PENDING',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
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
          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i> Loading...
            </div>
          ) : (
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
                    <label htmlFor="appointmentDate">Date</label>
                    <input
                      type="date"
                      id="appointmentDate"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="appointmentTime">Time</label>
                    <select
                      id="appointmentTime"
                      name="appointmentTime"
                      value={formData.appointmentTime}
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
                    <label htmlFor="appointmentType">Appointment Type</label>
                    <select
                      id="appointmentType"
                      name="appointmentType"
                      value={formData.appointmentType}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAppointmentModal; 