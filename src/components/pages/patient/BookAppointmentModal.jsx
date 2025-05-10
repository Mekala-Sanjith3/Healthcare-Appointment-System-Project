import React, { useState, useEffect } from 'react';
import '../../../styles/pages/patient/BookAppointmentModal.css';
import { doctorApi, appointmentApi, patientApi } from '../../../services/api';

const BookAppointmentModal = ({ patientId, patientName, onClose, onAddAppointment }) => {
  const [step, setStep] = useState(1); // 1: Select doctor, 2: Choose date/time, 3: Enter medical details, 4: Confirm
  const [formData, setFormData] = useState({
    doctorId: '',
    doctorName: '',
    specialization: '',
    date: '',
    time: '',
    type: 'Consultation',
    problem: '',
    notes: '',
    // Additional patient details
    age: '',
    bloodGroup: '',
    gender: '',
    allergyHistory: '',
    currentMedications: '',
    pastMedicalHistory: '',
    height: '',
    weight: '',
    temperature: '',
    bloodPressure: '',
    pulse: '',
    oxygenSaturation: ''
  });
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        // Fetch doctors from API
        const doctorsList = await doctorApi.getAllDoctors();
        
        // Only show active doctors
        const activeDoctors = doctorsList.filter(doctor => doctor.status === 'ACTIVE');
        setDoctors(activeDoctors);
        setFilteredDoctors(activeDoctors);
        
        // Extract unique specializations for filter dropdown
        const uniqueSpecializations = [...new Set(activeDoctors.map(doctor => doctor.specialization))];
        setSpecializations(uniqueSpecializations);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        setError("Failed to load doctors. Please try again.");
        setIsLoading(false);
      }
    };

    fetchDoctors();
    
    // Fetch patient info for pre-filling form fields
    const fetchPatientInfo = async () => {
      try {
        if (patientId) {
          const patientData = await patientApi.getPatientById(patientId);
          setPatientInfo(patientData);
          
          // Pre-fill form data with patient information
          setFormData(prev => ({
            ...prev,
            age: patientData.age || '',
            gender: patientData.gender || '',
            bloodGroup: patientData.bloodGroup || ''
          }));
        }
      } catch (error) {
        console.error("Failed to fetch patient information:", error);
      }
    };
    
    fetchPatientInfo();
  }, [patientId]);

  // Filter doctors when specialization changes
  useEffect(() => {
    if (selectedSpecialization) {
      const filtered = doctors.filter(
        doctor => doctor.specialization === selectedSpecialization
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [selectedSpecialization, doctors]);

  // Generate available time slots for selected date
  useEffect(() => {
    if (formData.date && formData.doctorId) {
      const fetchAvailableTimes = async () => {
        try {
          // In a real implementation, we would fetch available times from the API
          // For now, we'll generate some default times and check against existing appointments
          const baseTimeSlots = [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
            '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', 
            '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
          ];
          
          // Fetch the doctor's appointments for this date to check availability
          const appointments = await appointmentApi.getAppointmentsByDoctorId(formData.doctorId);
          const bookedTimes = appointments
            .filter(app => app.appointmentDate === formData.date)
            .map(app => app.appointmentTime);
          
          // Filter out booked times
          const available = baseTimeSlots.filter(time => !bookedTimes.includes(time));
          setAvailableTimes(available);
        } catch (error) {
          console.error("Failed to fetch available times:", error);
          setError("Could not retrieve available appointment times.");
        }
      };
      
      fetchAvailableTimes();
    }
  }, [formData.date, formData.doctorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDoctorSelect = (doctor) => {
    setFormData(prev => ({
      ...prev,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization
    }));
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        // Extract patient ID from localStorage to ensure it's current
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const currentPatientId = userData.id || patientId;
        
        if (!currentPatientId) {
            throw new Error('Patient ID not found. Please log in again.');
        }
        
        // Format the appointment data
        const appointmentData = {
            patientId: currentPatientId,
            patientName: patientName,
            doctorId: formData.doctorId,
            doctorName: formData.doctorName,
            doctorSpecialization: formData.specialization,
            appointmentDate: formData.date,
            appointmentTime: formData.time,
            appointmentType: formData.type,
            problem: formData.problem,
            notes: formData.notes,
            // Include patient medical details
            patientDetails: {
                age: formData.age,
                bloodGroup: formData.bloodGroup,
                gender: formData.gender,
                allergyHistory: formData.allergyHistory,
                currentMedications: formData.currentMedications,
                pastMedicalHistory: formData.pastMedicalHistory,
                vitalSigns: {
                    height: formData.height,
                    weight: formData.weight,
                    temperature: formData.temperature,
                    bloodPressure: formData.bloodPressure,
                    pulse: formData.pulse,
                    oxygenSaturation: formData.oxygenSaturation
                }
            }
        };

        console.log('Submitting appointment data:', appointmentData);

        // Call the API to create the appointment
        const response = await appointmentApi.createAppointment(appointmentData);
        
        console.log('Appointment created successfully:', response);

        // Pass to parent component to update UI
        onAddAppointment(response);
        
        // Display success message in step 4
        setStep(4);
    } catch (error) {
        console.error("Failed to create appointment:", error);
        setError(error.message || "Failed to book appointment. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <div className="specialization-filter">
        <label htmlFor="specialization">Filter by Specialization:</label>
        <select 
          id="specialization-filter" 
          value={selectedSpecialization} 
          onChange={(e) => setSelectedSpecialization(e.target.value)}
        >
          <option value="">All Specializations</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Dermatology">Dermatology</option>
          <option value="Neurology">Neurology</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Psychiatry">Psychiatry</option>
          <option value="General Medicine">General Medicine</option>
          <option value="Gynecology">Gynecology</option>
          <option value="Ophthalmology">Ophthalmology</option>
          <option value="ENT">ENT (Ear, Nose, Throat)</option>
        </select>
      </div>

      <div className="doctors-grid">
        {isLoading ? (
          <div className="loading">Loading doctors...</div>
        ) : filteredDoctors.length === 0 ? (
          <div className="no-doctors">
            <p>No doctors available for the selected specialization.</p>
          </div>
        ) : (
          filteredDoctors.map(doctor => (
            <div 
              key={doctor.id} 
              className="doctor-card"
              onClick={() => handleDoctorSelect(doctor)}
            >
              <div className="doctor-avatar">
                <img 
                  src={doctor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`} 
                  alt={doctor.name} 
                />
              </div>
              <div className="doctor-info">
                <h3>{doctor.name}</h3>
                <p className="doctor-specialization">{doctor.specialization}</p>
                <p className="doctor-experience">{doctor.experience || '5+'} years experience</p>
                <div className="doctor-rating">
                  <span className="stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <i 
                        key={star}
                        className={`fas fa-star ${star <= (doctor.rating || 4) ? 'filled' : ''}`}
                      ></i>
                    ))}
                  </span>
                  <span className="rating-count">{doctor.reviewCount || '120'} reviews</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  const renderStep2 = () => (
    <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="appointment-form">
      <div className="selected-doctor">
        <h3>Selected Doctor</h3>
        <div className="doctor-summary">
          <p><strong>{formData.doctorName}</strong></p>
          <p>{formData.specialization}</p>
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="date">Appointment Date</label>
        <input 
          type="date" 
          id="date" 
          name="date"
          value={formData.date}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="time">Appointment Time</label>
        <select 
          id="time" 
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
          disabled={!formData.date}
        >
          <option value="">Select a time</option>
          {availableTimes.map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
        {formData.date && availableTimes.length === 0 && (
          <p className="no-slots-message">No available time slots for this date. Please select another date.</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="type">Appointment Type</label>
        <select 
          id="type" 
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="Consultation">Consultation</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Check-up">General Check-up</option>
          <option value="Emergency">Emergency</option>
          <option value="Vaccination">Vaccination</option>
          <option value="Procedure">Procedure</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="problem">Describe Your Problem</label>
        <textarea 
          id="problem" 
          name="problem"
          value={formData.problem}
          onChange={handleChange}
          rows="3"
          placeholder="Please describe your symptoms or reason for visit"
          required
        ></textarea>
      </div>

      <div className="form-actions">
        <button type="button" className="back-btn" onClick={() => setStep(1)}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <button 
          type="submit" 
          className="next-btn"
          disabled={!formData.date || !formData.time}
        >
          Next: Medical Details <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="appointment-form">
      <h3>Patient Medical Details</h3>
      <p className="form-description">Please provide your health information to help the doctor prepare for your appointment.</p>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input 
            type="number" 
            id="age" 
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Years"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select 
            id="gender" 
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bloodGroup">Blood Group</label>
          <select 
            id="bloodGroup" 
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            required
          >
            <option value="">Select blood group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="height">Height (cm)</label>
          <input 
            type="number" 
            id="height" 
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="In centimeters"
          />
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight (kg)</label>
          <input 
            type="number" 
            id="weight" 
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="In kilograms"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="temperature">Temperature (°F)</label>
          <input 
            type="text" 
            id="temperature" 
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            placeholder="98.6°F"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bloodPressure">Blood Pressure (mm Hg)</label>
          <input 
            type="text" 
            id="bloodPressure" 
            name="bloodPressure"
            value={formData.bloodPressure}
            onChange={handleChange}
            placeholder="120/80"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pulse">Pulse (bpm)</label>
          <input 
            type="text" 
            id="pulse" 
            name="pulse"
            value={formData.pulse}
            onChange={handleChange}
            placeholder="72 bpm"
          />
        </div>

        <div className="form-group">
          <label htmlFor="oxygenSaturation">Oxygen Saturation (%)</label>
          <input 
            type="text" 
            id="oxygenSaturation" 
            name="oxygenSaturation"
            value={formData.oxygenSaturation}
            onChange={handleChange}
            placeholder="98%"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="allergyHistory">Allergies (if any)</label>
        <textarea 
          id="allergyHistory" 
          name="allergyHistory"
          value={formData.allergyHistory}
          onChange={handleChange}
          rows="2"
          placeholder="List any allergies to medications, food, or other substances"
        ></textarea>
      </div>

      <div className="form-group">
        <label htmlFor="currentMedications">Current Medications</label>
        <textarea 
          id="currentMedications" 
          name="currentMedications"
          value={formData.currentMedications}
          onChange={handleChange}
          rows="2"
          placeholder="List any medications you are currently taking with dosage"
        ></textarea>
      </div>

      <div className="form-group">
        <label htmlFor="pastMedicalHistory">Past Medical History</label>
        <textarea 
          id="pastMedicalHistory" 
          name="pastMedicalHistory"
          value={formData.pastMedicalHistory}
          onChange={handleChange}
          rows="3"
          placeholder="Any previous surgeries, hospitalizations, or significant medical conditions"
        ></textarea>
      </div>

      <div className="form-actions">
        <button type="button" className="back-btn" onClick={() => setStep(2)}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <button type="submit" className="next-btn">
          Review & Confirm <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </form>
  );

  const renderStep4 = () => (
    <div className="confirmation-step">
      <h3>Review Appointment Details</h3>
      
      <div className="confirmation-details">
        <div className="confirmation-section">
          <h4>Appointment Information</h4>
          <div className="detail-item">
            <span className="detail-label">Doctor:</span>
            <span className="detail-value">{formData.doctorName}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Specialization:</span>
            <span className="detail-value">{formData.specialization}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{formData.date}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Time:</span>
            <span className="detail-value">{formData.time}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Type:</span>
            <span className="detail-value">{formData.type}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Problem:</span>
            <span className="detail-value">{formData.problem}</span>
          </div>
        </div>

        <div className="confirmation-section">
          <h4>Patient Information</h4>
          <div className="detail-item">
            <span className="detail-label">Age:</span>
            <span className="detail-value">{formData.age}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Gender:</span>
            <span className="detail-value">{formData.gender}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Blood Group:</span>
            <span className="detail-value">{formData.bloodGroup}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Height/Weight:</span>
            <span className="detail-value">{formData.height ? formData.height + ' cm' : '-'} / {formData.weight ? formData.weight + ' kg' : '-'}</span>
          </div>
          {formData.allergyHistory && (
            <div className="detail-item">
              <span className="detail-label">Allergies:</span>
              <span className="detail-value">{formData.allergyHistory}</span>
            </div>
          )}
          {formData.currentMedications && (
            <div className="detail-item">
              <span className="detail-label">Current Medications:</span>
              <span className="detail-value">{formData.currentMedications}</span>
            </div>
          )}
        </div>
      </div>

      <div className="notes-section">
        <label htmlFor="notes">Additional Notes (Optional)</label>
        <textarea 
          id="notes" 
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="2"
          placeholder="Any additional information you'd like to provide"
        ></textarea>
      </div>

      <div className="consent-section">
        <label className="consent-checkbox">
          <input type="checkbox" required />
          <span>I confirm that the information provided is accurate and consent to share it with the healthcare provider.</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="back-btn" onClick={() => setStep(3)}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <button type="button" className="submit-btn" onClick={handleSubmit}>
          <i className="fas fa-check-circle"></i> Confirm Booking
        </button>
      </div>
    </div>
  );

  const renderSuccessMessage = () => (
    <div className="success-message">
      <div className="success-icon">
        <i className="fas fa-check-circle"></i>
      </div>
      <h3>Appointment Scheduled Successfully!</h3>
      <p>Your appointment with {formData.doctorName} has been booked for {formData.date} at {formData.time}.</p>
      <p>You will receive a confirmation notification, and the appointment details will appear in your dashboard.</p>
      <button type="button" className="close-success-btn" onClick={onClose}>
        Close
      </button>
    </div>
  );

  return (
    <div className="book-appointment-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Book an Appointment</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="stepper">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-label">Select Doctor</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">Schedule</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">Medical Details</span>
          </div>
          <div className={`step ${step >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <span className="step-label">Confirm</span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <div className="modal-body">
          {isLoading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Processing your appointment...</p>
            </div>
          ) : (
            <>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderSuccessMessage()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentModal; 