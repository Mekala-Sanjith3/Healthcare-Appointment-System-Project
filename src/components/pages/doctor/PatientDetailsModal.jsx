import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { appointmentApi, patientApi } from '../../../services/api';
import '../../../styles/pages/doctor/PatientDetailsModal.css';

const PatientDetailsModal = ({ isOpen, onClose, appointmentId }) => {
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching appointment with ID:", appointmentId);
        
        // Try to get appointment from API
        let appointmentData;
        try {
          appointmentData = await appointmentApi.getAppointmentById(appointmentId);
        } catch (apiError) {
          console.error("API request failed:", apiError);
          
          // Fallback: check in localStorage for the appointment data
          const allAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
          appointmentData = allAppointments.find(app => app.id === appointmentId);
          
          if (!appointmentData) {
            throw new Error("Appointment data not found");
          }
          console.log("Found appointment in localStorage:", appointmentData);
        }
        
        setAppointment(appointmentData);
        
        // Check if the appointment has patient details
        if (appointmentData.patientDetails) {
          console.log("Using patient details from appointment");
          setPatientDetails(appointmentData.patientDetails);
        } else {
          // If no details in appointment, try to fetch from patient profile
          try {
            console.log("Fetching patient data for ID:", appointmentData.patientId);
            const patientData = await patientApi.getPatientById(appointmentData.patientId);
            console.log("Patient data fetched:", patientData);
            
            setPatientDetails({
              age: patientData.age || '35',
              gender: patientData.gender || 'Male',
              bloodGroup: patientData.bloodGroup || 'O+',
              // Include additional fields from patient record if available
              allergyHistory: patientData.allergyHistory || 'None reported',
              currentMedications: patientData.currentMedications || 'None reported',
              pastMedicalHistory: patientData.pastMedicalHistory || 'None reported',
              vitalSigns: {
                height: patientData.height || '175',
                weight: patientData.weight || '70',
                temperature: patientData.temperature || '98.6°F',
                bloodPressure: patientData.bloodPressure || '120/80',
                pulse: patientData.pulse || '72',
                oxygenSaturation: patientData.oxygenSaturation || '98%'
              }
            });
          } catch (patientError) {
            console.error('Failed to fetch patient data:', patientError);
            
            // Use default values if patient fetching fails
            setPatientDetails({
              age: '40',
              gender: 'Not specified',
              bloodGroup: 'Not specified',
              allergyHistory: 'Not available',
              currentMedications: 'Not available',
              pastMedicalHistory: 'Not available',
              vitalSigns: {
                height: '',
                weight: '',
                temperature: '',
                bloodPressure: '',
                pulse: '',
                oxygenSaturation: ''
              }
            });
          }
        }
      } catch (err) {
        console.error('Error fetching appointment details:', err);
        setError('Failed to load appointment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && appointmentId) {
      fetchData();
    }
  }, [isOpen, appointmentId]);

  const generatePDF = () => {
    if (!appointment) {
      console.error("Cannot generate PDF: No appointment data");
      setError("Cannot generate PDF: Missing appointment data");
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(18);
      doc.setTextColor(0, 51, 102);
      doc.text('Patient Medical Record', 105, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('HealthCare Appointment System', 105, 22, { align: 'center' });
      
      // Add appointment info
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text('Appointment Information', 14, 35);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      const appointmentInfo = [
        ['Appointment Date', appointment.appointmentDate || 'N/A'],
        ['Appointment Time', appointment.appointmentTime || 'N/A'],
        ['Appointment Type', appointment.appointmentType || 'N/A'],
        ['Status', appointment.status || 'N/A'],
        ['Doctor', appointment.doctorName || 'N/A'],
        ['Specialization', appointment.doctorSpecialization || 'N/A']
      ];
      
      doc.autoTable({
        startY: 40,
        head: [['Field', 'Value']],
        body: appointmentInfo,
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 204], textColor: 255 },
        styles: { fontSize: 10 }
      });
      
      // Add patient info
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text('Patient Information', 14, doc.autoTable.previous.finalY + 10);
      
      const patientInfo = [
        ['Patient Name', appointment.patientName || 'N/A'],
        ['Age', patientDetails?.age || 'N/A'],
        ['Gender', patientDetails?.gender || 'N/A'],
        ['Blood Group', patientDetails?.bloodGroup || 'N/A']
      ];
      
      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 15,
        head: [['Field', 'Value']],
        body: patientInfo,
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 204], textColor: 255 },
        styles: { fontSize: 10 }
      });
      
      // Add vital signs if available
      if (patientDetails?.vitalSigns) {
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204);
        doc.text('Vital Signs', 14, doc.autoTable.previous.finalY + 10);
        
        const vitalSigns = [
          ['Height', patientDetails.vitalSigns.height ? `${patientDetails.vitalSigns.height} cm` : 'N/A'],
          ['Weight', patientDetails.vitalSigns.weight ? `${patientDetails.vitalSigns.weight} kg` : 'N/A'],
          ['Temperature', patientDetails.vitalSigns.temperature || 'N/A'],
          ['Blood Pressure', patientDetails.vitalSigns.bloodPressure || 'N/A'],
          ['Pulse', patientDetails.vitalSigns.pulse || 'N/A'],
          ['Oxygen Saturation', patientDetails.vitalSigns.oxygenSaturation || 'N/A'],
        ];
        
        doc.autoTable({
          startY: doc.autoTable.previous.finalY + 15,
          head: [['Field', 'Value']],
          body: vitalSigns,
          theme: 'grid',
          headStyles: { fillColor: [0, 102, 204], textColor: 255 },
          styles: { fontSize: 10 }
        });
      }
      
      // Add medical history if available
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text('Medical Information', 14, doc.autoTable.previous.finalY + 10);
      
      const medicalInfo = [];
      
      if (appointment.problem) {
        medicalInfo.push(['Chief Complaint', appointment.problem]);
      }
      
      if (patientDetails?.allergyHistory) {
        medicalInfo.push(['Allergies', patientDetails.allergyHistory]);
      }
      
      if (patientDetails?.currentMedications) {
        medicalInfo.push(['Current Medications', patientDetails.currentMedications]);
      }
      
      if (patientDetails?.pastMedicalHistory) {
        medicalInfo.push(['Past Medical History', patientDetails.pastMedicalHistory]);
      }
      
      if (appointment.notes) {
        medicalInfo.push(['Additional Notes', appointment.notes]);
      }
      
      if (medicalInfo.length === 0) {
        medicalInfo.push(['Information', 'No detailed medical information available']);
      }
      
      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 15,
        head: [['Field', 'Value']],
        body: medicalInfo,
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 204], textColor: 255 },
        styles: { fontSize: 10 }
      });
      
      // Add footer with date
      const date = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated on: ${date}`, 14, 280);
      doc.text('HealthCare Appointment System - CONFIDENTIAL MEDICAL RECORD', 105, 287, { align: 'center' });
      
      // Save the PDF
      const patientName = appointment.patientName ? appointment.patientName.replace(/\s+/g, '_') : 'patient';
      doc.save(`patient_details_${patientName}.pdf`);
      
      console.log("PDF generated and downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="patient-details-modal-overlay">
      <div className="patient-details-modal">
        <div className="modal-header">
          <h2>Patient Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i> Loading patient details...
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : !appointment ? (
            <div className="error-message">No appointment data found</div>
          ) : (
            <>
              <section className="details-section">
                <h3>Appointment Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Date & Time:</span>
                    <span className="detail-value">{appointment?.appointmentDate} {appointment?.appointmentTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{appointment?.appointmentType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value status-badge ${appointment?.status?.toLowerCase()}`}>
                      {appointment?.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Chief Complaint:</span>
                    <span className="detail-value">{appointment?.problem || 'None specified'}</span>
                  </div>
                </div>
              </section>
              
              <section className="details-section">
                <h3>Patient Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{appointment?.patientName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Age:</span>
                    <span className="detail-value">{patientDetails?.age || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Gender:</span>
                    <span className="detail-value">{patientDetails?.gender || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Blood Group:</span>
                    <span className="detail-value">{patientDetails?.bloodGroup || 'N/A'}</span>
                  </div>
                </div>
              </section>
              
              {patientDetails?.vitalSigns && (
                Object.values(patientDetails.vitalSigns).some(value => value) && (
                  <section className="details-section">
                    <h3>Vital Signs</h3>
                    <div className="detail-grid">
                      {patientDetails.vitalSigns.height && (
                        <div className="detail-item">
                          <span className="detail-label">Height:</span>
                          <span className="detail-value">{patientDetails.vitalSigns.height} cm</span>
                        </div>
                      )}
                      {patientDetails.vitalSigns.weight && (
                        <div className="detail-item">
                          <span className="detail-label">Weight:</span>
                          <span className="detail-value">{patientDetails.vitalSigns.weight} kg</span>
                        </div>
                      )}
                      {patientDetails.vitalSigns.temperature && (
                        <div className="detail-item">
                          <span className="detail-label">Temperature:</span>
                          <span className="detail-value">{patientDetails.vitalSigns.temperature}</span>
                        </div>
                      )}
                      {patientDetails.vitalSigns.bloodPressure && (
                        <div className="detail-item">
                          <span className="detail-label">Blood Pressure:</span>
                          <span className="detail-value">{patientDetails.vitalSigns.bloodPressure}</span>
                        </div>
                      )}
                      {patientDetails.vitalSigns.pulse && (
                        <div className="detail-item">
                          <span className="detail-label">Pulse:</span>
                          <span className="detail-value">{patientDetails.vitalSigns.pulse}</span>
                        </div>
                      )}
                      {patientDetails.vitalSigns.oxygenSaturation && (
                        <div className="detail-item">
                          <span className="detail-label">O2 Saturation:</span>
                          <span className="detail-value">{patientDetails.vitalSigns.oxygenSaturation}</span>
                        </div>
                      )}
                    </div>
                  </section>
                )
              )}
              
              <section className="details-section">
                <h3>Medical History</h3>
                <div className="detail-list">
                  {patientDetails?.allergyHistory && (
                    <div className="detail-item fullwidth">
                      <span className="detail-label">Allergies:</span>
                      <span className="detail-value">{patientDetails.allergyHistory}</span>
                    </div>
                  )}
                  {patientDetails?.currentMedications && (
                    <div className="detail-item fullwidth">
                      <span className="detail-label">Current Medications:</span>
                      <span className="detail-value">{patientDetails.currentMedications}</span>
                    </div>
                  )}
                  {patientDetails?.pastMedicalHistory && (
                    <div className="detail-item fullwidth">
                      <span className="detail-label">Past Medical History:</span>
                      <span className="detail-value">{patientDetails.pastMedicalHistory}</span>
                    </div>
                  )}
                  {appointment?.notes && (
                    <div className="detail-item fullwidth">
                      <span className="detail-label">Additional Notes:</span>
                      <span className="detail-value">{appointment.notes}</span>
                    </div>
                  )}
                  
                  {!patientDetails?.allergyHistory && !patientDetails?.currentMedications && 
                   !patientDetails?.pastMedicalHistory && !appointment?.notes && (
                    <div className="detail-item fullwidth">
                      <span className="detail-value no-data">No detailed medical history available</span>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="download-pdf-button"
            onClick={generatePDF}
            disabled={loading || !!error || !appointment}
          >
            <i className="fas fa-file-pdf"></i> Download as PDF
          </button>
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal; 