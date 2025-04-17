import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import '../../../styles/pages/admin/AppointmentsList.css';

const AppointmentsList = ({ searchTerm, filters }) => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    patientName: '',
    patientEmail: '',
    doctorName: '',
    doctorSpecialization: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: '',
    status: '',
    notes: ''
  });
  
  const appointmentsPrintRef = useRef();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  // Mock data for appointments
  useEffect(() => {
    // In a real app, this would be fetched from an API
    const mockAppointments = [
      { 
        id: 1,
        patientId: "P10023",
        patientName: "Mekal Srujitha",
        patientEmail: "mekal@example.com",
        doctorId: "D0045",
        doctorName: "Dr. Sarah Johnson",
        doctorSpecialization: "Cardiology",
        appointmentDate: "2023-08-15",
        appointmentTime: "09:30 AM",
        appointmentType: "Consultation",
        status: "PENDING",
        notes: "Follow-up on recent test results"
      },
      { 
        id: 2,
        patientId: "P10045",
        patientName: "J Umesh Chandra",
        patientEmail: "umesh@example.com",
        doctorId: "D0032",
        doctorName: "Dr. Michael Chen",
        doctorSpecialization: "Dermatology",
        appointmentDate: "2023-08-16",
        appointmentTime: "11:00 AM",
        appointmentType: "Check-up",
        status: "PENDING",
        notes: "First consultation for skin condition"
      },
      { 
        id: 3,
        patientId: "P10056",
        patientName: "Mannava Ganesh",
        patientEmail: "ganesh@example.com",
        doctorId: "D0023",
        doctorName: "Dr. Emily Wilson",
        doctorSpecialization: "Neurology",
        appointmentDate: "2023-08-17",
        appointmentTime: "02:15 PM",
        appointmentType: "Test Results",
        status: "CONFIRMED",
        notes: "Discuss MRI results"
      },
      { 
        id: 4,
        patientId: "P10078",
        patientName: "Karthik Reddy",
        patientEmail: "karthik@example.com",
        doctorId: "D0045",
        doctorName: "Dr. Sarah Johnson",
        doctorSpecialization: "Cardiology",
        appointmentDate: "2023-08-18",
        appointmentTime: "10:45 AM",
        appointmentType: "Follow-up",
        status: "CANCELLED",
        notes: "Patient requested cancellation"
      },
      { 
        id: 5,
        patientId: "P10089",
        patientName: "Rahul Kumar",
        patientEmail: "rahul@example.com",
        doctorId: "D0032",
        doctorName: "Dr. Michael Chen",
        doctorSpecialization: "Dermatology",
        appointmentDate: "2023-08-19",
        appointmentTime: "03:30 PM",
        appointmentType: "Consultation",
        status: "CONFIRMED",
        notes: "Post-surgery evaluation"
      }
    ];
    
    setAppointments(mockAppointments);
    setFilteredAppointments(mockAppointments);
  }, []);

  // Filter appointments based on search term and filters
  useEffect(() => {
    let result = [...appointments];
    
    // Filter by search term
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        appointment => 
          appointment.patientName.toLowerCase().includes(lowercasedSearch) ||
          appointment.doctorName.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Filter by status
    if (filters.status && filters.status !== 'all') {
      result = result.filter(appointment => appointment.status === filters.status);
    }
    
    // Filter by date
    if (filters.date) {
      result = result.filter(appointment => appointment.appointmentDate === filters.date);
    }
    
    setFilteredAppointments(result);
  }, [appointments, searchTerm, filters]);

  // Handle viewing appointment details
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  // Edit appointment
  const handleEditAppointment = (appointment) => {
    setSelectedAppointment({...appointment});
    setEditFormData({
      patientName: appointment.patientName,
      patientId: appointment.patientId,
      patientEmail: appointment.patientEmail,
      doctorName: appointment.doctorName,
      doctorId: appointment.doctorId,
      doctorSpecialization: appointment.doctorSpecialization,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      appointmentType: appointment.appointmentType,
      status: appointment.status,
      notes: appointment.notes
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Save edited appointment
  const handleSaveEdit = () => {
    const updatedAppointment = {
      ...selectedAppointment,
      ...editFormData
    };
    
    // Update appointment in the list
    const updatedAppointments = appointments.map(app => 
      app.id === updatedAppointment.id ? updatedAppointment : app
    );
    
    setAppointments(updatedAppointments);
    
    // Update filtered appointments
    if (filteredAppointments) {
      const updatedFiltered = filteredAppointments.map(app => 
        app.id === updatedAppointment.id ? updatedAppointment : app
      );
      setFilteredAppointments(updatedFiltered);
    }
    
    setShowEditModal(false);
    showToast("Appointment updated successfully!");
  };

  // Handle delete appointment
  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setConfirmDelete(true);
  };

  const confirmDeleteAppointment = () => {
    const updatedAppointments = appointments.filter(
      appointment => appointment.id !== appointmentToDelete.id
    );
    
    setAppointments(updatedAppointments);
    setConfirmDelete(false);
    setAppointmentToDelete(null);
    
    // Show success toast message
    showToast("Appointment deleted successfully!");
  };

  // Setup print functionality
  const handlePrint = useReactToPrint({
    content: () => appointmentsPrintRef.current,
    documentTitle: "Appointments List",
    onAfterPrint: () => console.log("Print completed")
  });

  // Print appointment details
  const handlePrintAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // Get current date for the footer
    const currentDate = new Date().toLocaleDateString();
    
    // Create print-friendly content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Appointment Details - ${appointment.id}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .print-container {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              background-color: #fff;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 2px solid #4285f4;
            }
            .print-header h1 {
              color: #4285f4;
              margin: 0;
              font-size: 28px;
            }
            .print-header p {
              color: #666;
              margin: 5px 0 0;
              font-size: 14px;
            }
            .print-section {
              margin-bottom: 25px;
              padding-bottom: 15px;
              border-bottom: 1px solid #eee;
            }
            .print-section h2 {
              color: #4285f4;
              font-size: 18px;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .print-row {
              display: flex;
              margin-bottom: 10px;
            }
            .print-label {
              font-weight: bold;
              width: 180px;
              color: #555;
            }
            .print-value {
              flex: 1;
            }
            .print-status {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-weight: bold;
              text-transform: capitalize;
            }
            .print-status.scheduled {
              background-color: #e3f2fd;
              color: #1565c0;
            }
            .print-status.completed {
              background-color: #e8f5e9;
              color: #2e7d32;
            }
            .print-status.cancelled {
              background-color: #ffebee;
              color: #c62828;
            }
            .print-footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              .print-container {
                box-shadow: none;
                border: none;
              }
              .print-header {
                margin-bottom: 20px;
              }
              .print-header h1 {
                font-size: 20px;
              }
              .print-section h2 {
                font-size: 16px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <h1>Healthcare Appointment Details</h1>
              <p>Appointment ID: ${appointment.id}</p>
            </div>
            
            <div class="print-section">
              <h2>Patient Information</h2>
              <div class="print-row">
                <div class="print-label">Name:</div>
                <div class="print-value">${appointment.patientName}</div>
              </div>
              <div class="print-row">
                <div class="print-label">Patient ID:</div>
                <div class="print-value">${appointment.patientId || 'N/A'}</div>
              </div>
              <div class="print-row">
                <div class="print-label">Email:</div>
                <div class="print-value">${appointment.patientEmail || 'N/A'}</div>
              </div>
            </div>
            
            <div class="print-section">
              <h2>Doctor Information</h2>
              <div class="print-row">
                <div class="print-label">Name:</div>
                <div class="print-value">${appointment.doctorName}</div>
              </div>
              <div class="print-row">
                <div class="print-label">Specialization:</div>
                <div class="print-value">${appointment.doctorSpecialization || 'N/A'}</div>
              </div>
            </div>
            
            <div class="print-section">
              <h2>Appointment Details</h2>
              <div class="print-row">
                <div class="print-label">Date:</div>
                <div class="print-value">${appointment.appointmentDate}</div>
              </div>
              <div class="print-row">
                <div class="print-label">Time:</div>
                <div class="print-value">${appointment.appointmentTime}</div>
              </div>
              <div class="print-row">
                <div class="print-label">Type:</div>
                <div class="print-value">${appointment.appointmentType}</div>
              </div>
              <div class="print-row">
                <div class="print-label">Status:</div>
                <div class="print-value">
                  <span class="print-status ${appointment.status.toLowerCase()}">${appointment.status}</span>
                </div>
              </div>
              <div class="print-row">
                <div class="print-label">Notes:</div>
                <div class="print-value">${appointment.notes || 'No notes available'}</div>
              </div>
            </div>
            
            <div class="print-footer">
              <p>Printed on: ${currentDate}</p>
              <p>© ${new Date().getFullYear()} Healthcare Appointment System. All rights reserved.</p>
            </div>
          </div>
          
          <script>
            // Print the window contents after everything is loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
            
            // Close the window after printing
            window.onafterprint = function() {
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: '' });
  
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  // Format appointment status for display
  const formatStatus = (status) => {
    switch(status) {
      case "CONFIRMED":
        return <span className="status-badge confirmed">Confirmed</span>;
      case "PENDING":
        return <span className="status-badge pending">Pending</span>;
      case "CANCELLED":
        return <span className="status-badge cancelled">Cancelled</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  // Handle quick status change
  const handleQuickStatusChange = (id, newStatus) => {
    const updatedAppointments = appointments.map(appointment => {
      if (appointment.id === id) {
        return { ...appointment, status: newStatus };
      }
      return appointment;
    });
    
    setAppointments(updatedAppointments);
    showToast("Status updated successfully!");
  };

  return (
    <div className="appointments-list-container">
      <div className="appointments-actions">
        <button className="print-button" onClick={handlePrint}>
          <i className="fas fa-print"></i> Print Appointments
        </button>
      </div>
      
      <div className="appointments-table-container" ref={appointmentsPrintRef}>
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map(appointment => (
                <tr key={appointment.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar patient">
                        {appointment.patientName.charAt(0)}
                      </div>
                      <div className="user-details">
                        <span className="user-name">{appointment.patientName}</span>
                        <span className="user-id">{appointment.patientId}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar doctor">
                        {appointment.doctorName.split(' ')[1].charAt(0)}
                      </div>
                      <div className="user-details">
                        <span className="user-name">{appointment.doctorName}</span>
                        <span className="user-id">{appointment.doctorId}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="date-time">
                      <div className="date">{appointment.appointmentDate}</div>
                      <div className="time">{appointment.appointmentTime}</div>
                    </div>
                  </td>
                  <td>
                    <span className="appointment-type">{appointment.appointmentType}</span>
                  </td>
                  <td>
                    <div className="status-dropdown">
                      <div className="current-status">
                        {formatStatus(appointment.status)}
                        <i className="fas fa-chevron-down"></i>
                      </div>
                      <div className="status-options">
                        <div 
                          className={`status-option ${appointment.status === 'CONFIRMED' ? 'active' : ''}`}
                          onClick={() => handleQuickStatusChange(appointment.id, 'CONFIRMED')}
                        >
                          <span className="status-badge confirmed">Confirmed</span>
                        </div>
                        <div 
                          className={`status-option ${appointment.status === 'PENDING' ? 'active' : ''}`}
                          onClick={() => handleQuickStatusChange(appointment.id, 'PENDING')}
                        >
                          <span className="status-badge pending">Pending</span>
                        </div>
                        <div 
                          className={`status-option ${appointment.status === 'CANCELLED' ? 'active' : ''}`}
                          onClick={() => handleQuickStatusChange(appointment.id, 'CANCELLED')}
                        >
                          <span className="status-badge cancelled">Cancelled</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="actions">
                    <button 
                      className="action-button view" 
                      onClick={() => handleViewAppointment(appointment)}
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditAppointment(appointment)}
                      title="Edit Appointment"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="print-btn"
                      onClick={() => handlePrintAppointment(appointment)}
                      title="Print Appointment"
                    >
                      <i className="fas fa-print"></i>
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteClick(appointment)}
                      title="Cancel Appointment"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">No appointments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* View Appointment Modal */}
      {showViewModal && selectedAppointment && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Appointment Details</h2>
              <button className="close-button" onClick={() => setShowViewModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="appointment-detail">
                <div className="detail-section">
                  <h3>Patient Information</h3>
                  <p><strong>Name:</strong> {selectedAppointment.patientName}</p>
                  <p><strong>Email:</strong> {selectedAppointment.patientEmail}</p>
                  <p><strong>ID:</strong> {selectedAppointment.patientId}</p>
                </div>
                
                <div className="detail-section">
                  <h3>Doctor Information</h3>
                  <p><strong>Name:</strong> {selectedAppointment.doctorName}</p>
                  <p><strong>Specialization:</strong> {selectedAppointment.doctorSpecialization}</p>
                  <p><strong>ID:</strong> {selectedAppointment.doctorId}</p>
                </div>
                
                <div className="detail-section">
                  <h3>Appointment Information</h3>
                  <p><strong>Date:</strong> {selectedAppointment.appointmentDate}</p>
                  <p><strong>Time:</strong> {selectedAppointment.appointmentTime}</p>
                  <p><strong>Type:</strong> {selectedAppointment.appointmentType}</p>
                  <p><strong>Status:</strong> {formatStatus(selectedAppointment.status)}</p>
                  <p><strong>Notes:</strong> {selectedAppointment.notes}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="print-detail-button" 
                onClick={() => handlePrintAppointment(selectedAppointment)}
              >
                <i className="fas fa-print"></i> Print
              </button>
              <button className="close-button" onClick={() => setShowViewModal(false)}>Close</button>
              <button className="edit-button" onClick={() => {
                setShowViewModal(false);
                handleEditAppointment(selectedAppointment);
              }}>Edit</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Appointment Modal */}
      {showEditModal && (
        <div className="modal edit-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Appointment</h2>
              <button className="close-button" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form className="edit-form" onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}>
                <div className="form-group">
                  <label>Patient Name</label>
                  <input 
                    type="text" 
                    name="patientName" 
                    value={editFormData.patientName} 
                    readOnly 
                  />
                </div>
                
                <div className="form-group">
                  <label>Doctor Name</label>
                  <input 
                    type="text" 
                    name="doctorName" 
                    value={editFormData.doctorName} 
                    readOnly 
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input 
                      type="date" 
                      name="appointmentDate" 
                      value={editFormData.appointmentDate} 
                      onChange={handleEditInputChange} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Time</label>
                    <input 
                      type="time" 
                      name="appointmentTime" 
                      value={editFormData.appointmentTime.replace(' AM', '').replace(' PM', '')} 
                      onChange={(e) => {
                        const timeValue = e.target.value;
                        const hour = parseInt(timeValue.split(':')[0]);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const displayTime = `${timeValue} ${ampm}`;
                        handleEditInputChange({
                          target: { name: 'appointmentTime', value: displayTime }
                        });
                      }} 
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select 
                      name="appointmentType" 
                      value={editFormData.appointmentType} 
                      onChange={handleEditInputChange}
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Check-up">Check-up</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Test Results">Test Results</option>
                      <option value="Procedure">Procedure</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Status</label>
                    <select 
                      name="status" 
                      value={editFormData.status} 
                      onChange={handleEditInputChange}
                      className={`status-select ${editFormData.status.toLowerCase()}`}
                    >
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PENDING">Pending</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Notes</label>
                  <textarea 
                    name="notes" 
                    rows="3" 
                    value={editFormData.notes} 
                    onChange={handleEditInputChange}
                    placeholder="Add appointment notes here..."
                  ></textarea>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    <i className="fas fa-save"></i> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal for Delete */}
      {confirmDelete && (
        <div className="modal confirm-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="close-button" onClick={() => setConfirmDelete(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p className="confirm-message">
                Are you sure you want to delete the appointment for
                <strong> {appointmentToDelete.patientName}</strong> with 
                <strong> {appointmentToDelete.doctorName}</strong> on
                <strong> {appointmentToDelete.appointmentDate}</strong>?
              </p>
              <p className="warning-message">
                <i className="fas fa-exclamation-triangle"></i> This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button" 
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-button" 
                onClick={confirmDeleteAppointment}
              >
                <i className="fas fa-trash-alt"></i> Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast notification */}
      {toast.show && (
        <div className="toast-notification">
          <div className="toast-content">
            <i className="fas fa-check-circle"></i>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList; 