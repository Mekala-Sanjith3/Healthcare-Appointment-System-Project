import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/pages/admin/MedicalRecordsView.css';
import { medicalRecordsApi } from '../../../services/realtimeApi';

const MedicalRecordsView = ({ searchTerm, filters }) => {
  const [records, setRecords] = useState([]);
  const [activeRecord, setActiveRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRecordRef = useRef(null);

  // Fetch from backend only (no temp data, read-only)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = {
          search: (searchTerm || '').trim() || undefined,
          dateFrom: filters?.dateFrom || undefined,
          dateTo: filters?.dateTo || undefined
        };
        const data = await medicalRecordsApi.getAllRecords(params);
        setRecords(Array.isArray(data) ? data : []);
        setActiveRecord(data && data.length ? data[0].id : null);
      } catch (e) {
        console.error('Failed to load medical records', e);
        setRecords([]);
        setActiveRecord(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchTerm, filters?.dateFrom, filters?.dateTo]);

  const handlePrint = () => {
    const printStyles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 30px; }
        h1 { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        h2 { color: #3498db; margin-top: 20px; }
        .print-header { margin-bottom: 30px; }
        .print-section { margin-bottom: 25px; }
        .print-row { display: flex; margin-bottom: 10px; }
        .print-label { font-weight: bold; width: 150px; }
        .print-value { flex: 1; }
        .section-title { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; }
        .content-section { margin-bottom: 25px; }
        @media print { body { margin: 0; padding: 20px; } }
      </style>
    `;

    const r = records.find(x => x.id === activeRecord);
    if (!r) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Record</title>
          ${printStyles}
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <h1>Medical Record</h1>
              <p>Patient: ${r.patientName || 'N/A'}</p>
              <p>Date Generated: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="print-section">
              <h2 class="section-title">Record Information</h2>
              <div class="print-row">
                <div class="print-label">Problem / Diagnosis:</div>
                <div class="print-value">${r.diagnosis || r.notes || 'N/A'}</div>
              </div>
              <div class="print-row">
                <div class="print-label">Doctor:</div>
                <div class="print-value">${r.doctorName || 'N/A'}</div>
              </div>
              <div class="print-row">
                <div class="print-label">Date:</div>
                <div class="print-value">${r.date || 'N/A'}</div>
              </div>
            </div>

            <div class="content-section">
              <h2 class="section-title">Notes</h2>
              <p>${r.notes || 'No notes available.'}</p>
            </div>

            <div class="content-section">
              <h2 class="section-title">Prescriptions</h2>
              <p>${r.prescription || 'None'}</p>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  const getRecordTypeIcon = (type) => {
    switch (type) {
      case 'Consultation':
        return 'fa-stethoscope';
      case 'Test Results':
        return 'fa-vial';
      case 'Prescription':
        return 'fa-prescription';
      case 'Surgery':
        return 'fa-procedures';
      case 'Vaccination':
        return 'fa-syringe';
      default:
        return 'fa-notes-medical';
    }
  };

  return (
    <div className="medical-records-view">
      <div className="records-header">
        <h2>Medical Records</h2>
        <div className="header-actions"/>
      </div>

      <div className="records-container">
        <div className="records-sidebar">
          {loading ? (
            <p className="no-records">Loading...</p>
          ) : records.length === 0 ? (
            <p className="no-records">No medical records found</p>
          ) : (
            records.map(record => (
              <div 
                key={record.id} 
                className={`record-item ${activeRecord === record.id ? 'active' : ''}`}
                onClick={() => setActiveRecord(record.id)}
              >
                <div className="record-type-icon">
                  <i className={`fas ${getRecordTypeIcon(record.recordType || 'Consultation')}`}></i>
                </div>
                <div className="record-summary">
                  <h4>{record.diagnosis || 'Medical Record'}</h4>
                  <div className="record-meta">
                    <span className="record-date">{record.date}</span>
                    <span className="record-type">{record.recordType || 'Record'}</span>
                  </div>
                  <p className="record-doctor">{record.doctorName}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="record-details">
          {activeRecord ? (
            <div className="record-content" ref={printRecordRef}>
              {records.find(r => r.id === activeRecord) && (
                <>
                  <div className="record-header">
                    <h3>{records.find(r => r.id === activeRecord).diagnosis || 'Medical Record'}</h3>
                    <div className="record-actions">
                      <button className="action-btn" onClick={handlePrint}>
                        <i className="fas fa-print"></i>
                        Print
                      </button>
                    </div>
                  </div>

                  <div className="record-info">
                    <div className="info-group">
                      <span className="info-label">Date:</span>
                      <span className="info-value">{records.find(r => r.id === activeRecord).date}</span>
                    </div>
                    <div className="info-group">
                      <span className="info-label">Patient:</span>
                      <span className="info-value">{records.find(r => r.id === activeRecord).patientName}</span>
                    </div>
                    <div className="info-group">
                      <span className="info-label">Doctor:</span>
                      <span className="info-value">{records.find(r => r.id === activeRecord).doctorName}</span>
                    </div>
                  </div>

                  <div className="record-description">
                    <h4>Problem / Diagnosis</h4>
                    <p>{records.find(r => r.id === activeRecord).diagnosis || records.find(r => r.id === activeRecord).notes || '—'}</p>
                  </div>

                  <div className="record-prescriptions">
                    <h4>Prescriptions</h4>
                    <p>{records.find(r => r.id === activeRecord).prescription || 'None'}</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="no-record-selected">
              <i className="fas fa-folder-open"></i>
              <p>Select a record to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsView; 