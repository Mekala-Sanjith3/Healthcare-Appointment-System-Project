import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../../styles/pages/patient/PatientDashboard.css";
import "../../../styles/pages/patient/MedicalRecords.css"; // Import the new CSS file
import BookAppointmentModal from './BookAppointmentModal';
import DoctorSearch from './DoctorSearch';
import { patientApi, appointmentApi, medicalRecordsApi } from '../../../services/realtimeApi';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
    overallScore: null,
    exercise: null,
    diet: null,
    sleep: null,
    stress: null,
    insights: [],
    recommendations: {}
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // New states for additional features
  const [medications, setMedications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [medicationFormData, setMedicationFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    notes: '',
    reminder: false
  });
  const [healthAnalytics, setHealthAnalytics] = useState({
    bloodPressure: [],
    glucose: [],
    weight: []
  });
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [documentFormData, setDocumentFormData] = useState({
    title: '',
    type: 'lab_result',
    date: '',
    file: null
  });
  
  // Quick actions state
  const [showQuickActions, setShowQuickActions] = useState(true);

  // Add useRef for dropdown
  const dropdownRef = useRef(null);

  // Add these state variables for medical records functionality
  const [activeRecordFilter, setActiveRecordFilter] = useState('all');
  const [showRecordActionsMenu, setShowRecordActionsMenu] = useState(null);
  
  // Add view type state for medical records
  const [recordViewType, setRecordViewType] = useState('grid'); // 'grid' or 'timeline'
  
  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if the click was on the button (which should toggle, not close)
      const isWriteReviewButton = event.target.closest('.write-review-btn');
      
      // Only close if dropdown is open, click is outside dropdown, and not on the button
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target) && !isWriteReviewButton) {
        setDropdownOpen(false);
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Remove event listener on cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen, dropdownRef]);

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
      
      // Set initial userData from localStorage
      setUserData({
        id: storedUserData.id,
        email: storedUserData.email || '',
        name: storedUserData.name || storedUserData.email?.split('@')[0] || 'Patient'
      });
      
      // Fetch patient details and appointments
      const fetchPatientData = async () => {
        setIsLoading(true);
        try {
          // Fetch patient profile
          const patientProfile = await patientApi.getPatientProfile(storedUserData.id);
          console.log("Fetched patient profile:", patientProfile);
          
          // Update userData with the retrieved profile data
          setUserData(prevData => ({
            ...prevData,
            id: storedUserData.id,
            email: patientProfile.email || storedUserData.email || '',
            name: patientProfile.name || patientProfile.fullName || storedUserData.name || storedUserData.email?.split('@')[0] || 'Patient'
          }));
          
          // Fetch patient appointments
          const patientAppointments = await appointmentApi.getAppointmentsByPatientId(storedUserData.id);
          console.log('Fetched patient appointments:', patientAppointments);
          
          if (patientAppointments && Array.isArray(patientAppointments)) {
            setAppointments(patientAppointments);
          } else {
            console.log('No appointments found or invalid response format');
            setAppointments([]); // Set empty array instead of error
          }
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

  // Add a new useEffect to reload appointments when the tab changes to appointments
  useEffect(() => {
    if (activeTab === 'appointments' && userData.id) {
      const fetchAppointments = async () => {
        setIsLoading(true);
        setError(null);
        try {
          console.log('Fetching appointments for patient:', userData.id);
          
          // Try to fetch from the API
          let patientAppointments = [];
          try {
            patientAppointments = await appointmentApi.getAppointmentsByPatientId(userData.id);
            console.log('Retrieved appointments from API:', patientAppointments.length, 'appointments found');
          } catch (apiError) {
            console.error('Error fetching from API:', apiError);
            // Fallback: check in localStorage for the appointment data directly
            console.log('Falling back to mockAppointments in localStorage');
            const allAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
            
            // Filter and deduplicate mock appointments for this patient
            const uniqueAppointmentsMap = new Map();
            allAppointments.forEach(app => {
              if (app.patientId === userData.id) {
                uniqueAppointmentsMap.set(app.id, app);
              }
            });
            
            patientAppointments = Array.from(uniqueAppointmentsMap.values());
            console.log('Retrieved appointments from localStorage:', patientAppointments.length, 'appointments found');
            
            // Cache these appointments to make them accessible via the API next time
            localStorage.setItem(`patient_${userData.id}_appointments`, JSON.stringify(patientAppointments));
          }
          
          if (patientAppointments && Array.isArray(patientAppointments)) {
            // Sort appointments by date (most recent first)
            patientAppointments.sort((a, b) => {
              // Convert dates to comparable format
              const dateA = new Date(a.appointmentDate + ' ' + (a.appointmentTime || '00:00'));
              const dateB = new Date(b.appointmentDate + ' ' + (b.appointmentTime || '00:00'));
              return dateB - dateA; // Descending order (most recent first)
            });
            
            setAppointments(patientAppointments);
          } else {
            console.error('Invalid response format for appointments');
            setError("Failed to load your appointments. Invalid data format received.");
          }
        } catch (error) {
          console.error("Failed to load appointments:", error);
          setError("Failed to load your appointments. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchAppointments();
    }
  }, [activeTab, userData.id]);

  // Update the useEffect that loads medical records
  useEffect(() => {
    if (activeTab === 'history' && userData.id) {
      const fetchMedicalRecords = async () => {
        setIsLoadingRecords(true);
        setError(null);
        try {
          console.log('Fetching medical records for patient:', userData.id);
          
          // Debug localStorage first
          medicalRecordsApi.debugLocalStorage(userData.id);
          
          // Try to fetch records from API
          const records = await medicalRecordsApi.getPatientMedicalHistory(userData.id);
          
          if (records && Array.isArray(records)) {
            console.log('Retrieved medical records:', records.length, 'records found');
            setMedicalRecords(records);
            if (records.length === 0) {
              // Don't show error, just show empty state
              console.log('No medical records found for patient');
            }
          } else {
            console.error('Invalid response format for medical records');
            setError("Failed to load your medical history. Invalid data format received.");
          }
        } catch (error) {
          console.error("Failed to load medical records:", error);
          setError("Failed to load your medical history. Please try again later.");
        } finally {
          setIsLoadingRecords(false);
        }
      };
      
      fetchMedicalRecords();
      
      // Return cleanup function
      return () => {
        console.log("Cleaning up medical records fetch effect");
        // Can be used to abort fetch if needed
      };
    }
  }, [activeTab, userData.id]);

  // Add this useEffect to fetch telemedicine sessions
  useEffect(() => {
    if (activeTab === 'telemedicine' && userData.id) {
      // Fetch real telemedicine sessions from database
      const fetchTelemedicineSessions = async () => {
        setIsLoading(true);
        try {
          // Filter appointments to get ones marked as telemedicine or video consultation
          const teleSessions = appointments.filter(
            app => app.appointmentType?.toLowerCase().includes('tele') || 
                  app.appointmentType?.toLowerCase().includes('video') ||
                  app.appointmentType?.toLowerCase().includes('online')
          );
          
          // Only show real telemedicine appointments from database
          setTelemedicineSessions(teleSessions);
          
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
          // Only show insights if there are medical records
          if (medicalRecords.length > 0) {
            // Generate basic insights from medical records
            const insights = {
              overallScore: null, // Don't show mock score
              exercise: null,
              diet: null,
              sleep: null,
              stress: null,
              recommendations: {},
              insights: [
                `You have ${medicalRecords.length} medical record(s) in your history.`,
                "Consult with your healthcare provider for personalized health insights."
              ]
            };
            
            setHealthMetrics(insights);
          } else {
            // No medical records, show empty state
            setHealthMetrics({
              overallScore: null,
              exercise: null,
              diet: null,
              sleep: null,
              stress: null,
              insights: [],
              recommendations: {}
            });
          }
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

  // Handle adding a new appointment
  const handleAddAppointment = async (newAppointment) => {
    try {
      console.log("Adding new appointment:", newAppointment);
      // Close modal
      setShowBookAppointmentModal(false);
      
      // Add the appointment to the API
      const addedAppointment = await appointmentApi.createAppointment({
        ...newAppointment,
        patientId: userData.id,
        patientName: userData.name
      });
      
      console.log("Appointment added successfully:", addedAppointment);
      
      // Update the appointments list with the new appointment
      setAppointments(prevAppointments => {
        // Check if appointment already exists to avoid duplicates
        const exists = prevAppointments.some(app => app.id === addedAppointment.id);
        if (exists) {
          return prevAppointments; // Don't add duplicate
        }
        return [addedAppointment, ...prevAppointments];
      });
      
      // Show success message
      setError(null);
      alert("Appointment booked successfully!");
    } catch (error) {
      console.error("Failed to book appointment:", error);
      setError("Failed to book your appointment. Please try again.");
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
    console.log("Opening review modal for doctor:", doctor);
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
        doctorSpecialty: selectedDoctor.specialty || selectedDoctor.specialization || "General Medicine",
        rating: parseInt(reviewFormData.rating),
        review: reviewFormData.comment,
        isAnonymous: reviewFormData.anonymous,
        lastAppointmentDate: selectedDoctor.lastAppointmentDate || new Date().toISOString()
      };
      
      console.log("Submitting review:", reviewData);
      
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

  // Add this function to render medical records
  const renderMedicalRecords = () => {
    if (isLoadingRecords) {
      return (
        <div className="loading-section">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading your medical records...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-section">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => {
              setError(null); // Clear the error first
              setActiveTab('history'); // This will trigger the useEffect to reload
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    
    // Check if medicalRecords is truly empty or undefined/null
    if (!medicalRecords || !Array.isArray(medicalRecords) || medicalRecords.length === 0) {
      return (
        <div className="empty-section">
          <i className="fas fa-file-medical-alt"></i>
          <h3>No Medical Records Found</h3>
          <p>You don't have any medical records in our system yet.</p>
          <button 
            className="retry-button"
            onClick={() => {
              setActiveTab('appointments'); // Go to appointments
              setTimeout(() => setActiveTab('history'), 100); // Then come back to history to refresh
            }}
          >
            Refresh
          </button>
        </div>
      );
    }
    
    console.log("Rendering medical records:", medicalRecords);
    
    // Filter records based on search query if any
    let filteredRecords = recordSearchQuery 
      ? medicalRecords.filter(record =>
          (record.diagnosis && record.diagnosis.toLowerCase().includes(recordSearchQuery.toLowerCase())) ||
          (record.doctorName && record.doctorName.toLowerCase().includes(recordSearchQuery.toLowerCase())) ||
          (record.doctor_name && record.doctor_name.toLowerCase().includes(recordSearchQuery.toLowerCase())) ||
          (record.description && record.description.toLowerCase().includes(recordSearchQuery.toLowerCase())) ||
          (record.date && record.date.includes(recordSearchQuery))
        )
      : medicalRecords;
    
    // Apply additional filter based on activeRecordFilter
    if (activeRecordFilter !== 'all') {
      filteredRecords = filteredRecords.filter(record => {
        const recordType = getRecordTypeClass(record);
        return activeRecordFilter === recordType;
      });
    }
    
    // Function to determine record type class
    const getRecordTypeClass = (record) => {
      if (record.diagnosis && record.diagnosis.toLowerCase().includes('lab')) return 'lab-result';
      if (record.diagnosis && record.diagnosis.toLowerCase().includes('prescription')) return 'prescription';
      if (record.prescription || record.prescriptions) return 'prescription';
      return 'consultation';
    };
    
    // Function to handle record download
    const handleDownloadRecord = (record) => {
      try {
        // Create a new PDF document
        const doc = new jsPDF();
        
        // Add a title
        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80); // Dark blue color
        doc.text('Medical Record', 105, 15, { align: 'center' });
        
        // Add horizontal line
        doc.setDrawColor(52, 152, 219); // Blue color
        doc.setLineWidth(0.5);
        doc.line(14, 20, 196, 20);
        
        // Add record information header
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        doc.text(`Record ID: ${record.id}`, 14, 30);
        doc.text(`Date: ${record.date}`, 14, 38);
        doc.text(`Doctor: ${record.doctorName || record.doctor_name}`, 14, 46);
        doc.text(`Specialty: ${record.specialty || 'General'}`, 14, 54);
        
        // Add record details in a table
        const recordData = [
          ['DIAGNOSIS', record.diagnosis || 'N/A'],
          ['DESCRIPTION', record.description || 'N/A'],
          ['PRESCRIPTION', record.prescription || record.prescriptions || 'N/A'],
          ['TREATMENT PLAN', record.treatment_plan || record.treatmentPlan || 'N/A'],
          ['NOTES', record.notes || 'N/A']
        ];
        
        doc.autoTable({
          startY: 65,
          head: [['Field', 'Details']],
          body: recordData,
          theme: 'grid',
          headStyles: { fillColor: [52, 152, 219], textColor: 255 },
          styles: { overflow: 'linebreak', cellWidth: 'wrap' },
          columnStyles: { 
            0: { cellWidth: 40, fontStyle: 'bold' },
            1: { cellWidth: 'auto' }
          }
        });
        
        // Add footer with date
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Created: ${new Date(record.createdAt).toLocaleDateString()}`, 14, pageHeight - 10);
        doc.text('Healthcare Appointment System - CONFIDENTIAL', 105, pageHeight - 10, { align: 'center' });
        
        // Save the PDF
        doc.save(`Medical_Record_${record.id}_${record.date}.pdf`);
        
        // Close the actions menu
        setShowRecordActionsMenu(null);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      }
    };
    
    // Function to share a record
    const handleShareRecord = (record) => {
      if (navigator.share) {
        navigator.share({
          title: `Medical Record - ${record.date}`,
          text: `Medical record from ${record.doctorName || record.doctor_name}: ${record.diagnosis}`,
          url: window.location.href
        }).then(() => {
          console.log('Successfully shared record');
        }).catch((error) => {
          console.error('Error sharing record:', error);
        });
      } else {
        // Fallback for browsers that don't support native sharing
        alert('Share feature not supported by your browser. You can download the record and share it manually.');
      }
      
      // Close the actions menu
      setShowRecordActionsMenu(null);
    };
    
    // Function to print a record
    const handlePrintRecord = (record) => {
      window.print();
      
      // Close the actions menu
      setShowRecordActionsMenu(null);
    };
    
    // Group records by date for timeline view
    const groupRecordsByDate = (records) => {
      const groups = {};
      
      records.forEach(record => {
        const date = record.date;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(record);
      });
      
      // Convert to array and sort by date (newest first)
      return Object.entries(groups)
        .map(([date, records]) => ({ date, records }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    };
    
    // Grouped records for timeline view
    const groupedRecords = groupRecordsByDate(filteredRecords);
    
    // Render timeline view
    const renderTimelineView = () => {
      if (filteredRecords.length === 0) {
        return null; // Empty state is handled separately
      }
      
      return (
        <div className="health-timeline">
          <div className="timeline-line"></div>
          
          {groupedRecords.map(group => (
            <div key={group.date} className="records-date-group">
              <div className="records-date-heading">{new Date(group.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              })}</div>
              
              {group.records.map(record => (
                <div key={record.id} className="timeline-event">
                  <div className={`timeline-dot ${getRecordTypeClass(record)}`}></div>
                  <div className={`timeline-content ${getRecordTypeClass(record)}`}>
                    <div className="timeline-date">
                      <i className={`fas ${
                        getRecordTypeClass(record) === 'lab-result' ? 'fa-flask' : 
                        getRecordTypeClass(record) === 'prescription' ? 'fa-prescription-bottle-alt' : 'fa-user-md'
                      }`}></i>
                      {getRecordTypeClass(record).replace('-', ' ')}
                    </div>
                    
                    <div className="timeline-title">
                      {record.diagnosis}
                      <span className="doctor-name-small"> by {record.doctorName || record.doctor_name}</span>
                    </div>
                    
                    <div className="timeline-description">
                      {record.description || 
                       (record.prescription || record.prescriptions) || 
                       (record.treatment_plan || record.treatmentPlan) || 
                       record.notes || 
                       'No additional details'}
                    </div>
                    
                    <div className="timeline-actions">
                      <button 
                        className="download-record-btn"
                        onClick={() => handleDownloadRecord(record)}
                      >
                        <i className="fas fa-download"></i> Download
                      </button>
                      <button 
                        className="share-record-btn"
                        onClick={() => handleShareRecord(record)}
                      >
                        <i className="fas fa-share-alt"></i> Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    };
    
    return (
      <div className="medical-records-container">
        <div className="medical-records-header">
          <h3>Medical Records</h3>
          <div className="header-controls">
            <div className="view-toggle">
              <button 
                className={`view-btn ${recordViewType === 'grid' ? 'active' : ''}`}
                onClick={() => setRecordViewType('grid')}
                title="Grid View"
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button 
                className={`view-btn ${recordViewType === 'timeline' ? 'active' : ''}`}
                onClick={() => setRecordViewType('timeline')}
                title="Timeline View"
              >
                <i className="fas fa-stream"></i>
              </button>
            </div>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search records..."
                value={recordSearchQuery}
                onChange={(e) => setRecordSearchQuery(e.target.value)}
              />
              <i className="fas fa-search"></i>
            </div>
          </div>
        </div>
        
        <div className="record-filter-tabs">
          <div 
            className={`filter-tab ${activeRecordFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveRecordFilter('all')}
          >
            <i className="fas fa-clipboard-list"></i> All Records
          </div>
          <div 
            className={`filter-tab ${activeRecordFilter === 'lab-result' ? 'active' : ''}`}
            onClick={() => setActiveRecordFilter('lab-result')}
          >
            <i className="fas fa-flask"></i> Lab Results
          </div>
          <div 
            className={`filter-tab ${activeRecordFilter === 'prescription' ? 'active' : ''}`}
            onClick={() => setActiveRecordFilter('prescription')}
          >
            <i className="fas fa-prescription-bottle-alt"></i> Prescriptions
          </div>
          <div 
            className={`filter-tab ${activeRecordFilter === 'consultation' ? 'active' : ''}`}
            onClick={() => setActiveRecordFilter('consultation')}
          >
            <i className="fas fa-user-md"></i> Consultations
          </div>
        </div>
        
        <div className="medical-records-list">
          {filteredRecords.length > 0 ? (
            recordViewType === 'grid' ? (
              // Grid view
              filteredRecords.map(record => (
                <div key={record.id} className={`medical-record-card ${getRecordTypeClass(record)}`}>
                  {/* Record actions menu */}
                  <div className="record-actions-menu">
                    <button 
                      className="menu-toggle"
                      onClick={() => setShowRecordActionsMenu(showRecordActionsMenu === record.id ? null : record.id)}
                    >
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                    
                    {showRecordActionsMenu === record.id && (
                      <div className="menu-dropdown">
                        <div 
                          className="menu-item"
                          onClick={() => handleDownloadRecord(record)}
                        >
                          <i className="fas fa-download"></i>
                          Download
                        </div>
                        <div 
                          className="menu-item"
                          onClick={() => handleShareRecord(record)}
                        >
                          <i className="fas fa-share-alt"></i>
                          Share
                        </div>
                        <div 
                          className="menu-item"
                          onClick={() => handlePrintRecord(record)}
                        >
                          <i className="fas fa-print"></i>
                          Print
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="record-header">
                    <div className="doctor-info">
                      <i className={`fas ${
                        getRecordTypeClass(record) === 'lab-result' ? 'fa-flask' : 
                        getRecordTypeClass(record) === 'prescription' ? 'fa-prescription-bottle-alt' : 'fa-user-md'
                      }`}></i>
                      <div>
                        <span className="doctor-name">{record.doctorName || record.doctor_name}</span>
                        <span className="specialty">{record.specialty}</span>
                      </div>
                    </div>
                    <div className="record-date">
                      <i className="fas fa-calendar-alt"></i>
                      {record.date}
                    </div>
                  </div>
                  
                  <div className="record-body">
                    <div className="record-field">
                      <h4>
                        <i className="fas fa-stethoscope"></i>
                        Diagnosis
                      </h4>
                      <div className="diagnosis-badge">{record.diagnosis}</div>
                    </div>
                    
                    {(record.description || record.description === '') && (
                      <div className="record-field">
                        <h4>
                          <i className="fas fa-file-medical-alt"></i>
                          Description
                        </h4>
                        <p>{record.description}</p>
                      </div>
                    )}
                    
                    {(record.prescription || record.prescriptions) && (
                      <div className="record-field">
                        <h4>
                          <i className="fas fa-prescription-bottle-alt"></i>
                          Prescription
                        </h4>
                        <p>{record.prescription || record.prescriptions}</p>
                      </div>
                    )}
                    
                    {(record.treatment_plan || record.treatmentPlan) && (
                      <div className="record-field">
                        <h4>
                          <i className="fas fa-clipboard-list"></i>
                          Treatment Plan
                        </h4>
                        <p>{record.treatment_plan || record.treatmentPlan}</p>
                      </div>
                    )}
                    
                    {record.notes && (
                      <div className="record-field">
                        <h4>
                          <i className="fas fa-sticky-note"></i>
                          Notes
                        </h4>
                        <p>{record.notes}</p>
                      </div>
                    )}
                    
                    {/* Add attachments section if there are any */}
                    {record.attachments && record.attachments.length > 0 && (
                      <div className="record-attachments">
                        <h4>
                          <i className="fas fa-paperclip"></i>
                          Attachments
                        </h4>
                        {record.attachments.map((attachment, index) => (
                          <div className="attachment-item" key={index}>
                            <i className={`fas ${
                              attachment.type === 'pdf' ? 'fa-file-pdf' :
                              attachment.type === 'image' ? 'fa-file-image' :
                              'fa-file'
                            }`}></i>
                            <span className="attachment-name">{attachment.name}</span>
                            <button className="attachment-download">
                              <i className="fas fa-download"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="record-footer">
                    <span className="record-id">Record ID: {record.id}</span>
                    <span className="created-date">
                      <i className="fas fa-clock"></i> {' '}
                      {new Date(record.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              // Timeline view
              renderTimelineView()
            )
          ) : (
            filteredRecords.length === 0 && recordSearchQuery ? (
              <div className="empty-section">
                <i className="fas fa-search"></i>
                <h3>No Results Found</h3>
                <p>No medical records match your search query "{recordSearchQuery}".</p>
                <button 
                  className="retry-button"
                  onClick={() => setRecordSearchQuery('')}
                >
                  Clear Search
                </button>
              </div>
            ) : filteredRecords.length === 0 && activeRecordFilter !== 'all' && !recordSearchQuery ? (
              <div className="empty-section">
                <i className="fas fa-filter"></i>
                <h3>No {activeRecordFilter.replace('-', ' ')} records found</h3>
                <p>There are no records in this category.</p>
                <button 
                  className="retry-button"
                  onClick={() => setActiveRecordFilter('all')}
                >
                  Show All Records
                </button>
              </div>
            ) : null
          )}
        </div>
      </div>
    );
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
            className={`nav-item ${activeTab === 'find-doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('find-doctors')}
          >
            <i className="fas fa-search nav-icon"></i>
            Find Doctors
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
            className={`nav-item ${activeTab === 'health-analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('health-analytics')}
          >
            <i className="fas fa-chart-line nav-icon"></i>
            Health Analytics
          </button>

          <button 
            className={`nav-item ${activeTab === 'medications' ? 'active' : ''}`}
            onClick={() => setActiveTab('medications')}
          >
            <i className="fas fa-pills nav-icon"></i>
            Medications
          </button>

          <button 
            className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <i className="fas fa-file-medical nav-icon"></i>
            Documents
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

        {showQuickActions && (
          <div className="quick-actions-container">
            <div className="quick-actions-header">
              <h2>Quick Actions</h2>
              <button className="toggle-quick-actions" onClick={() => setShowQuickActions(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="quick-actions-grid">
              <div className="quick-action-card" onClick={() => setShowBookAppointmentModal(true)}>
                <div className="quick-action-icon">
                  <i className="fas fa-calendar-plus"></i>
                </div>
                <span>Book Appointment</span>
              </div>
              <div className="quick-action-card" onClick={() => setShowAddMedicationModal(true)}>
                <div className="quick-action-icon">
                  <i className="fas fa-pills"></i>
                </div>
                <span>Add Medication</span>
              </div>
              <div className="quick-action-card" onClick={() => setShowUploadDocumentModal(true)}>
                <div className="quick-action-icon">
                  <i className="fas fa-file-upload"></i>
                </div>
                <span>Upload Document</span>
              </div>
              <div className="quick-action-card" onClick={() => setActiveTab('telemedicine')}>
                <div className="quick-action-icon">
                  <i className="fas fa-video"></i>
                </div>
                <span>Start Telemedicine</span>
              </div>
            </div>
          </div>
        )}

        <div className="tabs">
          <div className="tabs-list">
            <button 
              className={`tab-trigger ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              Appointments
            </button>
            <button 
              className={`tab-trigger ${activeTab === 'find-doctors' ? 'active' : ''}`}
              onClick={() => setActiveTab('find-doctors')}
            >
              Find Doctors
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
              className={`tab-trigger ${activeTab === 'health-analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('health-analytics')}
            >
              Health Analytics
            </button>
            <button 
              className={`tab-trigger ${activeTab === 'medications' ? 'active' : ''}`}
              onClick={() => setActiveTab('medications')}
            >
              Medications
            </button>
            <button 
              className={`tab-trigger ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents
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

            {activeTab === 'find-doctors' && (
              <div className="card">
                <div className="card-header">
                  <h2>Find Doctors</h2>
                </div>
                <div className="card-content doctor-search-wrapper">
                  <DoctorSearch />
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
                  {renderMedicalRecords()}
                </div>
              </div>
            )}

            {activeTab === 'health-analytics' && (
              <div className="card">
                <div className="card-header">
                  <h2>Health Analytics</h2>
                  <button className="add-health-data-btn">
                    <i className="fas fa-plus"></i> Add New Reading
                  </button>
                </div>
                <div className="card-content">
                  <div className="health-analytics-container">
                    {/* Blood Pressure Chart */}
                    <div className="health-chart-card">
                      <div className="health-chart-header">
                        <h3>Blood Pressure</h3>
                        <div className="chart-options">
                          <select className="time-range-selector">
                            <option value="1m">Last Month</option>
                            <option value="3m">Last 3 Months</option>
                            <option value="6m">Last 6 Months</option>
                            <option value="1y">Last Year</option>
                          </select>
                        </div>
                      </div>
                      <div className="chart-container">
                        <div className="chart-placeholder">
                          <div className="bp-chart-bars">
                            {healthAnalytics.bloodPressure.map((reading, index) => (
                              <div key={index} className="bp-bar-group">
                                <div 
                                  className="bp-bar systolic" 
                                  style={{height: `${reading.systolic}px`}}
                                  title={`Systolic: ${reading.systolic} mmHg`}
                                ></div>
                                <div 
                                  className="bp-bar diastolic" 
                                  style={{height: `${reading.diastolic}px`}}
                                  title={`Diastolic: ${reading.diastolic} mmHg`}
                                ></div>
                                <div className="bp-date">{new Date(reading.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</div>
                              </div>
                            ))}
                          </div>
                          <div className="chart-legend">
                            <div className="legend-item">
                              <span className="legend-color systolic"></span>
                              <span>Systolic</span>
                            </div>
                            <div className="legend-item">
                              <span className="legend-color diastolic"></span>
                              <span>Diastolic</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="chart-summary">
                        <div className="summary-item">
                          <div className="summary-value">120/80</div>
                          <div className="summary-label">Latest Reading</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-value">120/79</div>
                          <div className="summary-label">Average</div>
                        </div>
                        <div className="summary-item trend-down">
                          <div className="summary-value"><i className="fas fa-arrow-down"></i> 2%</div>
                          <div className="summary-label">Trend</div>
                        </div>
                      </div>
                    </div>

                    {/* Glucose Chart */}
                    <div className="health-chart-card">
                      <div className="health-chart-header">
                        <h3>Blood Glucose</h3>
                        <div className="chart-options">
                          <select className="time-range-selector">
                            <option value="1m">Last Month</option>
                            <option value="3m">Last 3 Months</option>
                            <option value="6m">Last 6 Months</option>
                            <option value="1y">Last Year</option>
                          </select>
                        </div>
                      </div>
                      <div className="chart-container">
                        <div className="chart-placeholder">
                          <div className="glucose-chart-line">
                            <svg viewBox="0 0 300 150" preserveAspectRatio="none">
                              <polyline
                                points="0,80 100,83 200,82 300,79"
                                fill="none"
                                stroke="#3498db"
                                strokeWidth="2"
                              />
                              {healthAnalytics.glucose.map((reading, index) => (
                                <circle
                                  key={index}
                                  cx={index * 100}
                                  cy={150 - reading.value}
                                  r="4"
                                  fill="#3498db"
                                />
                              ))}
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="chart-summary">
                        <div className="summary-item">
                          <div className="summary-value">96 mg/dL</div>
                          <div className="summary-label">Latest Reading</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-value">97 mg/dL</div>
                          <div className="summary-label">Average</div>
                        </div>
                        <div className="summary-item trend-stable">
                          <div className="summary-value"><i className="fas fa-equals"></i> 0%</div>
                          <div className="summary-label">Trend</div>
                        </div>
                      </div>
                    </div>

                    {/* Weight Chart */}
                    <div className="health-chart-card">
                      <div className="health-chart-header">
                        <h3>Weight</h3>
                        <div className="chart-options">
                          <select className="time-range-selector">
                            <option value="1m">Last Month</option>
                            <option value="3m">Last 3 Months</option>
                            <option value="6m">Last 6 Months</option>
                            <option value="1y">Last Year</option>
                          </select>
                        </div>
                      </div>
                      <div className="chart-container">
                        <div className="chart-placeholder">
                          <div className="weight-chart-area">
                            <svg viewBox="0 0 300 150" preserveAspectRatio="none">
                              <path
                                d="M0,150 L0,80 L100,79 L200,78 L300,77 L300,150 Z"
                                fill="rgba(46, 204, 113, 0.2)"
                                stroke="#2ecc71"
                                strokeWidth="2"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="chart-summary">
                        <div className="summary-item">
                          <div className="summary-value">68.5 kg</div>
                          <div className="summary-label">Latest Reading</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-value">69.3 kg</div>
                          <div className="summary-label">Average</div>
                        </div>
                        <div className="summary-item trend-down">
                          <div className="summary-value"><i className="fas fa-arrow-down"></i> 2%</div>
                          <div className="summary-label">Trend</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="card">
                <div className="card-header">
                  <h2>Medications</h2>
                  <button 
                    className="add-medication-btn"
                    onClick={() => setShowAddMedicationModal(true)}
                  >
                    <i className="fas fa-plus"></i> Add Medication
                  </button>
                </div>
                <div className="card-content">
                  <div className="medications-container">
                    <div className="medications-header">
                      <div className="medication-search">
                        <i className="fas fa-search"></i>
                        <input type="text" placeholder="Search medications..." />
                      </div>
                      <div className="medication-filter">
                        <select className="medication-status-filter">
                          <option value="all">All Medications</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    
                    {medications.length > 0 ? (
                      <div className="medications-list">
                        {medications.map((medication, index) => (
                          <div key={index} className="medication-card">
                            <div className="medication-icon">
                              <i className="fas fa-pills"></i>
                            </div>
                            <div className="medication-details">
                              <h3 className="medication-name">{medication.name}</h3>
                              <div className="medication-dosage">
                                <i className="fas fa-prescription-bottle-alt"></i>
                                <span>{medication.dosage}</span>
                              </div>
                              <div className="medication-frequency">
                                <i className="fas fa-clock"></i>
                                <span>{medication.frequency}</span>
                              </div>
                              <div className="medication-dates">
                                <span className="start-date">
                                  <i className="fas fa-calendar-day"></i>
                                  Started: {new Date(medication.startDate).toLocaleDateString()}
                                </span>
                                {medication.endDate && (
                                  <span className="end-date">
                                    <i className="fas fa-calendar-check"></i>
                                    Ends: {new Date(medication.endDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {medication.notes && (
                                <div className="medication-notes">
                                  <i className="fas fa-sticky-note"></i>
                                  <span>{medication.notes}</span>
                                </div>
                              )}
                            </div>
                            <div className="medication-actions">
                              <button className="edit-medication-btn">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="delete-medication-btn">
                                <i className="fas fa-trash-alt"></i>
                              </button>
                              <div className="reminder-toggle">
                                <label className="switch">
                                  <input 
                                    type="checkbox" 
                                    checked={medication.reminder}
                                    onChange={() => {
                                      // Toggle reminder logic
                                    }}
                                  />
                                  <span className="slider round"></span>
                                </label>
                                <span>Reminder</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-medications">
                        <div className="empty-state">
                          <i className="fas fa-prescription-bottle empty-icon"></i>
                          <h3>No medications added yet</h3>
                          <p>Keep track of your medications by adding them here.</p>
                          <button 
                            className="add-first-medication-btn"
                            onClick={() => setShowAddMedicationModal(true)}
                          >
                            Add Your First Medication
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="medication-reminders">
                    <h3>Today's Medication Schedule</h3>
                    <div className="reminder-timeline">
                      <div className="timeline-slot morning">
                        <div className="timeline-time">Morning</div>
                        <div className="timeline-medications">
                          <div className="timeline-medication">
                            <i className="fas fa-prescription-bottle-alt"></i>
                            <span>Vitamin D (1000 IU)</span>
                            <span className="time-due">8:00 AM</span>
                          </div>
                        </div>
                      </div>
                      <div className="timeline-slot afternoon">
                        <div className="timeline-time">Afternoon</div>
                        <div className="timeline-medications">
                          <div className="timeline-medication">
                            <i className="fas fa-prescription-bottle-alt"></i>
                            <span>Ibuprofen (200mg)</span>
                            <span className="time-due">12:00 PM</span>
                          </div>
                        </div>
                      </div>
                      <div className="timeline-slot evening">
                        <div className="timeline-time">Evening</div>
                        <div className="timeline-medications">
                          <div className="timeline-medication taken">
                            <i className="fas fa-prescription-bottle-alt"></i>
                            <span>Multivitamin</span>
                            <span className="time-due">6:00 PM</span>
                            <i className="fas fa-check-circle"></i>
                          </div>
                        </div>
                      </div>
                      <div className="timeline-slot night">
                        <div className="timeline-time">Night</div>
                        <div className="timeline-medications">
                          <div className="timeline-medication">
                            <i className="fas fa-prescription-bottle-alt"></i>
                            <span>Calcium (500mg)</span>
                            <span className="time-due">9:00 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="card">
                <div className="card-header">
                  <h2>Documents</h2>
                  <button 
                    className="upload-document-btn"
                    onClick={() => setShowUploadDocumentModal(true)}
                  >
                    <i className="fas fa-file-upload"></i> Upload Document
                  </button>
                </div>
                <div className="card-content">
                  <div className="documents-container">
                    <div className="documents-header">
                      <div className="document-search">
                        <i className="fas fa-search"></i>
                        <input type="text" placeholder="Search documents..." />
                      </div>
                      <div className="document-filters">
                        <select className="document-type-filter">
                          <option value="all">All Documents</option>
                          <option value="lab_result">Lab Results</option>
                          <option value="prescription">Prescriptions</option>
                          <option value="imaging">Imaging Reports</option>
                          <option value="insurance">Insurance</option>
                          <option value="other">Other</option>
                        </select>
                        <select className="document-sort">
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="name_asc">Name (A-Z)</option>
                          <option value="name_desc">Name (Z-A)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="document-categories">
                      <div className="category-card active">
                        <div className="category-icon">
                          <i className="fas fa-file-medical"></i>
                        </div>
                        <div className="category-info">
                          <div className="category-name">All</div>
                          <div className="category-count">{documents.length}</div>
                        </div>
                      </div>
                      <div className="category-card">
                        <div className="category-icon">
                          <i className="fas fa-flask"></i>
                        </div>
                        <div className="category-info">
                          <div className="category-name">Lab Results</div>
                          <div className="category-count">{documents.filter(doc => doc.type === 'lab_result').length}</div>
                        </div>
                      </div>
                      <div className="category-card">
                        <div className="category-icon">
                          <i className="fas fa-file-prescription"></i>
                        </div>
                        <div className="category-info">
                          <div className="category-name">Prescriptions</div>
                          <div className="category-count">{documents.filter(doc => doc.type === 'prescription').length}</div>
                        </div>
                      </div>
                      <div className="category-card">
                        <div className="category-icon">
                          <i className="fas fa-x-ray"></i>
                        </div>
                        <div className="category-info">
                          <div className="category-name">Imaging</div>
                          <div className="category-count">{documents.filter(doc => doc.type === 'imaging').length}</div>
                        </div>
                      </div>
                      <div className="category-card">
                        <div className="category-icon">
                          <i className="fas fa-file-alt"></i>
                        </div>
                        <div className="category-info">
                          <div className="category-name">Other</div>
                          <div className="category-count">{documents.filter(doc => doc.type === 'other').length}</div>
                        </div>
                      </div>
                    </div>
                    
                    {documents.length > 0 ? (
                      <div className="documents-grid">
                        {documents.map((document, index) => (
                          <div key={index} className="document-card">
                            <div className="document-preview">
                              {document.type === 'imaging' ? (
                                <img src={document.url} alt={document.title} className="document-thumbnail" />
                              ) : (
                                <div className="document-icon">
                                  <i className={`fas ${
                                    document.type === 'lab_result' ? 'fa-flask' : 
                                    document.type === 'prescription' ? 'fa-file-prescription' :
                                    document.type === 'insurance' ? 'fa-file-invoice-dollar' :
                                    'fa-file-alt'
                                  }`}></i>
                                </div>
                              )}
                            </div>
                            <div className="document-info">
                              <h3 className="document-title">{document.title}</h3>
                              <div className="document-meta">
                                <span className="document-date">
                                  <i className="fas fa-calendar-alt"></i>
                                  {new Date(document.date).toLocaleDateString()}
                                </span>
                                <span className="document-type">
                                  <i className="fas fa-tag"></i>
                                  {document.type.replace('_', ' ').charAt(0).toUpperCase() + document.type.replace('_', ' ').slice(1)}
                                </span>
                              </div>
                            </div>
                            <div className="document-actions">
                              <button className="view-document-btn">
                                <i className="fas fa-eye"></i>
                              </button>
                              <button className="download-document-btn">
                                <i className="fas fa-download"></i>
                              </button>
                              <button className="delete-document-btn">
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-documents">
                        <div className="empty-state">
                          <i className="fas fa-file-medical empty-icon"></i>
                          <h3>No documents uploaded yet</h3>
                          <p>Upload your medical documents to keep them organized and accessible.</p>
                          <button 
                            className="upload-first-document-btn"
                            onClick={() => setShowUploadDocumentModal(true)}
                          >
                            Upload Your First Document
                          </button>
                        </div>
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
                          <button 
                            className="write-review-btn"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                          >
                            <i className="fas fa-plus"></i> Write a Review
                            <i className="fas fa-chevron-down"></i>
                          </button>
                          {dropdownOpen && (
                            <div className="doctor-dropdown-menu" ref={dropdownRef}>
                              <div className="doctor-dropdown-header">
                                <h3>Select a doctor</h3>
                                <button 
                                  className="close-dropdown-btn"
                                  onClick={() => setDropdownOpen(false)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                              <div className="doctor-list">
                                {pastDoctors.length > 0 ? (
                                  pastDoctors.map(doctor => (
                                    <button 
                                      key={doctor.id} 
                                      className="doctor-item"
                                      onClick={() => {
                                        handleOpenReviewModal(doctor);
                                        setDropdownOpen(false);
                                      }}
                                    >
                                      <div className="doctor-avatar-small">
                                        {doctor.name.charAt(0)}
                                      </div>
                                      <div className="doctor-info-small">
                                        <span className="doctor-name">{doctor.name}</span>
                                        <span className="doctor-specialty">{doctor.specialty || doctor.specialization || "General Medicine"}</span>
                                      </div>
                                      <i className="fas fa-chevron-right doctor-select-arrow"></i>
                                    </button>
                                  ))
                                ) : (
                                  <div className="no-doctors-message">
                                    <i className="fas fa-user-md"></i>
                                    <p>No doctors to review</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
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
                  <p>{selectedDoctor.specialty || selectedDoctor.specialization || "General Medicine"}</p>
                  <p className="last-visit">
                    <i className="fas fa-calendar-check"></i> 
                    Last visit: {new Date(selectedDoctor.lastAppointmentDate || Date.now()).toLocaleDateString()}
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

      {/* Add Medication Modal */}
      {showAddMedicationModal && (
        <div className="modal-overlay">
          <div className="modal add-medication-modal">
            <div className="modal-header">
              <h3>Add New Medication</h3>
              <button 
                className="close-modal" 
                onClick={() => setShowAddMedicationModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <form className="medication-form">
                <div className="form-group">
                  <label htmlFor="medication-name">Medication Name</label>
                  <input 
                    type="text"
                    id="medication-name"
                    placeholder="Enter medication name"
                    value={medicationFormData.name}
                    onChange={(e) => setMedicationFormData({...medicationFormData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="medication-dosage">Dosage</label>
                    <input 
                      type="text"
                      id="medication-dosage"
                      placeholder="e.g., 500mg"
                      value={medicationFormData.dosage}
                      onChange={(e) => setMedicationFormData({...medicationFormData, dosage: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="medication-frequency">Frequency</label>
                    <input 
                      type="text"
                      id="medication-frequency"
                      placeholder="e.g., Once daily"
                      value={medicationFormData.frequency}
                      onChange={(e) => setMedicationFormData({...medicationFormData, frequency: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="medication-start-date">Start Date</label>
                    <input 
                      type="date"
                      id="medication-start-date"
                      value={medicationFormData.startDate}
                      onChange={(e) => setMedicationFormData({...medicationFormData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="medication-end-date">End Date (Optional)</label>
                    <input 
                      type="date"
                      id="medication-end-date"
                      value={medicationFormData.endDate}
                      onChange={(e) => setMedicationFormData({...medicationFormData, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="medication-notes">Notes (Optional)</label>
                  <textarea 
                    id="medication-notes"
                    placeholder="Enter any additional information about this medication"
                    value={medicationFormData.notes}
                    onChange={(e) => setMedicationFormData({...medicationFormData, notes: e.target.value})}
                  ></textarea>
                </div>
                <div className="form-group reminder-toggle-group">
                  <label className="toggle-label">
                    Set Reminders
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="medication-reminder"
                        checked={medicationFormData.reminder}
                        onChange={(e) => setMedicationFormData({...medicationFormData, reminder: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                  <p className="form-help-text">You'll receive notifications when it's time to take this medication</p>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowAddMedicationModal(false)}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={() => {
                  // Add logic to save medication
                  const newMedication = {...medicationFormData, id: Date.now()};
                  setMedications([...medications, newMedication]);
                  setShowAddMedicationModal(false);
                }}
              >
                Save Medication
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadDocumentModal && (
        <div className="modal-overlay">
          <div className="modal upload-document-modal">
            <div className="modal-header">
              <h3>Upload Document</h3>
              <button 
                className="close-modal" 
                onClick={() => setShowUploadDocumentModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <form className="document-upload-form">
                <div className="form-group">
                  <label htmlFor="document-title">Document Title</label>
                  <input 
                    type="text"
                    id="document-title"
                    placeholder="Enter document title"
                    value={documentFormData.title}
                    onChange={(e) => setDocumentFormData({...documentFormData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="document-type">Document Type</label>
                  <select 
                    id="document-type"
                    value={documentFormData.type}
                    onChange={(e) => setDocumentFormData({...documentFormData, type: e.target.value})}
                  >
                    <option value="lab_result">Lab Result</option>
                    <option value="prescription">Prescription</option>
                    <option value="imaging">Imaging Report</option>
                    <option value="insurance">Insurance Document</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="document-date">Document Date</label>
                  <input 
                    type="date"
                    id="document-date"
                    value={documentFormData.date}
                    onChange={(e) => setDocumentFormData({...documentFormData, date: e.target.value})}
                  />
                </div>
                <div className="form-group file-upload-group">
                  <label htmlFor="document-file">Upload File</label>
                  <div className="file-upload-area">
                    <input 
                      type="file"
                      id="document-file"
                      className="file-input"
                      onChange={(e) => setDocumentFormData({...documentFormData, file: e.target.files[0]})}
                    />
                    <div className="file-upload-placeholder">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Drag and drop files here or click to browse</p>
                      <span>Supported formats: PDF, JPG, PNG (max 10MB)</span>
                    </div>
                    {documentFormData.file && (
                      <div className="file-preview">
                        <i className="fas fa-file-alt"></i>
                        <span className="file-name">{documentFormData.file.name}</span>
                        <button 
                          className="remove-file"
                          onClick={() => setDocumentFormData({...documentFormData, file: null})}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowUploadDocumentModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`upload-btn ${isUploadingDocument ? 'loading' : ''}`}
                disabled={!documentFormData.title || !documentFormData.date || !documentFormData.file}
                onClick={() => {
                  // Add logic to upload document
                  setIsUploadingDocument(true);
                  setTimeout(() => {
                    const newDocument = {
                      id: Date.now(),
                      title: documentFormData.title,
                      type: documentFormData.type,
                      date: documentFormData.date,
                      url: URL.createObjectURL(documentFormData.file),
                      fileName: documentFormData.file.name,
                      uploadDate: new Date().toISOString()
                    };
                    setDocuments([...documents, newDocument]);
                    setIsUploadingDocument(false);
                    setShowUploadDocumentModal(false);
                  }, 1500);
                }}
              >
                {isUploadingDocument ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt"></i>
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard; 