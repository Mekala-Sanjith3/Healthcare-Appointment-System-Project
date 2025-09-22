import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { adminApi } from '../../../services/realtimeApi';
import '../../../styles/pages/admin/AppointmentsList.css';

const AppointmentsList = ({ searchTerm, filters, refreshTrigger }) => {
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
  
  const appointmentsPrintRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add new state for doctor and patient filtering
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');

  // Normalize various time formats (e.g., "150", "15:00", "03:00 PM", {hour, minute}) to HH:mm for <input type="time">
  const normalizeTimeToHHMM = (value) => {
    if (!value && value !== 0) return '';
    // Object form { hour, minute }
    if (typeof value === 'object') {
      const hour = value.hour ?? value.Hours ?? value.hours;
      const minute = value.minute ?? value.Minutes ?? value.minutes ?? 0;
      if (hour == null) return '';
      return `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
    }
    // Numeric like 150 or 930
    if (typeof value === 'number') {
      const s = String(value).padStart(4,'0');
      return `${s.slice(0,2)}:${s.slice(2,4)}`;
    }
    // String variants
    if (typeof value === 'string') {
      const trimmed = value.trim();
      // Already HH:mm
      const hhmm = trimmed.match(/^\d{1,2}:\d{2}$/);
      if (hhmm) {
        const [h, m] = trimmed.split(':');
        return `${String(h).padStart(2,'0')}:${m}`;
      }
      // With AM/PM
      const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (ampmMatch) {
        let h = parseInt(ampmMatch[1], 10);
        const m = ampmMatch[2];
        const mer = ampmMatch[3].toUpperCase();
        if (mer === 'PM' && h < 12) h += 12;
        if (mer === 'AM' && h === 12) h = 0;
        return `${String(h).padStart(2,'0')}:${m}`;
      }
      // Plain number string like "150" → "01:50"
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length === 3 || digits.length === 4) {
        const s = digits.padStart(4,'0');
        return `${s.slice(0,2)}:${s.slice(2,4)}`;
      }
    }
    return '';
  };

  // Fetch appointments from API (hoisted so other effects can reuse)
  const fetchAppointments = useCallback(async (serverFilters = false) => {
      try {
        setLoading(true);
        const apiParams = {};
        if (serverFilters) {
          // Push UI selections to backend for authoritative filtering
          if (filters?.status && !['all','all status'].includes(String(filters.status).trim().toLowerCase())) {
            apiParams.status = String(filters.status).toUpperCase();
          }
          if (filters?.date && /\d/.test(String(filters.date))) {
            apiParams.date = String(filters.date);
          }
          if (searchTerm && searchTerm.trim()) {
            apiParams.search = searchTerm.trim();
          }
        }
        const data = await adminApi.getAllAppointments(apiParams);
        setAppointments(data);
        setFilteredAppointments(data);
        
        // Extract unique doctors and patients for filtering
        const uniqueDoctors = [...new Set(data.map(app => app.doctorName))].sort();
        const uniquePatients = [...new Set(data.map(app => app.patientName))].sort();
        
        setDoctors(uniqueDoctors);
        setPatients(uniquePatients);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        showToast('Failed to load appointments');
      } finally {
        setLoading(false);
      }
  }, [filters, searchTerm]);

  useEffect(() => {
    // First load without filters; later filter effect may trigger server filters
    fetchAppointments(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  // Filter appointments based on search term, filters, selected doctor and patient
  useEffect(() => {
    let result = [...appointments];
    
    const normalizeDateForCompare = (value) => {
      if (!value) return '';
      if (value instanceof Date) {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      const s = String(value).trim();
      // yyyy-MM-dd
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      // dd-MM-yyyy
      const dmy = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
      if (dmy) {
        const [, d, mo, y] = dmy;
        return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      }
      // yyyy/MM/dd or dd/MM/yyyy
      const parts = s.split(/[\/.]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
        }
        if (parts[2].length === 4) {
          return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
        }
      }
      // yyyymmdd numeric
      const digits = s.replace(/\D/g, '');
      if (digits.length === 8) {
        return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}`;
      }
      return s;
    };
    
    // Filter by search term (case insensitive)
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        appointment => 
          appointment.patientName.toLowerCase().includes(lowercasedSearch) ||
          appointment.doctorName.toLowerCase().includes(lowercasedSearch) ||
          appointment.patientId?.toLowerCase().includes(lowercasedSearch) ||
          appointment.doctorId?.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Filter by selected doctor
    if (selectedDoctor) {
      result = result.filter(appointment => appointment.doctorName === selectedDoctor);
    }
    
    // Filter by selected patient
    if (selectedPatient) {
      result = result.filter(appointment => appointment.patientName === selectedPatient);
    }
    
    // Filter by status (case-insensitive), ignore placeholders like 'All Status'
    if (filters.status) {
      const statusVal = String(filters.status).trim().toLowerCase();
      if (statusVal !== 'all' && statusVal !== 'all status') {
        const wanted = statusVal.toUpperCase();
        result = result.filter(appointment => String(appointment.status ?? '').trim().toUpperCase() === wanted);
      }
    }
    
    // Filter by date
    if (filters.date) {
      const raw = String(filters.date).trim();
      // Ignore placeholders like 'dd-mm-yyyy'
      const isPlaceholder = /^d{2}-m{2}-y{4}$/i.test(raw) || raw.toLowerCase() === 'dd-mm-yyyy';
      if (!isPlaceholder && /\d/.test(raw)) {
        const target = normalizeDateForCompare(raw);
        result = result.filter(appointment => normalizeDateForCompare(appointment.appointmentDate) === target);
      }
    }
    
    setFilteredAppointments(result);
    // Also fetch from server when filters are meaningful to ensure DB authoritative results
    const statusVal = String(filters.status || '').trim().toLowerCase();
    const hasStatus = statusVal && !['all','all status'].includes(statusVal);
    const hasDate = filters.date && /\d/.test(String(filters.date));
    const hasSearch = searchTerm && searchTerm.trim();
    if (hasStatus || hasDate || hasSearch) {
      fetchAppointments(true);
    }
  }, [appointments, searchTerm, filters, selectedDoctor, selectedPatient, fetchAppointments]);

  // Handle doctor selection change
  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);
    // Clear patient selection when doctor is selected
    if (e.target.value) {
      setSelectedPatient('');
    }
  };

  // Handle patient selection change
  const handlePatientChange = (e) => {
    setSelectedPatient(e.target.value);
    // Clear doctor selection when patient is selected
    if (e.target.value) {
      setSelectedDoctor('');
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedDoctor('');
    setSelectedPatient('');
    setFilteredAppointments(appointments);
  };

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
  const handleSaveEdit = async () => {
    try {
      // Normalize date/time for backend (LocalDate, LocalTime)
      const normalizeDate = (value) => {
        if (!value) return '';
        if (value instanceof Date) {
          const y = value.getFullYear();
          const m = String(value.getMonth() + 1).padStart(2, '0');
          const d = String(value.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
        const s = String(value);
        // Accept dd-mm-yyyy or yyyy/mm/dd etc., coerce to yyyy-MM-dd
        const match = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);
        if (match) {
          const [, y, mo, da] = match;
          return `${y}-${mo.padStart(2,'0')}-${da.padStart(2,'0')}`;
        }
        // If already yyyy-MM-dd just return
        return s;
      };

      const hhmm = normalizeTimeToHHMM(editFormData.appointmentTime);
      const normalizedTime = hhmm ? `${hhmm}:00` : '';

      const updatedAppointment = {
        ...selectedAppointment,
        ...editFormData,
        appointmentDate: normalizeDate(editFormData.appointmentDate),
        appointmentTime: normalizedTime
      };
      
      // Update appointment via API
      await adminApi.updateAppointment(selectedAppointment.id, updatedAppointment);
      
      // Refresh appointments list
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
    } catch (error) {
      console.error('Error updating appointment:', error);
      showToast('Failed to update appointment');
    }
  };

  // Handle delete appointment
  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setConfirmDelete(true);
  };

  const confirmDeleteAppointment = async () => {
    try {
      // Delete appointment via API
      await adminApi.deleteAppointment(appointmentToDelete.id);
      
      const updatedAppointments = appointments.filter(
        appointment => appointment.id !== appointmentToDelete.id
      );
      
      setAppointments(updatedAppointments);
      setFilteredAppointments(filteredAppointments.filter(
        appointment => appointment.id !== appointmentToDelete.id
      ));
      setConfirmDelete(false);
      setAppointmentToDelete(null);
      
      // Show success toast message
      showToast("Appointment deleted successfully!");
    } catch (error) {
      console.error('Error deleting appointment:', error);
      showToast('Failed to delete appointment');
    }
  };

  // Setup print functionality
  const handlePrint = useReactToPrint({
    content: () => appointmentsPrintRef.current,
    // Pass contentRef to satisfy newer react-to-print versions
    contentRef: appointmentsPrintRef,
    documentTitle: `Healthcare_Appointments_List${selectedDoctor ? `_Doctor_${selectedDoctor.replace(/\s+/g, '_')}` : ''}${selectedPatient ? `_Patient_${selectedPatient.replace(/\s+/g, '_')}` : ''}`,
    pageStyle: `
      @page {
        size: landscape;
        margin: 10mm;
      }
      @media print {
        .no-print {
          display: none !important;
        }
        .print-only {
          display: block !important;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 8px;
          border: 1px solid #ddd;
          font-size: 11px;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .filter-print-summary {
          margin-bottom: 20px;
          padding: 10px;
          border: 1px solid #ddd;
          background-color: #f9f9f9;
        }
        .filter-print-summary h3 {
          margin-top: 0;
          margin-bottom: 10px;
        }
        .appointments-table {
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
      }
    `,
    onBeforeGetContent: () => {
      // Add a title to the print content if filtering is active
      const printTitle = document.createElement('h2');
      printTitle.className = 'print-title';
      
      let title = 'Healthcare Appointments';
      if (selectedDoctor) title += ` - Doctor: ${selectedDoctor}`;
      if (selectedPatient) title += ` - Patient: ${selectedPatient}`;
      
      printTitle.textContent = title;
      
      // Insert the title at the beginning of the print content
      if (!appointmentsPrintRef.current.querySelector('.print-title')) {
        appointmentsPrintRef.current.insertBefore(printTitle, appointmentsPrintRef.current.firstChild);
      }
    },
    onAfterPrint: () => {
      console.log("Print completed");
      // Remove the title after printing
      const printTitle = appointmentsPrintRef.current.querySelector('.print-title');
      if (printTitle) {
        appointmentsPrintRef.current.removeChild(printTitle);
      }
    }
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
  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      // Find the appointment to update
      const appointmentToUpdate = appointments.find(appointment => appointment.id === id);
      if (!appointmentToUpdate) return;
      
      const updatedAppointment = { ...appointmentToUpdate, status: newStatus };
      
      // Update via API
      await adminApi.updateAppointment(id, updatedAppointment);
      
      // Update local state
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === id ? updatedAppointment : appointment
      );
      
      setAppointments(updatedAppointments);
      setFilteredAppointments(filteredAppointments.map(appointment => 
        appointment.id === id ? updatedAppointment : appointment
      ));
      
      showToast(`Appointment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      showToast('Failed to update appointment status');
    }
  };

  return (
    <div className="appointments-list-container">
      {/* Add filtering options */}
      <div className="appointments-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="doctor-filter">Filter by Doctor:</label>
            <select
              id="doctor-filter"
              value={selectedDoctor}
              onChange={handleDoctorChange}
              className="filter-select"
            >
              <option value="">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor} value={doctor}>{doctor}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="patient-filter">Filter by Patient:</label>
            <select
              id="patient-filter"
              value={selectedPatient}
              onChange={handlePatientChange}
              className="filter-select"
            >
              <option value="">All Patients</option>
              {patients.map(patient => (
                <option key={patient} value={patient}>{patient}</option>
              ))}
            </select>
          </div>
          
          <button className="reset-filters-btn" onClick={handleResetFilters}>
            <i className="fas fa-undo"></i> Reset Filters
          </button>
        </div>
        
        <div className="filter-summary">
          {selectedDoctor && (
            <div className="active-filter">
              <span>Doctor: <strong>{selectedDoctor}</strong></span>
              <button onClick={() => setSelectedDoctor('')}><i className="fas fa-times"></i></button>
            </div>
          )}
          
          {selectedPatient && (
            <div className="active-filter">
              <span>Patient: <strong>{selectedPatient}</strong></span>
              <button onClick={() => setSelectedPatient('')}><i className="fas fa-times"></i></button>
            </div>
          )}
          
          {filteredAppointments.length > 0 && (
            <div className="results-count">
              Showing <strong>{filteredAppointments.length}</strong> appointment{filteredAppointments.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
      
      <div ref={appointmentsPrintRef} className="appointments-list print-container">
        {/* Include filter summary in printable area */}
        <div className="print-only filter-print-summary">
          <h3>Filter Summary</h3>
          {selectedDoctor && <p>Doctor: <strong>{selectedDoctor}</strong></p>}
          {selectedPatient && <p>Patient: <strong>{selectedPatient}</strong></p>}
          {filters.status && filters.status !== 'all' && <p>Status: <strong>{filters.status}</strong></p>}
          {filters.date && <p>Date: <strong>{filters.date}</strong></p>}
          <p>Total Appointments: <strong>{filteredAppointments.length}</strong></p>
          <p>Generated on: <strong>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</strong></p>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading appointments...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Status</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(appointment => (
                <tr key={appointment.id} className="appointment-row">
                  <td>{appointment.id}</td>
                  <td className="patient-info">
                    <div>{appointment.patientName}</div>
                    <span className="patient-email">{appointment.patientEmail}</span>
                  </td>
                  <td className="doctor-info">
                    <div>{appointment.doctorName}</div>
                    <span className="doctor-specialization">{appointment.doctorSpecialization}</span>
                  </td>
                  <td className="appointment-datetime">
                    <div>{appointment.appointmentDate}</div>
                    <span className="appointment-time">{appointment.appointmentTime}</span>
                  </td>
                  <td>{appointment.appointmentType}</td>
                  <td>{formatStatus(appointment.status)}</td>
                  <td className="actions-cell">
                    <div className="quick-status-update">
                      <select 
                        value={appointment.status}
                        onChange={(e) => handleQuickStatusChange(appointment.id, e.target.value)}
                        className={`status-select status-${appointment.status.toLowerCase()}`}
                      >
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PENDING">Pending</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <button 
                      className="view-btn"
                      onClick={() => handleViewAppointment(appointment)}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditAppointment(appointment)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteClick(appointment)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                    <button 
                      className="print-btn"
                      onClick={() => handlePrintAppointment(appointment)}
                    >
                      <i className="fas fa-print"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-appointments">
            <i className="fas fa-calendar-times"></i>
            <h3>No appointments found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="appointments-actions">
        <button className="print-all-btn" onClick={handlePrint}>
          <i className="fas fa-print"></i> 
          {selectedDoctor ? `Print Appointments for Dr. ${selectedDoctor}` : 
            selectedPatient ? `Print Appointments for Patient ${selectedPatient}` : 
            `Print ${filteredAppointments.length} Appointment${filteredAppointments.length !== 1 ? 's' : ''}`}
        </button>
        
        {/* Add a download as PDF option */}
        <button 
          className="export-pdf-btn" 
          onClick={handlePrint}
          title="Export as PDF (same as print, but save as PDF)"
        >
          <i className="fas fa-file-pdf"></i> Export as PDF
        </button>
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
                    value={normalizeTimeToHHMM(editFormData.appointmentTime)} 
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