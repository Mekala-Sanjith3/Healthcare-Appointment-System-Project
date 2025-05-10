import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../common/Table/table";
import { Card, CardHeader, CardTitle, CardContent } from "../../common/Card/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../common/Tabs/tabs";
import "../../../styles/pages/doctor/DoctorDashboard.css";
import "../../../styles/pages/doctor/PatientHistory.css";
import { Calendar, Clock, Users, FileText, Bell, Settings, LogOut, Brain, History, Star } from "lucide-react";
import { doctorApi, appointmentApi, medicalRecordsApi } from "../../../services/api";
import PatientHistory from "./PatientHistory";
import DoctorReviews from "./DoctorReviews";
import AddMedicalRecordModal from './AddMedicalRecordModal';
import PatientDetailsModal from './PatientDetailsModal';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [showNotifications, setShowNotifications] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [availability, setAvailability] = useState({});
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  
  // Reports state variables
  const [reports, setReports] = useState([]);
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    patientId: '',
    patientName: '',
    reportType: 'blood-test',
    reportDate: new Date().toISOString().split('T')[0],
    reportContent: '',
    status: 'PENDING'
  });
  const [reportFilter, setReportFilter] = useState({
    type: 'all',
    date: ''
  });
  
  const [isLoading, setIsLoading] = useState({
    appointments: false,
    availability: false,
    notifications: false,
    patients: false,
    reports: false,
    reviews: false
  });
  const [error, setError] = useState(null);
  const [doctor, setDoctor] = useState({
    id: "",
    name: "Dr.",
    email: "",
    specialization: ""
  });
  const [stats, setStats] = useState({
    totalAppointments: 24,
    availableHours: 6.5,
    totalPatients: 1234,
    reportsDue: 8
  });

  // For appointment details modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);

  // Add these state variables
  const [showAddMedicalRecordModal, setShowAddMedicalRecordModal] = useState(false);
  const [selectedPatientForRecord, setSelectedPatientForRecord] = useState(null);

  // Add this state variable
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
  const [selectedAppointmentForDetails, setSelectedAppointmentForDetails] = useState(null);

  const navigate = useNavigate();

  // Get doctor ID from localStorage
  useEffect(() => {
    // Retrieve the user data from localStorage
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) {
      // If no user data, redirect to login
      navigate('/doctor-login');
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      if (userData.role !== 'DOCTOR') {
        // If not a doctor, redirect to appropriate login
        navigate('/');
        return;
      }
      
      const doctorId = userData.id;
      
      // Fetch doctor profile with the ID
      const fetchDoctorProfile = async () => {
        try {
          const profile = await doctorApi.getDoctorProfile(doctorId);
          setDoctor(profile);
        } catch (err) {
          console.error("Failed to fetch doctor profile:", err);
          setError("Failed to load doctor profile. Please refresh the page.");
        }
      };

      fetchDoctorProfile();
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate('/doctor-login');
    }
  }, [navigate]);

  // Fetch doctor appointments
  useEffect(() => {
    if (!doctor.id) return; // Only fetch if we have doctor ID
    
    const fetchAppointments = async () => {
      setIsLoading(prev => ({ ...prev, appointments: true }));
      try {
        // Fetch appointments from the API
        const doctorAppointments = await appointmentApi.getAppointmentsByDoctorId(doctor.id);
        
        if (doctorAppointments && doctorAppointments.length > 0) {
          console.log("Fetched doctor appointments:", doctorAppointments);
          
          // Deduplicate appointments by ID
          const uniqueAppointmentsMap = new Map();
          doctorAppointments.forEach(appointment => {
            uniqueAppointmentsMap.set(appointment.id, appointment);
          });
          
          const uniqueAppointments = Array.from(uniqueAppointmentsMap.values());
          console.log(`Deduplicated ${doctorAppointments.length} appointments to ${uniqueAppointments.length}`);
          
          setAppointments(uniqueAppointments);
          
          // Store deduplicated appointments in localStorage to help with patient details modal
          localStorage.setItem('doctorAppointments', JSON.stringify(uniqueAppointments));
        } else {
          console.log("No appointments found for doctor ID:", doctor.id);
          // For demo purposes, check mock appointments directly if none found
          const allMockAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
          
          // Filter and deduplicate mock appointments
          const uniqueMockAppointmentsMap = new Map();
          allMockAppointments.forEach(app => {
            if (app.doctorId === doctor.id) {
              uniqueMockAppointmentsMap.set(app.id, app);
            }
          });
          
          const uniqueMockAppointments = Array.from(uniqueMockAppointmentsMap.values());
          
          if (uniqueMockAppointments.length > 0) {
            console.log("Found mock appointments for doctor:", uniqueMockAppointments);
            setAppointments(uniqueMockAppointments);
            localStorage.setItem('doctorAppointments', JSON.stringify(uniqueMockAppointments));
          }
        }
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        setError("Failed to load appointments. Please refresh the page.");
        
        // Fallback to mock data if API call fails
        const allMockAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
        
        // Filter and deduplicate mock appointments
        const uniqueMockAppointmentsMap = new Map();
        allMockAppointments.forEach(app => {
          if (app.doctorId === doctor.id) {
            uniqueMockAppointmentsMap.set(app.id, app);
          }
        });
        
        const uniqueMockAppointments = Array.from(uniqueMockAppointmentsMap.values());
        
        if (uniqueMockAppointments.length > 0) {
          console.log("Using mock appointments as fallback:", uniqueMockAppointments);
          setAppointments(uniqueMockAppointments);
          localStorage.setItem('doctorAppointments', JSON.stringify(uniqueMockAppointments));
        }
      } finally {
        setIsLoading(prev => ({ ...prev, appointments: false }));
      }
    };

    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab, doctor.id]);

  // Fetch doctor availability
  useEffect(() => {
    if (!doctor.id) return; // Only fetch if we have doctor ID
    
    const fetchAvailability = async () => {
      setIsLoading(prev => ({ ...prev, availability: true }));
      try {
        const result = await doctorApi.getDoctorAvailability(doctor.id);
        setAvailability(result);
      } catch (err) {
        console.error("Failed to fetch availability:", err);
        setError("Failed to load availability settings. Please refresh the page.");
      } finally {
        setIsLoading(prev => ({ ...prev, availability: false }));
      }
    };

    if (activeTab === 'availability') {
      fetchAvailability();
    }
  }, [activeTab, doctor.id]);

  // Fetch notifications
  useEffect(() => {
    if (!doctor.id) return; // Only fetch if we have doctor ID
    
    const fetchNotifications = async () => {
      setIsLoading(prev => ({ ...prev, notifications: true }));
      try {
        const result = await doctorApi.getDoctorNotifications(doctor.id);
        setNotifications(result);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setIsLoading(prev => ({ ...prev, notifications: false }));
      }
    };

    fetchNotifications();
    
    // Set up a notification polling interval (in a real app)
    const intervalId = setInterval(fetchNotifications, 60000); // Poll every minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, [doctor.id]);

  // Fetch doctor's patients
  useEffect(() => {
    if (!doctor.id) return; // Only fetch if we have doctor ID
    
    const fetchPatients = async () => {
      setIsLoading(prev => ({ ...prev, patients: true }));
      try {
        // Try to fetch the doctor's patients from the API
        const result = await doctorApi.getDoctorPatients(doctor.id);
        setPatients(result);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
        setError("Failed to load patients. Please refresh the page.");
      } finally {
        setIsLoading(prev => ({ ...prev, patients: false }));
      }
    };

    if (activeTab === 'patients') {
      fetchPatients();
    }
  }, [activeTab, doctor.id]);

  // Fetch doctor's reports
  useEffect(() => {
    if (!doctor.id) return; // Only fetch if we have doctor ID
    
    const fetchReports = async () => {
      setIsLoading(prev => ({ ...prev, reports: true }));
      try {
        // Try to fetch the doctor's reports from the API
        const result = await doctorApi.getDoctorReports(doctor.id);
        setReports(result);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Failed to load reports. Please refresh the page.");
      } finally {
        setIsLoading(prev => ({ ...prev, reports: false }));
      }
    };

    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, doctor.id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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

  const handleAvailabilityChange = async (day, field, value) => {
    const updatedAvailability = {
      ...availability,
      [day]: {
        ...availability[day],
        [field]: value
      }
    };
    
    setAvailability(updatedAvailability);
    
    try {
      await doctorApi.updateDoctorAvailability(doctor.id, updatedAvailability);
    } catch (err) {
      console.error("Failed to update availability:", err);
      setError("Failed to save availability changes. Please try again.");
      
      // Revert back to server state if update fails
      const result = await doctorApi.getDoctorAvailability(doctor.id);
      setAvailability(result);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, status) => {
    try {
      // Update appointment status through the API
      await appointmentApi.updateAppointmentStatus(appointmentId, status);
      
      // Update local state
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: status } 
            : appointment
        )
      );
    } catch (err) {
      console.error("Failed to update appointment status:", err);
      setError("Failed to update appointment status. Please try again.");
    }
  };

  const handleViewAppointmentDetails = (appointmentId) => {
    const appointment = appointments.find(app => app.id === appointmentId);
    setSelectedAppointment(appointment);
    setShowAppointmentDetailsModal(true);
  };

  const closeAppointmentDetailsModal = () => {
    setShowAppointmentDetailsModal(false);
    setSelectedAppointment(null);
  };

  const handleLogout = () => {
    // Clear auth tokens and user data
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    // Navigate to homepage
    navigate('/');
  };

  const handleViewPatientDetails = (appointmentId) => {
    console.log("Opening patient details for appointment:", appointmentId);
    setSelectedAppointmentForDetails(appointmentId);
    setShowPatientDetailsModal(true);
  };

  const handleViewPatientHistory = (patientId) => {
    // Switch to patient history tab and set the selected patient
    setActiveTab('patient-history');
    // In a real implementation, you would pass the patient ID to the PatientHistory component
    console.log("View patient history for ID:", patientId);
  };

  // Handle opening the new report form
  const handleOpenReportForm = () => {
    setReportFormData({
      patientId: '',
      patientName: '',
      reportType: 'blood-test',
      reportDate: new Date().toISOString().split('T')[0],
      reportContent: '',
      status: 'PENDING'
    });
    setShowNewReportModal(true);
  };

  // Handle input changes in the report form
  const handleReportFormChange = (e) => {
    const { name, value } = e.target;
    setReportFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If selecting a patient from dropdown, update patient name too
    if (name === 'patientId') {
      const selectedPatient = patients.find(p => p.id === value);
      if (selectedPatient) {
        setReportFormData(prev => ({
          ...prev,
          patientName: selectedPatient.name
        }));
      }
    }
  };

  // Handle report form submission
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    
    try {
      // Determine if this is a new report or an update
      if (reportFormData.id) {
        // Update existing report
        const result = await doctorApi.updateMedicalReport(reportFormData.id, reportFormData);
        
        // Update local state
        setReports(prev => 
          prev.map(report => 
            report.id === reportFormData.id ? result : report
          )
        );
      } else {
        // Create new report
        const newReport = {
          ...reportFormData,
          doctorId: doctor.id,
          doctorName: doctor.name,
          specialty: doctor.specialization
        };
        
        // Submit to API
        const result = await doctorApi.createMedicalReport(newReport);
        
        // Update local state
        setReports(prev => [...prev, result]);
        
        // Create a medical record entry for the patient to see in their dashboard
        const medicalRecordData = {
          patient_id: reportFormData.patientId,
          doctor_id: doctor.id,
          doctor_name: doctor.name,
          specialty: doctor.specialization,
          diagnosis: `${reportFormData.reportType.charAt(0).toUpperCase() + reportFormData.reportType.slice(1)} Report`,
          description: reportFormData.reportContent,
          prescription: "",
          treatment_plan: "",
          notes: `Report generated on ${reportFormData.reportDate}`,
          date: reportFormData.reportDate
        };
        
        try {
          await medicalRecordsApi.addMedicalRecord(medicalRecordData);
          console.log("Medical record created for patient:", reportFormData.patientId);
        } catch (recordError) {
          console.error("Failed to create medical record:", recordError);
        }
      }
      
      // Close modal
      setShowNewReportModal(false);
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error("Failed to save report:", err);
      setError("Failed to save report. Please try again.");
    }
  };

  // Handle filter change in reports section
  const handleReportFilterChange = (e) => {
    const { name, value } = e.target;
    setReportFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle report status update (complete/pending)
  const handleUpdateReportStatus = async (reportId, status) => {
    try {
      // Update report status through API
      await doctorApi.updateMedicalReport(reportId, { status });
      
      // Update local state
      setReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status } 
            : report
        )
      );
    } catch (err) {
      console.error("Failed to update report status:", err);
      setError("Failed to update report status. Please try again.");
    }
  };

  // Handle editing a report
  const handleEditReport = (reportId) => {
    // Find the report to edit
    const reportToEdit = reports.find(r => r.id === reportId);
    if (reportToEdit) {
      // Set form data to the report values
      setReportFormData({
        patientId: reportToEdit.patientId,
        patientName: reportToEdit.patientName,
        reportType: reportToEdit.reportType,
        reportDate: reportToEdit.reportDate || new Date().toISOString().split('T')[0],
        reportContent: reportToEdit.reportContent || '',
        status: reportToEdit.status,
        id: reportToEdit.id // Keep the same ID for update operation
      });
      setShowNewReportModal(true);
    }
  };

  // Add this function to handle creating a medical record for a patient
  const handleAddMedicalRecord = (appointment) => {
    setSelectedPatientForRecord(appointment);
    setShowAddMedicalRecordModal(true);
  };

  // Add this function to handle when a medical record is successfully added
  const handleMedicalRecordAdded = (record) => {
    // You can update any state as needed
    console.log('Medical record added:', record);
    
    // Update appointment status to completed
    const appointmentId = selectedPatientForRecord.id;
    handleUpdateAppointmentStatus(appointmentId, 'COMPLETED');
  };

  const closePatientDetailsModal = () => {
    setShowPatientDetailsModal(false);
    setSelectedAppointmentForDetails(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "appointments":
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointments.filter(
          appointment => appointment.appointmentDate === today
        );

        return (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <Calendar className="icon" />
                </div>
                <div className="stat-info">
                  <h3>Total Appointments</h3>
                  <div className="stat-value">{stats.totalAppointments}</div>
                  <div className="stat-change positive">↑ 12% vs last week</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock className="icon" />
                </div>
                <div className="stat-info">
                  <h3>Available Hours</h3>
                  <div className="stat-value">{stats.availableHours}</div>
                  <div className="stat-message">Hours remaining today</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Users className="icon" />
                </div>
                <div className="stat-info">
                  <h3>Total Patients</h3>
                  <div className="stat-value">{stats.totalPatients}</div>
                  <div className="stat-change positive">↑ 8% this month</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FileText className="icon" />
                </div>
                <div className="stat-info">
                  <h3>Reports Due</h3>
                  <div className="stat-value">{stats.reportsDue}</div>
                  <div className="stat-change">↑ 2 from yesterday</div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader className="flex justify-between">
                <CardTitle>Today's Appointments</CardTitle>
                <button className="export-btn">
                  <i className="fas fa-download"></i> Export Schedule
                </button>
              </CardHeader>
              <CardContent>
                {isLoading.appointments ? (
                  <div className="loading-indicator">Loading appointments...</div>
                ) : todayAppointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.appointmentTime}</TableCell>
                          <TableCell>{appointment.patientName}</TableCell>
                          <TableCell>{appointment.appointmentType}</TableCell>
                          <TableCell>
                            <span className={`status ${appointment.status.toLowerCase()}`}>
                              {appointment.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="action-buttons">
                              <button 
                                className="view-btn"
                                onClick={() => handleViewAppointmentDetails(appointment.id)}
                              >
                                View
                              </button>
                              {appointment.status === 'PENDING' && (
                                <>
                                  <button 
                                    className="confirm-btn"
                                    onClick={() => handleUpdateAppointmentStatus(appointment.id, 'CONFIRMED')}
                                  >
                                    Confirm
                                  </button>
                                  <button 
                                    className="cancel-btn"
                                    onClick={() => handleUpdateAppointmentStatus(appointment.id, 'CANCELLED')}
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              
                              {(appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED') && (
                                <>
                                  <button 
                                    className="record-btn"
                                    onClick={() => handleAddMedicalRecord(appointment)}
                                  >
                                    <i className="fas fa-file-medical"></i>
                                    Record
                                  </button>
                                  <button 
                                    className="patient-details-btn"
                                    onClick={() => handleViewPatientDetails(appointment.id)}
                                  >
                                    <i className="fas fa-user-md"></i>
                                    Patient Details
                                  </button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="no-appointments">No appointments scheduled for today</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading.appointments ? (
                  <div className="loading-indicator">Loading appointments...</div>
                ) : appointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments
                        .filter(appointment => appointment.appointmentDate >= today)
                        .sort((a, b) => {
                          // Sort by date first, then by time
                          const dateComparison = a.appointmentDate.localeCompare(b.appointmentDate);
                          if (dateComparison !== 0) return dateComparison;
                          return a.appointmentTime.localeCompare(b.appointmentTime);
                        })
                        .map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              {appointment.appointmentDate} {appointment.appointmentTime}
                            </TableCell>
                            <TableCell>{appointment.patientName}</TableCell>
                            <TableCell>{appointment.appointmentType}</TableCell>
                            <TableCell>
                              <span className={`status ${appointment.status.toLowerCase()}`}>
                                {appointment.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="action-buttons">
                                <button 
                                  className="view-btn"
                                  onClick={() => handleViewAppointmentDetails(appointment.id)}
                                >
                                  View
                                </button>
                                {appointment.status === 'PENDING' && (
                                  <>
                                    <button 
                                      className="confirm-btn"
                                      onClick={() => handleUpdateAppointmentStatus(appointment.id, 'CONFIRMED')}
                                    >
                                      Confirm
                                    </button>
                                    <button 
                                      className="cancel-btn"
                                      onClick={() => handleUpdateAppointmentStatus(appointment.id, 'CANCELLED')}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                                
                                {(appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED') && (
                                  <>
                                    <button 
                                      className="record-btn"
                                      onClick={() => handleAddMedicalRecord(appointment)}
                                    >
                                      <i className="fas fa-file-medical"></i>
                                      Record
                                    </button>
                                    <button 
                                      className="patient-details-btn"
                                      onClick={() => handleViewPatientDetails(appointment.id)}
                                    >
                                      <i className="fas fa-user-md"></i>
                                      Patient Details
                                    </button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="no-appointments">No upcoming appointments</div>
                )}
              </CardContent>
            </Card>
          </>
        );
      
      case 'availability':
        return (
          <div className="content-card">
            <div className="card-header">
              <h2>Manage Availability</h2>
              <button className="ai-suggest-btn">
                <Brain className="nav-icon" />
                AI Suggestions
              </button>
            </div>
            
            {isLoading.availability ? (
              <div className="loading-spinner">Loading availability settings...</div>
            ) : (
              <div className="availability-grid">
                {Object.entries(availability).map(([day, schedule]) => (
                  <div key={day} className="availability-card">
                    <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                    <div className="time-inputs">
                      <input 
                        type="time" 
                        value={schedule.start}
                        onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                      />
                      <span>to</span>
                      <input 
                        type="time" 
                        value={schedule.end}
                        onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                      />
                    </div>
                    <label className="availability-toggle">
                      <input
                        type="checkbox"
                        checked={schedule.isAvailable}
                        onChange={(e) => handleAvailabilityChange(day, 'isAvailable', e.target.checked)}
                      />
                      <span>Available</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'patient-history':
        return <PatientHistory />;

      case 'patients':
        return (
          <div className="content-card">
            <div className="card-header">
              <h2>My Patients</h2>
              <div className="search-filters">
                <input 
                  type="text" 
                  placeholder="Search patients by name or ID..." 
                  className="search-input"
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="patients-grid">
              {isLoading.patients ? (
                <div className="loading-spinner">Loading patients...</div>
              ) : ( 
                <div className="patients-list">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Age/Gender</th>
                        <th>Contact</th>
                        <th>Last Visit</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map(patient => (
                        <tr key={patient.id}>
                          <td>
                            <div className="patient-info">
                              <div className="patient-avatar">
                                {patient.name.charAt(0)}
                              </div>
                              <div className="patient-name">
                                {patient.name}
                                <span className="patient-id">{patient.id}</span>
                              </div>
                            </div>
                          </td>
                          <td>{patient.age} / {patient.gender}</td>
                          <td>
                            <div className="patient-contact">
                              <div>{patient.email}</div>
                              <div>{patient.phoneNumber}</div>
                            </div>
                          </td>
                          <td>
                            {patient.lastVisit || 'No visits yet'}
                          </td>
                          <td>
                            <span className={`status ${patient.status ? patient.status.toLowerCase() : 'active'}`}>
                              {patient.status || 'Active'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="view-btn" onClick={() => handleViewPatientDetails(patient.id)}>
                                View
                              </button>
                              <button className="history-btn" onClick={() => handleViewPatientHistory(patient.id)}>
                                History
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {patients.length === 0 && (
                    <div className="no-patients">
                      <p>No patients found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="content-card">
            <div className="card-header">
              <h2>Weekly Schedule</h2>
              <div className="schedule-controls">
                <button className="prev-week-btn">Previous Week</button>
                <div className="current-week">May 1 - May 7, 2023</div>
                <button className="next-week-btn">Next Week</button>
              </div>
            </div>
            
            <div className="weekly-schedule">
              <div className="time-slots">
                <div className="time-header">Time</div>
                {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map(time => (
                  <div className="time-slot" key={time}>{time}</div>
                ))}
              </div>
              
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                <div className="day-column" key={day}>
                  <div className="day-header">{day}</div>
                  <div className="day-appointments">
                    <div className="appointment-slot empty"></div>
                    <div className="appointment-slot">
                      <div className="appointment-card">
                        <div className="appointment-time">10:00 - 10:30</div>
                        <div className="appointment-patient">Jane Smith</div>
                        <div className="appointment-type">Check-up</div>
                      </div>
                    </div>
                    <div className="appointment-slot empty"></div>
                    <div className="appointment-slot">
                      <div className="appointment-card">
                        <div className="appointment-time">12:00 - 12:30</div>
                        <div className="appointment-patient">John Doe</div>
                        <div className="appointment-type">Consultation</div>
                      </div>
                    </div>
                    <div className="appointment-slot empty"></div>
                    <div className="appointment-slot empty"></div>
                    <div className="appointment-slot">
                      <div className="appointment-card">
                        <div className="appointment-time">3:00 - 4:00</div>
                        <div className="appointment-patient">Robert Johnson</div>
                        <div className="appointment-type">Follow-up</div>
                      </div>
                    </div>
                    <div className="appointment-slot empty"></div>
                    <div className="appointment-slot empty"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reports':
        // Filter reports based on the current filter settings
        const filteredReports = reports.filter(report => {
          const matchesType = reportFilter.type === 'all' || report.reportType === reportFilter.type;
          const matchesDate = !reportFilter.date || report.reportDate === reportFilter.date;
          return matchesType && matchesDate;
        });
        
        return (
          <div className="content-card">
            <div className="card-header">
              <h2>Medical Reports</h2>
              <div className="report-filters">
                <select 
                  className="report-type-filter"
                  name="type"
                  value={reportFilter.type}
                  onChange={handleReportFilterChange}
                >
                  <option value="all">All Types</option>
                  <option value="blood-test">Blood Tests</option>
                  <option value="imaging">Imaging</option>
                  <option value="consultation">Consultations</option>
                  <option value="vaccination">Vaccinations</option>
                  <option value="lab-results">Lab Results</option>
                </select>
                <input 
                  type="date" 
                  className="report-date-filter"
                  name="date"
                  value={reportFilter.date}
                  onChange={handleReportFilterChange}
                />
                <button 
                  className="generate-report-btn"
                  onClick={handleOpenReportForm}
                >
                  Generate New Report
                </button>
              </div>
            </div>
            
            <div className="reports-list">
              {isLoading.reports ? (
                <div className="loading-spinner">Loading reports...</div>
              ) : (
                <>
                  <table>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Report Type</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.length > 0 ? (
                        filteredReports.map(report => (
                          <tr key={report.id}>
                            <td>
                              <div className="patient-info">
                                <div className="patient-avatar">
                                  {report.patientName.charAt(0)}
                                </div>
                                <div className="patient-name">
                                  {report.patientName}
                                  <span className="patient-id">{report.patientId}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              {report.reportType === 'blood-test' && 'Blood Test'}
                              {report.reportType === 'imaging' && 'X-Ray Imaging'}
                              {report.reportType === 'consultation' && 'Consultation Report'}
                              {report.reportType === 'vaccination' && 'Vaccination Record'}
                              {report.reportType === 'lab-results' && 'Lab Results'}
                            </td>
                            <td>{report.reportDate}</td>
                            <td>
                              <span className={`status ${report.status === 'COMPLETED' ? 'confirmed' : 'pending'}`}>
                                {report.status}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                {report.status === 'COMPLETED' ? (
                                  <>
                                    <button className="view-btn">View</button>
                                    <button className="download-btn">Download</button>
                                  </>
                                ) : (
                                  <>
                                    <button 
                                      className="edit-btn"
                                      onClick={() => handleEditReport(report.id)}
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      className="complete-btn"
                                      onClick={() => handleUpdateReportStatus(report.id, 'COMPLETED')}
                                    >
                                      Complete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="no-data">
                            No reports found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
              )}
            </div>
            
            {/* New Report Modal */}
            {showNewReportModal && (
              <div className="modal-overlay">
                <div className="report-modal">
                  <h3>{reportFormData.id ? 'Edit Report' : 'Create New Report'}</h3>
                  <button className="close-modal" onClick={() => setShowNewReportModal(false)}>×</button>
                  
                  <form onSubmit={handleSubmitReport}>
                    <div className="form-group">
                      <label htmlFor="patientId">Patient</label>
                      <select 
                        id="patientId" 
                        name="patientId" 
                        value={reportFormData.patientId} 
                        onChange={handleReportFormChange}
                        required
                      >
                        <option value="">Select Patient</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="reportType">Report Type</label>
                      <select 
                        id="reportType" 
                        name="reportType" 
                        value={reportFormData.reportType} 
                        onChange={handleReportFormChange}
                        required
                      >
                        <option value="blood-test">Blood Test</option>
                        <option value="imaging">X-Ray Imaging</option>
                        <option value="consultation">Consultation Report</option>
                        <option value="vaccination">Vaccination Record</option>
                        <option value="lab-results">Lab Results</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="reportDate">Report Date</label>
                      <input 
                        type="date" 
                        id="reportDate" 
                        name="reportDate" 
                        value={reportFormData.reportDate} 
                        onChange={handleReportFormChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="reportContent">Report Content</label>
                      <textarea 
                        id="reportContent" 
                        name="reportContent" 
                        value={reportFormData.reportContent} 
                        onChange={handleReportFormChange}
                        rows="5"
                        placeholder="Enter detailed report information here..."
                        required
                      ></textarea>
                    </div>
                    
                    <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={() => setShowNewReportModal(false)}>Cancel</button>
                      <button type="submit" className="submit-btn">
                        {reportFormData.id ? 'Update Report' : 'Save Report'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case "reviews":
        return (
          <div className="reviews-tab">
            <Card>
              <CardHeader>
                <CardTitle>Patient Reviews & Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <DoctorReviews doctorId={doctor.id} />
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <i className="fas fa-heartbeat"></i>
          <span>HealthCare</span>
        </div>
        
        <div className="doctor-profile">
          <div className="profile-avatar">{doctor.name.charAt(doctor.name.indexOf(' ') + 1 || 0)}</div>
          <div className="profile-info">
            <h2>{doctor.name}</h2>
            <p>{doctor.specialization}</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => handleTabChange('appointments')}
          >
            <Calendar className="nav-icon" />
            <span>Appointments</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => handleTabChange('patients')}
          >
            <Users className="nav-icon" />
            <span>Patients</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'patient-history' ? 'active' : ''}`}
            onClick={() => handleTabChange('patient-history')}
          >
            <History className="nav-icon" />
            <span>Patient History</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => handleTabChange('reports')}
          >
            <FileText className="nav-icon" />
            <span>Reports</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => handleTabChange('reviews')}
          >
            <Star className="nav-icon" />
            <span>Reviews</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => handleTabChange('availability')}
          >
            <Clock className="nav-icon" />
            <span>Availability</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="nav-item">
            <Settings className="nav-icon" />
            <span>Settings</span>
          </button>
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Welcome back, {doctor.name}</h1>
            <p>Here's your practice overview</p>
          </div>
          
          <div className="header-actions">
            <div className="notifications-wrapper">
              <button 
                className="notification-icon" 
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="bell-icon" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="notification-badge">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notifications-panel">
                  <div className="notifications-header">
                    <h3>Notifications</h3>
                    <button className="mark-all-read">Mark all as read</button>
                  </div>
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <p className="no-notifications">No new notifications</p>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        >
                          <div className="notification-content">
                            <p>{notification.message}</p>
                            <span className="notification-time">{notification.time}</span>
                          </div>
                          <div className={`notification-type ${notification.type}`}>
                            {notification.type === 'appointment' ? (
                              <Calendar className="notification-icon" />
                            ) : (
                              <FileText className="notification-icon" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="doctor-profile">
              <div className="profile-avatar">{doctor.name.split(' ').map(n => n[0]).join('')}</div>
              <span className="doctor-name">{doctor.name}</span>
            </div>
          </div>
        </header>

        {/* Display error message if any */}
        {error && (
          <div className="error-notification">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {renderContent()}
      </main>

      {showAppointmentDetailsModal && (
        <div className="appointment-details-modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeAppointmentDetailsModal}>&times;</span>
            <h2>Appointment Details</h2>
            <p><strong>Patient:</strong> {selectedAppointment?.patientName}</p>
            <p><strong>Date:</strong> {selectedAppointment?.appointmentDate} {selectedAppointment?.appointmentTime}</p>
            <p><strong>Type:</strong> {selectedAppointment?.appointmentType}</p>
            <p><strong>Problem:</strong> {selectedAppointment?.problem}</p>
            <p><strong>Status:</strong> {selectedAppointment?.status}</p>
            <p><strong>Notes:</strong> {selectedAppointment?.notes}</p>
            {selectedAppointment?.status === 'PENDING' && (
              <div className="modal-actions">
                <button 
                  className="confirm-btn"
                  onClick={() => {
                    handleUpdateAppointmentStatus(selectedAppointment.id, 'CONFIRMED');
                    closeAppointmentDetailsModal();
                  }}
                >
                  Confirm Appointment
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    handleUpdateAppointmentStatus(selectedAppointment.id, 'CANCELLED');
                    closeAppointmentDetailsModal();
                  }}
                >
                  Cancel Appointment
                </button>
              </div>
            )}
            {/* Add a button to view detailed patient info */}
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button 
                className="view-patient-btn"
                onClick={() => {
                  handleViewPatientDetails(selectedAppointment.id);
                  closeAppointmentDetailsModal();
                }}
              >
                <i className="fas fa-user-md"></i> View Patient Medical Details
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddMedicalRecordModal && selectedPatientForRecord && (
        <AddMedicalRecordModal
          isOpen={showAddMedicalRecordModal}
          onClose={() => setShowAddMedicalRecordModal(false)}
          appointment={selectedPatientForRecord}
          onRecordAdded={handleMedicalRecordAdded}
        />
      )}

      {/* Add the patient details modal component */}
      {showPatientDetailsModal && (
        <PatientDetailsModal
          isOpen={showPatientDetailsModal}
          onClose={closePatientDetailsModal}
          appointmentId={selectedAppointmentForDetails}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;