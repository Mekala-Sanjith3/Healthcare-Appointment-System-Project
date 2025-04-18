import React, { useState, useEffect } from 'react';
import '../../../styles/pages/patient/BookAppointmentModal.css';
import { doctorApi, appointmentApi } from '../../../services/api';

const BookAppointmentModal = ({ patientId, patientName, onClose, onAddAppointment }) => {
  const [step, setStep] = useState(1); // 1: Select doctor, 2: Choose date/time, 3: Confirm
  const [formData, setFormData] = useState({
    doctorId: '',
    doctorName: '',
    specialization: '',
    date: '',
    time: '',
    type: 'Consultation',
    problem: '',
    notes: ''
  });
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [specializations, setSpecializations] = useState([]);

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
  }, []);

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

    // Create appointment object
    const appointmentData = {
      patientId,
      patientName,
      doctorId: formData.doctorId,
      doctorName: formData.doctorName,
      doctorSpecialization: formData.specialization,
      appointmentDate: formData.date,
      appointmentTime: formData.time,
      appointmentType: formData.type,
      problem: formData.problem,
      notes: formData.notes,
      status: 'PENDING'
    };

    // Pass to parent component to handle API call
    onAddAppointment(appointmentData);
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
          Review & Confirm <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <div className="confirmation-step">
      <h3>Review Appointment Details</h3>
      
      <div className="confirmation-details">
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
        <button type="button" className="back-btn" onClick={() => setStep(2)}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <button type="button" className="submit-btn" onClick={handleSubmit}>
          <i className="fas fa-check-circle"></i> Confirm Booking
        </button>
      </div>
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
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentModal; 