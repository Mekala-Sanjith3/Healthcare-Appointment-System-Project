import React, { useState, useEffect } from 'react';
import '../../../styles/pages/patient/BookAppointmentModal.css';
import { doctorApi, appointmentApi, patientApi } from '../../../services/api';
import PaymentModal from './PaymentModal';

const BookAppointmentModal = ({ patientId, patientName, onClose, onAddAppointment }) => {
  const [step, setStep] = useState(1); // 1: Select doctor, 2: Choose date/time, 3: Enter medical details, 4: Confirm, 5: Payment
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
  
  // Payment related states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tempAppointmentData, setTempAppointmentData] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const specs = await doctorApi.getSpecializations();
        setSpecializations(specs);
      } catch (error) {
        console.error("Failed to fetch specializations:", error);
      }
    };

    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const allDoctors = await doctorApi.getAllDoctors();
        setDoctors(allDoctors);
        setFilteredDoctors(allDoctors);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        setError("Failed to load doctors. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPatientInfo = async () => {
      if (!patientId) return;
      
      try {
        const patientData = await patientApi.getPatientProfile(patientId);
        setPatientInfo(patientData);
        
        // Pre-fill form data if available
        if (patientData) {
          setFormData(prevData => ({
            ...prevData,
            age: patientData.age || '',
            gender: patientData.gender || '',
            bloodGroup: patientData.bloodGroup || '',
            allergyHistory: patientData.allergies || '',
            currentMedications: patientData.currentMedications || '',
            pastMedicalHistory: patientData.medicalHistory || '',
            height: patientData.height || '',
            weight: patientData.weight || ''
          }));
        }
      } catch (error) {
        console.error("Failed to fetch patient info:", error);
      }
    };

    fetchSpecializations();
    fetchDoctors();
    fetchPatientInfo();
  }, [patientId]);

  useEffect(() => {
    if (selectedSpecialization) {
      const filtered = doctors.filter(doctor => 
        doctor.specialization === selectedSpecialization
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [selectedSpecialization, doctors]);

  useEffect(() => {
    if (formData.date && formData.doctorId) {
      fetchAvailableTimes(formData.doctorId, formData.date);
    } else {
      setAvailableTimes([]);
    }
  }, [formData.date, formData.doctorId]);

  const fetchAvailableTimes = async (doctorId, date) => {
    try {
      const times = await doctorApi.getAvailableTimeSlots(doctorId, date);
      setAvailableTimes(times);
    } catch (error) {
      console.error("Failed to fetch available times:", error);
      setError("Failed to load available time slots. Please try again.");
      setAvailableTimes([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleDoctorSelect = (doctor) => {
    setFormData(prevState => ({
      ...prevState,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization
    }));
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
        const appointmentData = {
            patientId: patientId,
            patientName: patientName,
            doctorId: formData.doctorId,
            doctorName: formData.doctorName,
            doctorSpecialization: formData.specialization,
            appointmentDate: formData.date,
            appointmentTime: formData.time,
            appointmentType: formData.type,
            problem: formData.problem,
            notes: formData.notes,
            patientDetails: {
                age: formData.age,
                gender: formData.gender,
                bloodGroup: formData.bloodGroup,
                allergyHistory: formData.allergyHistory,
                currentMedications: formData.currentMedications,
                pastMedicalHistory: formData.pastMedicalHistory,
                height: formData.height,
                weight: formData.weight,
                temperature: formData.temperature,
                bloodPressure: formData.bloodPressure,
                pulse: formData.pulse,
                oxygenSaturation: formData.oxygenSaturation
            }
        };

        console.log('Appointment data prepared for payment:', appointmentData);
        
        // Store the appointment data temporarily
        setTempAppointmentData(appointmentData);
        
        // Show the payment modal
        setShowPaymentModal(true);
    } catch (error) {
        console.error("Failed to prepare for payment:", error);
        setError(error.message || "Failed to process appointment. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };
  
  // Handle payment completion
  const handlePaymentComplete = async (payment) => {
    try {
      setPaymentDetails(payment);
      setPaymentCompleted(true);
      setShowPaymentModal(false);
      
      console.log('Payment completed:', payment);
      console.log('Creating appointment with payment details');
      
      // Add payment information to the appointment data
      const appointmentWithPayment = {
        ...tempAppointmentData,
        paymentId: payment.id,
        paymentStatus: payment.status,
        paymentAmount: payment.amount,
        paymentMethod: payment.paymentMethod
      };
      
      // Call the API to create the appointment
      const response = await appointmentApi.createAppointment(appointmentWithPayment);
      
      console.log('Appointment created successfully:', response);
      
      // Pass to parent component to update UI
      onAddAppointment(response);
      
      // Move to success step
      setStep(5);
    } catch (error) {
      console.error("Failed to finalize appointment after payment:", error);
      setError(error.message || "Payment was processed but we couldn't complete your booking. Please contact support.");
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
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> Loading doctors...
          </div>
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map(doctor => (
            <div key={doctor.id} className="doctor-card" onClick={() => handleDoctorSelect(doctor)}>
              <div className="doctor-avatar">
                {doctor.profileImage ? (
                  <img src={doctor.profileImage} alt={doctor.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {doctor.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="doctor-info">
                <h3>{doctor.name}</h3>
                <p className="doctor-spec">{doctor.specialization}</p>
                <p className="doctor-exp">{doctor.experience} years experience</p>
              </div>
              <div className="doctor-rating">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i 
                      key={star} 
                      className={`fas fa-star ${star <= doctor.rating ? 'filled' : ''}`}
                    ></i>
                  ))}
                </div>
                <span className="rating-count">{doctor.reviewCount || 0} reviews</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-doctors">
            <i className="fas fa-user-md"></i>
            <p>No doctors found for the selected specialization.</p>
          </div>
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
            placeholder="Centimeters"
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
            placeholder="Kilograms"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="bloodGroup">Blood Group</label>
          <select 
            id="bloodGroup" 
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
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
      </div>

      <div className="form-row">
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
          {formData.bloodGroup && (
            <div className="detail-item">
              <span className="detail-label">Blood Group:</span>
              <span className="detail-value">{formData.bloodGroup}</span>
            </div>
          )}
          {formData.height && formData.weight && (
            <div className="detail-item">
              <span className="detail-label">Height/Weight:</span>
              <span className="detail-value">{formData.height} cm / {formData.weight} kg</span>
            </div>
          )}
        </div>
        
        {(formData.allergyHistory || formData.currentMedications || formData.pastMedicalHistory) && (
          <div className="confirmation-section">
            <h4>Medical History</h4>
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
            {formData.pastMedicalHistory && (
              <div className="detail-item">
                <span className="detail-label">Medical History:</span>
                <span className="detail-value">{formData.pastMedicalHistory}</span>
              </div>
            )}
          </div>
        )}
        
        {formData.notes && (
          <div className="notes-section">
            <label>Additional Notes:</label>
            <p>{formData.notes}</p>
          </div>
        )}
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
          <i className="fas fa-credit-card"></i> Proceed to Payment
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
      {paymentDetails && (
        <div className="payment-summary">
          <p className="payment-confirmation">
            <i className="fas fa-receipt"></i> Payment of ${paymentDetails.amount}.00 was processed successfully.
          </p>
          <p className="payment-method">
            Payment Method: {paymentDetails.paymentMethod === 'CARD' ? 
              `Card ending in ${paymentDetails.cardDetails?.lastFourDigits}` : 
              `Insurance (${paymentDetails.insurance?.provider})`}
          </p>
          <p className="transaction-id">
            Transaction ID: {paymentDetails.transactionId}
          </p>
        </div>
      )}
      <button type="button" className="close-success-btn" onClick={onClose}>
        <i className="fas fa-arrow-right"></i> Go to Dashboard
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
          <div className={`step ${step >= 5 ? 'active' : ''}`}>
            <div className="step-number">5</div>
            <span className="step-label">Complete</span>
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
      
      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        appointmentData={tempAppointmentData}
        doctorDetails={{
          id: formData.doctorId,
          name: formData.doctorName,
          specialization: formData.specialization
        }}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default BookAppointmentModal; 