import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/pages/patient/DoctorSearch.css';
import { doctorApi } from '../../../services/realtimeApi'; // Import the doctorApi for API calls

const DoctorSearch = () => {
  // State for search/filter params
  const [filters, setFilters] = useState({
    name: '',
    specialty: '',
    location: '',
    availableDate: '',
  });
  
  // State for doctors data
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for pagination
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
  });

  // State for doctor profile modal
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    reason: '',
    type: 'In-person'
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // State for specialties list (for dropdown)
  const [specialties, setSpecialties] = useState([]);
  
  // Function to fetch specializations
  const fetchSpecializations = async () => {
    try {
      const specs = await doctorApi.getSpecializations();
      setSpecialties(specs);
    } catch (error) {
      console.error("Failed to fetch specializations:", error);
      // Fallback to default specializations
      setSpecialties([
        'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
        'Neurology', 'Obstetrics', 'Oncology', 'Ophthalmology',
        'Orthopedics', 'Pediatrics', 'Psychiatry', 'Urology'
      ]);
    }
  };

  // Function to fetch doctors
  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Use the doctorApi to fetch doctors with filters
      const response = await doctorApi.getDoctorsWithFilters({
        name: filters.name,
        specialty: filters.specialty,
        location: filters.location,
        availableDate: filters.availableDate,
        page: pagination.page,
        limit: pagination.limit
      });
      
      // Set the data from the API response
      setDoctors(response.data);
      setPagination({
        ...pagination,
        total: response.meta.total,
        totalPages: response.meta.totalPages
      });
    } catch (err) {
      setError('Failed to fetch doctors. Please try again later.');
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to page 1 when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };
  
  // Handle search button click
  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Open the doctor profile modal
  const handleViewProfile = (doctor) => {
    setSelectedDoctor(doctor);
    setShowProfileModal(true);
    setShowAppointmentForm(false);
    setBookingSuccess(false);
  };

  // Close the doctor profile modal
  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedDoctor(null);
    setShowAppointmentForm(false);
    setBookingSuccess(false);
  };

  // Handle appointment form toggle
  const toggleAppointmentForm = () => {
    setShowAppointmentForm(!showAppointmentForm);
    setBookingSuccess(false);
  };

  // Reset appointment form
  const resetAppointmentForm = () => {
    setAppointmentData({
      date: '',
      time: '',
      reason: '',
      type: 'In-person'
    });
  };

  // Handle appointment form input changes
  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle book appointment click
  const handleBookAppointment = (e, doctor = null) => {
    e.preventDefault();
    
    if (doctor) {
      // If clicked directly from doctor card
      setSelectedDoctor(doctor);
      setShowProfileModal(true);
      setShowAppointmentForm(true);
      setBookingSuccess(false);
    } else {
      // If doctor is already selected (from profile modal)
      // Here you would typically send this data to your backend API
      console.log('Booking appointment with:', selectedDoctor);
      console.log('Appointment details:', appointmentData);
      
      // Simulate success (in a real app, this would be based on API response)
      setBookingSuccess(true);
      setShowAppointmentForm(false);
      
      // Reset form
      resetAppointmentForm();
    }
  };
  
  // Fetch doctors when page changes
  useEffect(() => {
    fetchDoctors();
  }, [pagination.page]);
  
  // Fetch doctors and specializations on component mount
  useEffect(() => {
    fetchSpecializations();
    fetchDoctors();
  }, []);
  
  return (
    <div className="doctor-search-container">
      <h2 className="section-title">Find a Doctor</h2>
      
      <div className="search-card">
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                <i className="fas fa-user-md"></i>
                Doctor Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="Search by name"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="specialty">
                <i className="fas fa-stethoscope"></i>
                Specialty
              </label>
              <select
                id="specialty"
                name="specialty"
                value={filters.specialty}
                onChange={handleFilterChange}
                className="form-control"
              >
                <option value="">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="location">
                <i className="fas fa-map-marker-alt"></i>
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="City or area"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="availableDate">
                <i className="fas fa-calendar-alt"></i>
                Available Date
              </label>
              <input
                type="date"
                id="availableDate"
                name="availableDate"
                value={filters.availableDate}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary search-btn">
            <i className="fas fa-search"></i>
            Search Doctors
          </button>
        </form>
      </div>
      
      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading doctors...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="results-stats">
            Found {pagination.total} doctors matching your criteria
          </div>
          
          <div className="doctors-grid">
            {doctors.length === 0 ? (
              <div className="no-results">
                <i className="fas fa-user-md"></i>
                <h3>No doctors found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            ) : (
              doctors.map(doctor => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-avatar">
                    {doctor.profile_picture ? (
                      <img src={doctor.profile_picture} alt={`Dr. ${doctor.name || `${doctor.first_name} ${doctor.last_name}`}`} />
                    ) : (
                      <div className="avatar-placeholder">
                        <i className="fas fa-user-md"></i>
                      </div>
                    )}
                  </div>
                  
                  <div className="doctor-info">
                    <h3 className="doctor-name">
                      {doctor.name || `Dr. ${doctor.first_name || ''} ${doctor.last_name || ''}`}
                    </h3>
                    <p className="doctor-specialty">{doctor.specialization || doctor.specialty}</p>
                    <div className="doctor-detail">
                      <i className="fas fa-envelope"></i>
                      <span>{doctor.email}</span>
                    </div>
                    <div className="doctor-detail">
                      <i className="fas fa-phone"></i>
                      <span>{doctor.phone_number || 'Not Available'}</span>
                    </div>
                    {doctor.clinic_address && (
                      <div className="doctor-detail">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{doctor.clinic_address}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="doctor-actions">
                    <button 
                      className="btn btn-primary view-profile-btn"
                      onClick={() => handleViewProfile(doctor)}
                    >
                      <i className="fas fa-user-md"></i>
                      View Profile
                    </button>
                    <button 
                      className="btn btn-secondary book-appointment-btn"
                      onClick={(e) => handleBookAppointment(e, doctor)}
                    >
                      <i className="fas fa-calendar-plus"></i>
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <i className="fas fa-chevron-left"></i>
                Previous
              </button>
              
              <div className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              
              <button 
                className="pagination-btn"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      {/* Doctor Profile Modal */}
      {showProfileModal && selectedDoctor && (
        <div className="doctor-profile-modal-overlay">
          <div className="doctor-profile-modal">
            <button className="close-modal-btn" onClick={closeProfileModal}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="doctor-profile-header">
              <div className="doctor-profile-avatar">
                {selectedDoctor.profile_picture ? (
                  <img src={selectedDoctor.profile_picture} alt={selectedDoctor.name} />
                ) : (
                  <div className="avatar-placeholder large">
                    <i className="fas fa-user-md"></i>
                  </div>
                )}
              </div>
              
              <div className="doctor-profile-basic-info">
                <h2 className="doctor-profile-name">
                  {selectedDoctor.name || `Dr. ${selectedDoctor.first_name || ''} ${selectedDoctor.last_name || ''}`}
                </h2>
                <p className="doctor-profile-specialty">
                  {selectedDoctor.specialization || selectedDoctor.specialty}
                </p>
                
                {/* Doctor Ratings */}
                <div className="doctor-ratings">
                  <div className="rating-stars">
                    <i className="fas fa-star filled"></i>
                    <i className="fas fa-star filled"></i>
                    <i className="fas fa-star filled"></i>
                    <i className="fas fa-star filled"></i>
                    <i className="fas fa-star-half-alt"></i>
                  </div>
                  <span className="rating-count">4.5 (124 reviews)</span>
                </div>
              </div>
            </div>
            
            {/* Doctor Profile Content */}
            <div className="doctor-profile-content">
              <div className="doctor-profile-section">
                <h3>
                  <i className="fas fa-info-circle"></i>
                  About
                </h3>
                <p className="doctor-about">
                  {selectedDoctor.about || `Dr. ${selectedDoctor.first_name || ''} ${selectedDoctor.last_name || ''} is a ${selectedDoctor.specialization || selectedDoctor.specialty} specialist with ${selectedDoctor.experience || 'several years of'} experience in diagnosing and treating patients.`}
                </p>
              </div>
              
              <div className="doctor-profile-section">
                <h3>
                  <i className="fas fa-medal"></i>
                  Qualifications
                </h3>
                <p className="doctor-qualifications">
                  {selectedDoctor.qualification || 'MD, Board Certified in ' + (selectedDoctor.specialization || selectedDoctor.specialty)}
                </p>
              </div>
              
              <div className="doctor-profile-section">
                <h3>
                  <i className="fas fa-clock"></i>
                  Experience
                </h3>
                <p className="doctor-experience">
                  {selectedDoctor.experience || '10+ years'}
                </p>
              </div>
              
              <div className="doctor-profile-section">
                <h3>
                  <i className="fas fa-map-marker-alt"></i>
                  Location
                </h3>
                <p className="doctor-location">
                  {selectedDoctor.clinic_address || 'Main City Hospital, Medical Center'}
                </p>
              </div>
              
              <div className="doctor-profile-section">
                <h3>
                  <i className="fas fa-phone-alt"></i>
                  Contact
                </h3>
                <p className="doctor-contact">
                  <span>Email: {selectedDoctor.email}</span>
                  <span>Phone: {selectedDoctor.phone_number || 'Not Available'}</span>
                </p>
              </div>
            </div>
            
            {/* Appointment Section */}
            <div className="doctor-profile-footer">
              {!showAppointmentForm && !bookingSuccess && (
                <button className="btn btn-primary schedule-btn" onClick={toggleAppointmentForm}>
                  <i className="fas fa-calendar-plus"></i>
                  Schedule an Appointment
                </button>
              )}
              
              {bookingSuccess && (
                <div className="booking-success">
                  <i className="fas fa-check-circle"></i>
                  <p>Appointment booked successfully!</p>
                  <button className="btn btn-secondary" onClick={closeProfileModal}>
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Separate Appointment Booking Modal */}
          {showAppointmentForm && (
            <div className="book-an-appointment-modal">
              <button className="close-appointment-btn" onClick={toggleAppointmentForm}>
                <i className="fas fa-times"></i>
              </button>
              
              <h2>Book an Appointment</h2>
              
              <form onSubmit={(e) => handleBookAppointment(e)}>
                <div className="appointment-input-group">
                  <label className="appointment-label" htmlFor="date">
                    <i className="fas fa-calendar-day"></i>
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={appointmentData.date}
                    onChange={handleAppointmentChange}
                    required
                    className="appointment-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="appointment-input-group">
                  <label className="appointment-label" htmlFor="time">
                    <i className="fas fa-clock"></i>
                    Preferred Time
                  </label>
                  <select
                    id="time"
                    name="time"
                    value={appointmentData.time}
                    onChange={handleAppointmentChange}
                    required
                    className="appointment-select"
                  >
                    <option value="">Select a time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
                
                <div className="appointment-input-group">
                  <label className="appointment-label" htmlFor="type">
                    <i className="fas fa-stethoscope"></i>
                    Appointment Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={appointmentData.type}
                    onChange={handleAppointmentChange}
                    required
                    className="appointment-select"
                  >
                    <option value="In-person">In-person Consultation</option>
                    <option value="Video">Video Consultation</option>
                    <option value="Follow-up">Follow-up Appointment</option>
                  </select>
                </div>
                
                <div className="appointment-input-group">
                  <label className="appointment-label" htmlFor="reason">
                    <i className="fas fa-clipboard-list"></i>
                    Reason for Visit
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={appointmentData.reason}
                    onChange={handleAppointmentChange}
                    placeholder="Please briefly describe your symptoms or reason for the appointment"
                    className="appointment-textarea"
                    rows="3"
                    required
                  ></textarea>
                </div>
                
                <div className="appointment-buttons">
                  <button type="button" className="cancel-button" onClick={toggleAppointmentForm}>
                    Cancel
                  </button>
                  <button type="submit" className="confirm-button">
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorSearch; 