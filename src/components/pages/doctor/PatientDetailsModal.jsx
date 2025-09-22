import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { patientApi, adminApi } from '../../../services/realtimeApi';
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
        
        // Get appointment by ID or accept a full appointment object
        let appointmentData = (typeof appointmentId === 'object' && appointmentId !== null) ? appointmentId : undefined;
        if (!appointmentData) {
          try {
            // Try doctor-scoped appointments first to avoid admin auth
            const user = JSON.parse(localStorage.getItem('userData') || '{}');
            let all = [];
            if (user?.id) {
              try {
                const docApps = await (await import('../../../services/realtimeApi')).appointmentApi.getAppointmentsByDoctorId(user.id);
                if (Array.isArray(docApps)) all = docApps;
              } catch {}
            }
            if (!all || all.length === 0) {
              // Fallback to admin endpoint (requires ADMIN token)
              all = await adminApi.getAllAppointments();
            }
            appointmentData = (all || []).find(app => String(app.id) === String(appointmentId));
          } catch (apiError) {
            console.error('API request failed:', apiError);
          }
        }
        if (!appointmentData) {
          throw new Error('Appointment data not found');
        }
        // Normalize possible LocalDate/LocalTime array values
        const normalizeDate = (d) => {
          if (!d) return '';
          if (Array.isArray(d)) {
            const [y,m,day] = d; return `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          }
          return String(d);
        };
        const normalizeTime = (t) => {
          if (!t) return '';
          if (Array.isArray(t)) {
            const [h,m] = t; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
          }
          return String(t);
        };

        const normalizedAppointment = {
          ...appointmentData,
          appointmentDate: normalizeDate(appointmentData.appointmentDate),
          appointmentTime: normalizeTime(appointmentData.appointmentTime),
        };
        console.log("Found appointment (normalized):", normalizedAppointment);
        
        setAppointment(normalizedAppointment);
        
        // Always fetch patient profile to enrich/merge missing fields for real-time details
        try {
          console.log("Fetching patient data for ID:", appointmentData.patientId);
          const patientData = await patientApi.getPatientProfile(appointmentData.patientId);
          console.log("Patient data fetched:", patientData);

          const mergedVitalSigns = {
            height: appointmentData.patientDetails?.vitalSigns?.height || patientData?.height || '',
            weight: appointmentData.patientDetails?.vitalSigns?.weight || patientData?.weight || '',
            temperature: appointmentData.patientDetails?.vitalSigns?.temperature || patientData?.temperature || '',
            bloodPressure: appointmentData.patientDetails?.vitalSigns?.bloodPressure || patientData?.bloodPressure || '',
            pulse: appointmentData.patientDetails?.vitalSigns?.pulse || patientData?.pulse || '',
            oxygenSaturation: appointmentData.patientDetails?.vitalSigns?.oxygenSaturation || patientData?.oxygenSaturation || ''
          };

          const mergedDetails = {
            // Prefer explicit appointment-embedded details, then patient profile, then sensible defaults
            name: appointmentData.patientDetails?.name || patientData?.name || '',
            age: appointmentData.patientDetails?.age || patientData?.age || '',
            gender: appointmentData.patientDetails?.gender || patientData?.gender || '',
            bloodGroup: appointmentData.patientDetails?.bloodGroup || patientData?.bloodGroup || '',
            allergyHistory: appointmentData.patientDetails?.allergyHistory || patientData?.allergyHistory || 'None reported',
            currentMedications: appointmentData.patientDetails?.currentMedications || patientData?.currentMedications || 'None reported',
            pastMedicalHistory: appointmentData.patientDetails?.pastMedicalHistory || patientData?.pastMedicalHistory || 'None reported',
            vitalSigns: mergedVitalSigns
          };

          setPatientDetails(mergedDetails);

          // Ensure name/email on appointment for header/exports
          setAppointment(prev => ({
            ...prev,
            patientName: prev?.patientName || mergedDetails?.name || patientData?.name || prev?.patientId || '',
            patientEmail: prev?.patientEmail || patientData?.email || prev?.patientEmail
          }));
        } catch (patientError) {
          console.error('Failed to fetch patient data:', patientError);
          // If fetching profile fails, still show whatever details embedded in the appointment
          const fallback = appointmentData.patientDetails || {};
          setPatientDetails({
            age: fallback.age || '',
            gender: fallback.gender || '',
            bloodGroup: fallback.bloodGroup || '',
            allergyHistory: fallback.allergyHistory || 'None reported',
            currentMedications: fallback.currentMedications || 'None reported',
            pastMedicalHistory: fallback.pastMedicalHistory || 'None reported',
            vitalSigns: {
              height: fallback.vitalSigns?.height || '',
              weight: fallback.vitalSigns?.weight || '',
              temperature: fallback.vitalSigns?.temperature || '',
              bloodPressure: fallback.vitalSigns?.bloodPressure || '',
              pulse: fallback.vitalSigns?.pulse || '',
              oxygenSaturation: fallback.vitalSigns?.oxygenSaturation || ''
            }
          });
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
                    <span className="detail-value">{appointment?.appointmentType || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value status-badge ${appointment?.status?.toLowerCase()}`}>
                      {appointment?.status || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Chief Complaint:</span>
                    <span className="detail-value">{appointment?.problem || 'None specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Doctor:</span>
                    <span className="detail-value">{appointment?.doctorName || 'N/A'}{appointment?.doctorSpecialization ? ` (${appointment.doctorSpecialization})` : ''}</span>
                  </div>
                </div>
              </section>
              
              <section className="details-section">
                <h3>Patient Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{appointment?.patientName || patientDetails?.name || 'N/A'}</span>
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
                  <div className="detail-item">
                    <span className="detail-label">Patient ID:</span>
                    <span className="detail-value">{appointment?.patientId || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{patientDetails?.email || appointment?.patientEmail || 'N/A'}</span>
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