import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../../styles/pages/patient/PatientDashboard.css";
import BookAppointmentModal from './BookAppointmentModal';
import { appointmentApi, patientApi, medicalRecordsApi, reviewsApi } from '../../../services/api';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');
  const [showBookAppointmentModal, setShowBookAppointmentModal] = useState(false);
  const [userData, setUserData] = useState({
    id: '',
    name: 'Patient',
    email: ''
  });
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [recordSearchQuery, setRecordSearchQuery] = useState('');
  const [telemedicineSessions, setTelemedicineSessions] = useState([]);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState({
    overallScore: 85,
    exercise: 70,
    diet: 80,
    sleep: 90,
    stress: 75
  });
  const [recommendationFocus, setRecommendationFocus] = useState('all');
  const [isAiLoadingInsights, setIsAiLoadingInsights] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: '',
    anonymous: false
  });
  const [pastDoctors, setPastDoctors] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) {
      navigate('/patient-login');
      return;
    }

    try {
      const storedUserData = JSON.parse(userDataStr);
      if (storedUserData.role !== 'PATIENT') {
        navigate('/');
        return;
      }
      
      // Fetch patient details and appointments
      const fetchPatientData = async () => {
        setIsLoading(true);
        try {
          // Fetch patient profile
          const patientProfile = await patientApi.getPatientProfile(storedUserData.id);
          setUserData({
            id: storedUserData.id,
            email: patientProfile.email || storedUserData.email,
            name: patientProfile.name || storedUserData.email.split('@')[0]
          });
          
          // Fetch patient appointments
          const patientAppointments = await appointmentApi.getAppointmentsByPatientId(storedUserData.id);
          setAppointments(patientAppointments);
        } catch (error) {
          console.error("Failed to load patient data:", error);
          setError("Failed to load your data. Please refresh the page or contact support.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchPatientData();
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate('/patient-login');
    }
  }, [navigate]);

  // Fetch medical records when history tab is active
  useEffect(() => {
    if (activeTab === 'history' && userData.id) {
      const fetchMedicalRecords = async () => {
        setIsLoadingRecords(true);
        try {
          const records = await medicalRecordsApi.getPatientMedicalHistory(userData.id);
          setMedicalRecords(records);
        } catch (error) {
          console.error("Failed to load medical records:", error);
          setError("Failed to load your medical history. Please try again later.");
        } finally {
          setIsLoadingRecords(false);
        }
      };
      
      fetchMedicalRecords();
    }
  }, [activeTab, userData.id]);

  // Add this useEffect to fetch telemedicine sessions
  useEffect(() => {
    if (activeTab === 'telemedicine' && userData.id) {
      // Simulate fetching telemedicine sessions
      // In a real app, you would have a specific API call for this
      const fetchTelemedicineSessions = async () => {
        setIsLoading(true);
        try {
          // Filter appointments to get ones marked as telemedicine
          const teleSessions = appointments.filter(
            app => app.appointmentType?.toLowerCase().includes('tele') || 
                  app.appointmentType?.toLowerCase().includes('video')
          );
          
          // For demo, add a mock upcoming session if none exist
          if (teleSessions.length === 0) {
            const today = new Date();
            const futureDate = new Date(today);
            futureDate.setHours(today.getHours() + 2);
            
            const mockSession = {
              id: 'tele_' + Date.now(),
              doctorName: 'Dr. Sarah Johnson',
              appointmentType: 'Video Consultation',
              appointmentDate: today.toISOString().split('T')[0],
              appointmentTime: `${futureDate.getHours()}:00`,
              status: 'CONFIRMED',
              notes: 'Follow-up for your recent checkup',
              doctorId: 'doc_1',
              patientId: userData.id,
              meetingUrl: 'https://meet.example.com/dr-sarah-johnson',
              isTeleMedicine: true
            };
            
            setTelemedicineSessions([mockSession]);
          } else {
            setTelemedicineSessions(teleSessions);
          }
          
        } catch (error) {
          console.error("Failed to load telemedicine sessions:", error);
          setError("Failed to load your video sessions. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchTelemedicineSessions();
    }
  }, [activeTab, userData.id, appointments]);

  // Add a useEffect to load AI health insights
  useEffect(() => {
    if (activeTab === 'ai-recommendations' && userData.id) {
      const fetchHealthInsights = async () => {
        setIsAiLoadingInsights(true);
        
        try {
          // In a real app, you would make an API call to get personalized AI insights
          // For demo purposes, we'll simulate a delay and use mock data
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock data based on medical records
          const insights = {
            overallScore: 85,
            exercise: medicalRecords.length > 2 ? 70 : 60,
            diet: 80,
            sleep: 90,
            stress: 75,
            recommendations: {
              exercise: [
                { title: "Morning Walk", description: "Start with a 15-minute morning walk to boost metabolism" },
                { title: "Strength Training", description: "Add 2 days of light strength training to your weekly routine" },
                { title: "Active Breaks", description: "Take a 5-minute movement break for every hour of sitting" }
              ],
              diet: [
                { title: "Increase Protein", description: "Add more lean protein sources to support muscle health" },
                { title: "Hydration", description: "Drink at least 8 glasses of water daily" },
                { title: "Reduce Sugar", description: "Cut down on processed sugars to improve energy levels" }
              ],
              sleep: [
                { title: "Consistent Schedule", description: "Maintain a regular sleep schedule, even on weekends" },
                { title: "Screen Time", description: "Avoid screens 1 hour before bedtime to improve sleep quality" },
                { title: "Sleep Environment", description: "Ensure your bedroom is dark, quiet, and cool for optimal rest" }
              ],
              mental: [
                { title: "Mindfulness Practice", description: "Spend 10 minutes daily on mindfulness meditation" },
                { title: "Stress Management", description: "Identify stress triggers and develop coping strategies" },
                { title: "Social Connection", description: "Maintain regular social interactions to support mental health" }
              ]
            },
            insights: [
              "Your blood pressure has been consistently in the healthy range",
              "Consider discussing vitamin D supplementation with your doctor",
              "Your latest checkup shows excellent progress in overall health",
            ]
          };
          
          setHealthMetrics(insights);
        } catch (error) {
          console.error("Failed to load health insights:", error);
          setError("Failed to load AI health recommendations. Please try again later.");
        } finally {
          setIsAiLoadingInsights(false);
        }
      };
      
      fetchHealthInsights();
    }
  }, [activeTab, userData.id, medicalRecords.length]);

  // Fetch reviews when reviews tab is active
  useEffect(() => {
    if (activeTab === 'reviews' && userData.id) {
      const fetchReviews = async () => {
        setIsLoadingReviews(true);
        try {
          // Fetch reviews from the reviewsApi
          const patientReviews = await reviewsApi.getPatientReviews(userData.id);
          setReviews(patientReviews);
          
          // Get past doctors the patient has visited
          const pastDoctorsList = await reviewsApi.getPatientPastDoctors(userData.id);
          setPastDoctors(pastDoctorsList);
        } catch (error) {
          console.error("Failed to load reviews:", error);
          setError("Failed to load your reviews. Please try again later.");
        } finally {
          setIsLoadingReviews(false);
        }
      };
      
      fetchReviews();
    }
  }, [activeTab, userData.id, appointments]);

  // Handle search for medical records
  const handleSearchRecords = async () => {
    if (!userData.id) return;
    
    setIsLoadingRecords(true);
    try {
      const searchResults = await medicalRecordsApi.searchMedicalRecords(
        userData.id, 
        recordSearchQuery
      );
      setMedicalRecords(searchResults);
    } catch (error) {
      console.error("Failed to search medical records:", error);
      setError("Search failed. Please try again.");
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleAddAppointment = async (newAppointment) => {
    try {
      // Add appointment using the API
      const savedAppointment = await appointmentApi.createAppointment(newAppointment);
      
      // Update state with the new appointment
      setAppointments(prev => [...prev, savedAppointment]);
      setShowBookAppointmentModal(false);
    } catch (error) {
      console.error("Failed to create appointment:", error);
      setError("Failed to book appointment. Please try again.");
    }
  };

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const handleViewAppointmentDetails = (appointmentId) => {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowAppointmentDetailsModal(true);
    }
  };

  const closeAppointmentDetailsModal = () => {
    setShowAppointmentDetailsModal(false);
    setSelectedAppointment(null);
  };

  const renderAppointmentRow = (appointment) => (
    <tr key={appointment.id}>
      <td>{appointment.appointmentDate} {appointment.appointmentTime}</td>
      <td>{appointment.doctorName}</td>
      <td>{appointment.appointmentType}</td>
      <td>
        <span className={`status-badge ${getStatusClass(appointment.status)}`}>
          {appointment.status}
        </span>
      </td>
      <td>
        <button className="view-details-btn" onClick={() => handleViewAppointmentDetails(appointment.id)}>View Details</button>
      </td>
    </tr>
  );

  // Handle joining a video session
  const handleJoinSession = (session) => {
    setCurrentSession(session);
    setShowVideoCall(true);
  };

  // Handle ending a video call
  const handleEndCall = () => {
    setShowVideoCall(false);
    setCurrentSession(null);
  };

  // Function to render health metric progress bar
  const renderHealthMetric = (name, value, icon) => (
    <div className="health-metric-item">
      <div className="metric-header">
        <i className={`fas fa-${icon}`}></i>
        <span>{name}</span>
      </div>
      <div className="metric-progress-container">
        <div 
          className="metric-progress-bar" 
          style={{ width: `${value}%`, backgroundColor: getHealthColor(value) }}
        ></div>
      </div>
      <div className="metric-value">{value}/100</div>
    </div>
  );
  
  // Function to get color based on health score
  const getHealthColor = (score) => {
    if (score >= 80) return '#4CAF50'; // Green for good
    if (score >= 60) return '#FF9800'; // Orange for average
    return '#F44336'; // Red for needs improvement
  };

  // Handle opening the review modal
  const handleOpenReviewModal = (doctor) => {
    setSelectedDoctor(doctor);
    setReviewFormData({
      rating: 5,
      comment: '',
      anonymous: false
    });
    setShowReviewModal(true);
  };
  
  // Handle review form input changes
  const handleReviewFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReviewFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle submitting a review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor) return;
    
    try {
      // Create the review data object
      const reviewData = {
        patientId: userData.id,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        rating: parseInt(reviewFormData.rating),
        review: reviewFormData.comment,
        isAnonymous: reviewFormData.anonymous,
        lastAppointmentDate: selectedDoctor.lastAppointmentDate || selectedDoctor.lastVisit
      };
      
      // Submit the review using the API
      const newReview = await reviewsApi.createReview(reviewData);
      
      // Add the new review to the reviews list
      setReviews(prev => [newReview, ...prev]);
      
      // Close the modal
      setShowReviewModal(false);
      setSelectedDoctor(null);
    } catch (error) {
      console.error("Failed to submit review:", error);
      setError("Failed to submit your review. Please try again.");
    }
  };
  
  // Function to render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i key={i} className={`fas fa-star ${i <= rating ? 'filled' : 'empty'}`}></i>
      );
    }
    return stars;
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <i className="fas fa-user-circle"></i>
          <h2>Patient Portal</h2>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <i className="fas fa-calendar-alt nav-icon"></i>
            Appointments
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'telemedicine' ? 'active' : ''}`}
            onClick={() => setActiveTab('telemedicine')}
          >
            <i className="fas fa-video nav-icon"></i>
            Telemedicine
          </button>

          <button 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fas fa-history nav-icon"></i>
            Medical History
          </button>

          <button 
            className={`nav-item ${activeTab === 'ai-recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-recommendations')}
          >
            <i className="fas fa-robot nav-icon"></i>
            AI Recommendations
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <i className="fas fa-star nav-icon"></i>
            Reviews & Feedback
          </button>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="nav-item logout"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('userData');
              navigate('/');
            }}
          >
            <i className="fas fa-sign-out-alt nav-icon"></i>
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-title">
            <h1>Welcome, {userData.name}</h1>
            <p>Manage your healthcare journey</p>
          </div>
          
          <div className="doctor-profile">
            <div className="profile-avatar">{userData.name.charAt(0)}</div>
            <span className="doctor-name">{userData.name}</span>
          </div>
        </div>

        <div className="tabs">
          <div className="tabs-list">
            <button 
              className={`tab-trigger ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              Appointments
            </button>
            <button 
              className={`tab-trigger ${activeTab === 'telemedicine' ? 'active' : ''}`}
              onClick={() => setActiveTab('telemedicine')}
            >
              Telemedicine
            </button>
            <button 
              className={`tab-trigger ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Medical History
            </button>
            <button 
              className={`tab-trigger ${activeTab === 'ai-recommendations' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai-recommendations')}
            >
              AI Recommendations
            </button>
            <button 
              className={`tab-trigger ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'appointments' && (
              <div className="card">
                <div className="card-header">
                  <h2>Upcoming Appointments</h2>
                  <button 
                    className="book-appointment-btn"
                    onClick={() => setShowBookAppointmentModal(true)}
                  >
                    <i className="fas fa-plus"></i>
                    Book Appointment
                  </button>
                </div>
                <div className="card-content">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Doctor</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.length > 0 ? (
                        appointments.map(renderAppointmentRow)
                      ) : (
                        <tr>
                          <td colSpan="5" className="no-data">
                            <p>No upcoming appointments. Click "Book Appointment" to schedule one.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'telemedicine' && (
              <div className="card">
                <div className="card-header">
                  <h2>Telemedicine Sessions</h2>
                </div>
                <div className="card-content">
                  {isLoading ? (
                    <div className="loading-indicator">Loading telemedicine sessions...</div>
                  ) : (
                    <div className="telemedicine-grid">
                      <div className="upcoming-sessions">
                        <h3>Upcoming Sessions</h3>
                        {telemedicineSessions.length > 0 ? (
                          telemedicineSessions.map(session => (
                            <div className="session-card" key={session.id}>
                              <div className="session-info">
                                <p className="session-time">
                                  {new Date(session.appointmentDate).toLocaleDateString()} at {session.appointmentTime}
                                </p>
                                <p className="session-doctor">
                                  <i className="fas fa-user-md"></i> {session.doctorName}
                                </p>
                                <p className="session-type">
                                  <i className="fas fa-video"></i> {session.appointmentType}
                                </p>
                                {session.notes && (
                                  <p className="session-notes">
                                    <i className="fas fa-clipboard"></i> {session.notes}
                                  </p>
                                )}
                              </div>
                              <button 
                                className="join-session-btn"
                                onClick={() => handleJoinSession(session)}
                              >
                                <i className="fas fa-video"></i>
                                Join Session
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="no-data">
                            <p>No upcoming telemedicine sessions.</p>
                            <button 
                              className="schedule-session-btn"
                              onClick={() => setShowBookAppointmentModal(true)}
                            >
                              <i className="fas fa-plus"></i>
                              Schedule Video Consultation
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="telemedicine-tips">
                        <h3>Prepare for Your Session</h3>
                        <ul>
                          <li>Test your microphone and camera before the call</li>
                          <li>Find a quiet space with good lighting</li>
                          <li>Have a list of your symptoms or questions ready</li>
                          <li>Keep any relevant medical records or medications nearby</li>
                          <li>Join the session 5 minutes early to check your connection</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="card">
                <div className="card-header">
                  <h2>Medical History</h2>
                </div>
                <div className="card-content">
                  <div className="medical-history">
                    <div className="history-filters">
                      <input 
                        type="text" 
                        placeholder="Search records..." 
                        className="search-bar"
                        value={recordSearchQuery}
                        onChange={(e) => setRecordSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchRecords()}
                      />
                      <button 
                        className="search-btn"
                        onClick={handleSearchRecords}
                      >
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                    
                    {isLoadingRecords ? (
                      <div className="loading-indicator">Loading medical records...</div>
                    ) : medicalRecords.length > 0 ? (
                      <div className="history-timeline">
                        {medicalRecords.map(record => (
                          <div className="history-item" key={record.id}>
                            <div className="history-date">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            <div className="history-content">
                              <h4>{record.diagnosis}</h4>
                              <p className="doctor-info">
                                <i className="fas fa-user-md"></i> {record.doctorName}
                              </p>
                              <p className="record-type">
                                <i className="fas fa-clipboard-list"></i> {record.type}
                              </p>
                              <p className="record-notes">
                                <strong>Notes:</strong> {record.notes}
                              </p>
                              {record.prescriptions && record.prescriptions !== 'None' && (
                                <p className="record-prescriptions">
                                  <strong>Prescriptions:</strong> {record.prescriptions}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-data">
                        <p>No medical records found.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai-recommendations' && (
              <div className="card">
                <div className="card-header">
                  <h2>AI Health Insights</h2>
                </div>
                <div className="card-content">
                  {isAiLoadingInsights ? (
                    <div className="loading-indicator">Analyzing your health data...</div>
                  ) : (
                    <div className="ai-recommendations">
                      <div className="health-overview">
                        <div className="health-score-circle">
                          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" strokeWidth="8" />
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="45" 
                              fill="none" 
                              stroke={getHealthColor(healthMetrics.overallScore)}
                              strokeWidth="8" 
                              strokeDasharray={`${2 * Math.PI * 45 * healthMetrics.overallScore/100} ${2 * Math.PI * 45 * (1 - healthMetrics.overallScore/100)}`}
                              strokeDashoffset={2 * Math.PI * 45 * 0.25} 
                            />
                            <text x="50" y="50" fontSize="22" textAnchor="middle" dy="8" fontWeight="bold">{healthMetrics.overallScore}</text>
                          </svg>
                          <p>Health Score</p>
                        </div>
                        
                        <div className="health-metrics">
                          {renderHealthMetric('Exercise', healthMetrics.exercise, 'running')}
                          {renderHealthMetric('Diet', healthMetrics.diet, 'apple-alt')}
                          {renderHealthMetric('Sleep', healthMetrics.sleep, 'bed')}
                          {renderHealthMetric('Stress', healthMetrics.stress, 'brain')}
                        </div>
                      </div>
                      
                      <div className="ai-insights">
                        <h3>Key Insights</h3>
                        <ul className="insights-list">
                          {healthMetrics.insights && healthMetrics.insights.map((insight, index) => (
                            <li key={index} className="insight-item">
                              <i className="fas fa-lightbulb"></i>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="recommendations-section">
                        <h3>Personalized Recommendations</h3>
                        <div className="recommendation-filters">
                          <button 
                            className={`filter-btn ${recommendationFocus === 'all' ? 'active' : ''}`}
                            onClick={() => setRecommendationFocus('all')}
                          >
                            All
                          </button>
                          <button 
                            className={`filter-btn ${recommendationFocus === 'exercise' ? 'active' : ''}`}
                            onClick={() => setRecommendationFocus('exercise')}
                          >
                            Exercise
                          </button>
                          <button 
                            className={`filter-btn ${recommendationFocus === 'diet' ? 'active' : ''}`}
                            onClick={() => setRecommendationFocus('diet')}
                          >
                            Diet
                          </button>
                          <button 
                            className={`filter-btn ${recommendationFocus === 'sleep' ? 'active' : ''}`}
                            onClick={() => setRecommendationFocus('sleep')}
                          >
                            Sleep
                          </button>
                          <button 
                            className={`filter-btn ${recommendationFocus === 'mental' ? 'active' : ''}`}
                            onClick={() => setRecommendationFocus('mental')}
                          >
                            Mental
                          </button>
                        </div>
                        
                        <div className="recommendation-cards">
                          {healthMetrics.recommendations && (recommendationFocus === 'all' 
                            ? [...(healthMetrics.recommendations.exercise || []),
                               ...(healthMetrics.recommendations.diet || []),
                               ...(healthMetrics.recommendations.sleep || []),
                               ...(healthMetrics.recommendations.mental || [])].slice(0, 6)
                            : healthMetrics.recommendations[recommendationFocus] || []
                          ).map((rec, index) => (
                            <div className="recommendation-card" key={index}>
                              <i className={`fas fa-${
                                recommendationFocus === 'exercise' || rec.title.includes('Exercise') ? 'running' :
                                recommendationFocus === 'diet' || rec.title.includes('Protein') || rec.title.includes('Hydration') ? 'apple-alt' :
                                recommendationFocus === 'sleep' || rec.title.includes('Sleep') ? 'bed' :
                                'brain'
                              }`}></i>
                              <h4>{rec.title}</h4>
                              <p>{rec.description}</p>
                              <button className="action-btn">
                                <i className="fas fa-check-circle"></i> Mark as Done
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="ai-action-buttons">
                        <button className="print-insights-btn">
                          <i className="fas fa-print"></i> Print Insights
                        </button>
                        <button className="track-progress-btn">
                          <i className="fas fa-chart-line"></i> Track Progress
                        </button>
                        <button className="share-with-doctor-btn">
                          <i className="fas fa-share-alt"></i> Share with Doctor
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="card">
                <div className="card-header">
                  <h2>Doctor Reviews & Feedback</h2>
                </div>
                <div className="card-content">
                  {isLoadingReviews ? (
                    <div className="loading-indicator">Loading reviews...</div>
                  ) : (
                    <div className="reviews-section">
                      <div className="reviews-header">
                        <div className="reviews-tabs">
                          <h3>Your Feedback</h3>
                          <p className="reviews-description">
                            Share your experience with doctors you've consulted to help others make informed decisions.
                          </p>
                        </div>
                        <div className="review-actions">
                          <div className="dropdown">
                            <button className="write-review-btn">
                              <i className="fas fa-plus"></i> Write a Review
                              <i className="fas fa-chevron-down"></i>
                            </button>
                            <div className="dropdown-content">
                              {pastDoctors.length > 0 ? (
                                pastDoctors.map(doctor => (
                                  <button 
                                    key={doctor.id} 
                                    className="dropdown-item"
                                    onClick={() => handleOpenReviewModal(doctor)}
                                  >
                                    {doctor.name}
                                  </button>
                                ))
                              ) : (
                                <div className="dropdown-item disabled">
                                  No doctors to review
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {reviews.length > 0 ? (
                        <div className="reviews-list">
                          {reviews.map(review => (
                            <div className="review-card" key={review.id}>
                              <div className="review-header">
                                <div className="doctor-info">
                                  <h4>{review.doctorName}</h4>
                                  <p className="specialty">{review.doctorSpecialty}</p>
                                </div>
                                <div className="review-date">
                                  {new Date(review.createdAt || review.date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              </div>
                              <div className="review-rating">
                                {renderStars(review.rating)}
                                <span className="rating-text">{review.rating}/5</span>
                              </div>
                              <div className="review-content">
                                <p>{review.review || review.comment}</p>
                              </div>
                              <div className="review-footer">
                                <div className="review-status">
                                  {review.isAnonymous || review.anonymous ? (
                                    <span className="anonymous-badge">
                                      <i className="fas fa-user-secret"></i> Posted anonymously
                                    </span>
                                  ) : (
                                    <span className="public-badge">
                                      <i className="fas fa-user"></i> Posted publicly
                                    </span>
                                  )}
                                </div>
                                <div className="review-actions">
                                  <button 
                                    className="edit-review-btn"
                                    onClick={() => {
                                      setSelectedDoctor({
                                        id: review.doctorId,
                                        name: review.doctorName,
                                        specialty: review.doctorSpecialty,
                                        lastVisit: review.lastAppointmentDate
                                      });
                                      setReviewFormData({
                                        rating: review.rating,
                                        comment: review.review || review.comment,
                                        anonymous: review.isAnonymous || review.anonymous
                                      });
                                      setShowReviewModal(true);
                                    }}
                                  >
                                    <i className="fas fa-edit"></i> Edit
                                  </button>
                                  <button 
                                    className="delete-review-btn"
                                    onClick={async () => {
                                      if (window.confirm('Are you sure you want to delete this review?')) {
                                        try {
                                          await reviewsApi.deleteReview(review.id, userData.id, review.doctorId);
                                          setReviews(prev => prev.filter(r => r.id !== review.id));
                                        } catch (error) {
                                          console.error('Failed to delete review:', error);
                                          setError('Failed to delete review. Please try again.');
                                        }
                                      }
                                    }}
                                  >
                                    <i className="fas fa-trash"></i> Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-reviews">
                          <div className="empty-state">
                            <i className="fas fa-star-half-alt empty-icon"></i>
                            <h3>No reviews yet</h3>
                            <p>You haven't submitted any reviews. Share your experience with doctors you've consulted.</p>
                            {pastDoctors.length > 0 && (
                              <button 
                                className="write-first-review-btn"
                                onClick={() => handleOpenReviewModal(pastDoctors[0])}
                              >
                                Write Your First Review
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showBookAppointmentModal && (
        <BookAppointmentModal 
          patientId={userData.id}
          patientName={userData.name}
          onClose={() => setShowBookAppointmentModal(false)}
          onAddAppointment={handleAddAppointment}
        />
      )}

      {showAppointmentDetailsModal && (
        <div className="appointment-details-modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeAppointmentDetailsModal}>&times;</span>
            <h2>Appointment Details</h2>
            <p><strong>Date:</strong> {selectedAppointment?.appointmentDate} {selectedAppointment?.appointmentTime}</p>
            <p><strong>Doctor:</strong> {selectedAppointment?.doctorName}</p>
            <p><strong>Type:</strong> {selectedAppointment?.appointmentType}</p>
            <p><strong>Status:</strong> {selectedAppointment?.status}</p>
            <p><strong>Notes:</strong> {selectedAppointment?.notes}</p>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {showVideoCall && currentSession && (
        <div className="video-call-modal">
          <div className="video-call-container">
            <div className="video-header">
              <h3>Session with {currentSession.doctorName}</h3>
              <button className="end-call-btn" onClick={handleEndCall}>
                <i className="fas fa-phone-slash"></i> End Call
              </button>
            </div>
            <div className="video-main">
              <div className="video-large">
                <img 
                  src="https://via.placeholder.com/640x480.png?text=Doctor+Video+Feed" 
                  alt="Doctor Video" 
                  className="doctor-video" 
                />
                <div className="doctor-name-tag">{currentSession.doctorName}</div>
              </div>
              <div className="video-small">
                <img 
                  src="https://via.placeholder.com/240x180.png?text=Your+Video" 
                  alt="Your Video" 
                  className="patient-video" 
                />
                <div className="patient-name-tag">You</div>
              </div>
            </div>
            <div className="video-controls">
              <button className="control-btn mic">
                <i className="fas fa-microphone"></i>
              </button>
              <button className="control-btn camera">
                <i className="fas fa-video"></i>
              </button>
              <button className="control-btn share">
                <i className="fas fa-desktop"></i>
              </button>
              <button className="control-btn chat">
                <i className="fas fa-comment"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedDoctor && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <div className="review-modal-header">
              <h3>Rate Your Experience</h3>
              <button 
                className="close-modal-btn"
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedDoctor(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="review-modal-body">
              <div className="doctor-profile-summary">
                <div className="doctor-avatar">
                  {selectedDoctor.name.charAt(0)}
                </div>
                <div className="doctor-details">
                  <h4>{selectedDoctor.name}</h4>
                  <p>{selectedDoctor.specialty}</p>
                  <p className="last-visit">
                    <i className="fas fa-calendar-check"></i> 
                    Last visit: {new Date(selectedDoctor.lastVisit).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleSubmitReview}>
                <div className="form-group rating-group">
                  <label>Your Rating</label>
                  <div className="star-rating">
                    {[5, 4, 3, 2, 1].map(star => (
                      <label key={star} className={parseInt(reviewFormData.rating) >= star ? 'active' : ''}>
                        <input
                          type="radio"
                          name="rating"
                          value={star}
                          checked={parseInt(reviewFormData.rating) === star}
                          onChange={handleReviewFormChange}
                        />
                        <i className="fas fa-star"></i>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="review-comment">Your Review</label>
                  <textarea
                    id="review-comment"
                    name="comment"
                    value={reviewFormData.comment}
                    onChange={handleReviewFormChange}
                    placeholder="Share details of your experience with this doctor"
                    rows={5}
                    required
                  ></textarea>
                  <p className="form-hint">Your review helps others make better healthcare decisions.</p>
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="anonymous"
                      checked={reviewFormData.anonymous}
                      onChange={handleReviewFormChange}
                    />
                    <span className="checkbox-text">Post anonymously</span>
                  </label>
                  <p className="form-hint">
                    If checked, your name will not be displayed with your review.
                  </p>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedDoctor(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-review-btn">
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard; 