import React, { useState, useRef } from 'react';
import '../../../styles/pages/admin/MedicalRecordsView.css';

const MedicalRecordsView = ({ patient }) => {
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    recordType: 'Consultation',
    title: '',
    description: '',
    doctorName: '',
    prescriptions: ''
  });

  const [records, setRecords] = useState([
    {
      id: 1,
      date: '2023-05-15',
      recordType: 'Consultation',
      title: 'Regular Checkup',
      description: 'Patient came in for a regular checkup. Vitals were normal.',
      doctorName: 'Dr. Sarah Johnson',
      prescriptions: 'Vitamin D - 1000 IU daily'
    },
    {
      id: 2,
      date: '2023-08-22',
      recordType: 'Test Results',
      title: 'Blood Work Results',
      description: 'Complete blood count (CBC) and metabolic panel. All results within normal range.',
      doctorName: 'Dr. Michael Chen',
      prescriptions: 'None'
    }
  ]);

  const [activeRecord, setActiveRecord] = useState(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const printRecordRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord({
      ...newRecord,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const record = {
      id: Date.now(),
      ...newRecord
    };
    setRecords([record, ...records]);
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      recordType: 'Consultation',
      title: '',
      description: '',
      doctorName: '',
      prescriptions: ''
    });
    setIsAddingRecord(false);
  };

  const handlePrint = () => {
    const printContents = printRecordRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    
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
        .record-meta { color: #7f8c8d; margin-bottom: 15px; font-size: 0.9em; }
        .section-title { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; }
        .content-section { margin-bottom: 25px; }
        @media print {
          body { margin: 0; padding: 20px; }
        }
      </style>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Record - ${patient?.name || 'Patient'}</title>
          ${printStyles}
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <h1>Medical Record</h1>
              <p>Patient: ${patient?.name || 'N/A'} (ID: ${patient?.id || 'N/A'})</p>
              <p>Date Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="print-section">
              <h2 class="section-title">Record Information</h2>
              <div class="print-row">
                <div class="print-label">Title:</div>
                <div class="print-value">${records.find(r => r.id === activeRecord)?.title || 'N/A'}</div>
              </div>
              <div class="print-row">
                <div class="print-label">Record Type:</div>
                <div class="print-value">${records.find(r => r.id === activeRecord)?.recordType || 'N/A'}</div>
              </div>
              <div class="print-row">
                <div class="print-label">Date:</div>
                <div class="print-value">${records.find(r => r.id === activeRecord)?.date || 'N/A'}</div>
              </div>
              <div class="print-row">
                <div class="print-label">Doctor:</div>
                <div class="print-value">${records.find(r => r.id === activeRecord)?.doctorName || 'N/A'}</div>
              </div>
            </div>
            
            <div class="content-section">
              <h2 class="section-title">Description</h2>
              <p>${records.find(r => r.id === activeRecord)?.description || 'No description available.'}</p>
            </div>
            
            <div class="content-section">
              <h2 class="section-title">Prescriptions</h2>
              <p>${records.find(r => r.id === activeRecord)?.prescriptions || 'None'}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Add a small delay to ensure styles are loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Function to print all medical records
  const handlePrintAllRecords = () => {
    const printStyles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 30px; }
        h1 { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        h2 { color: #3498db; margin-top: 20px; }
        h3 { color: #2980b9; margin-top: 30px; border-bottom: 1px dashed #eee; padding-bottom: 5px; }
        .print-header { margin-bottom: 30px; }
        .record-container { margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #ddd; }
        .record-container:last-child { border-bottom: none; }
        .print-section { margin-bottom: 25px; }
        .print-row { display: flex; margin-bottom: 10px; }
        .print-label { font-weight: bold; width: 150px; }
        .print-value { flex: 1; }
        .section-title { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; }
        .content-section { margin-bottom: 25px; }
        @media print {
          body { margin: 0; padding: 20px; }
          .page-break { page-break-before: always; }
        }
      </style>
    `;
    
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>All Medical Records - ${patient?.name || 'Patient'}</title>
          ${printStyles}
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <h1>Medical Records Summary</h1>
              <p>Patient: ${patient?.name || 'N/A'} (ID: ${patient?.id || 'N/A'})</p>
              <p>Date Generated: ${new Date().toLocaleDateString()}</p>
              <p>Total Records: ${records.length}</p>
            </div>
    `);
    
    // Add each record
    records.forEach((record, index) => {
      printWindow.document.write(`
        <div class="record-container ${index > 0 ? 'page-break' : ''}">
          <h3>${record.title}</h3>
          
          <div class="print-section">
            <h4 class="section-title">Record Information</h4>
            <div class="print-row">
              <div class="print-label">Record Type:</div>
              <div class="print-value">${record.recordType}</div>
            </div>
            <div class="print-row">
              <div class="print-label">Date:</div>
              <div class="print-value">${record.date}</div>
            </div>
            <div class="print-row">
              <div class="print-label">Doctor:</div>
              <div class="print-value">${record.doctorName}</div>
            </div>
          </div>
          
          <div class="content-section">
            <h4 class="section-title">Description</h4>
            <p>${record.description}</p>
          </div>
          
          <div class="content-section">
            <h4 class="section-title">Prescriptions</h4>
            <p>${record.prescriptions || 'None'}</p>
          </div>
        </div>
      `);
    });
    
    printWindow.document.write(`
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Add a small delay to ensure styles are loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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
        <div className="header-actions">
          <button 
            className="print-all-btn"
            onClick={handlePrintAllRecords}
            disabled={records.length === 0}
          >
            <i className="fas fa-print"></i>
            Print All Records
          </button>
          <button 
            className="add-record-btn"
            onClick={() => setIsAddingRecord(true)}
          >
            <i className="fas fa-plus"></i>
            Add Record
          </button>
        </div>
      </div>

      <div className="records-container">
        <div className="records-sidebar">
          {records.length === 0 ? (
            <p className="no-records">No medical records found</p>
          ) : (
            records.map(record => (
              <div 
                key={record.id} 
                className={`record-item ${activeRecord === record.id ? 'active' : ''}`}
                onClick={() => setActiveRecord(record.id)}
              >
                <div className="record-type-icon">
                  <i className={`fas ${getRecordTypeIcon(record.recordType)}`}></i>
                </div>
                <div className="record-summary">
                  <h4>{record.title}</h4>
                  <div className="record-meta">
                    <span className="record-date">{record.date}</span>
                    <span className="record-type">{record.recordType}</span>
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
                    <h3>{records.find(r => r.id === activeRecord).title}</h3>
                    <div className="record-actions">
                      <button className="action-btn" onClick={handlePrint}>
                        <i className="fas fa-print"></i>
                        Print
                      </button>
                      <button className="action-btn">
                        <i className="fas fa-download"></i>
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="record-info">
                    <div className="info-group">
                      <span className="info-label">Date:</span>
                      <span className="info-value">{records.find(r => r.id === activeRecord).date}</span>
                    </div>
                    <div className="info-group">
                      <span className="info-label">Record Type:</span>
                      <span className="info-value">{records.find(r => r.id === activeRecord).recordType}</span>
                    </div>
                    <div className="info-group">
                      <span className="info-label">Doctor:</span>
                      <span className="info-value">{records.find(r => r.id === activeRecord).doctorName}</span>
                    </div>
                  </div>

                  <div className="record-description">
                    <h4>Description</h4>
                    <p>{records.find(r => r.id === activeRecord).description}</p>
                  </div>

                  <div className="record-prescriptions">
                    <h4>Prescriptions</h4>
                    <p>{records.find(r => r.id === activeRecord).prescriptions || 'None'}</p>
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

      {isAddingRecord && (
        <div className="add-record-modal">
          <div className="add-record-content">
            <div className="modal-header">
              <h3>Add New Medical Record</h3>
              <button 
                className="close-btn"
                onClick={() => setIsAddingRecord(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newRecord.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="recordType">Record Type</label>
                  <select
                    id="recordType"
                    name="recordType"
                    value={newRecord.recordType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Test Results">Test Results</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newRecord.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter a title for the record"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctorName">Doctor Name</label>
                  <input
                    type="text"
                    id="doctorName"
                    name="doctorName"
                    value={newRecord.doctorName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter doctor's name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newRecord.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter detailed description"
                  rows="4"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="prescriptions">Prescriptions</label>
                <textarea
                  id="prescriptions"
                  name="prescriptions"
                  value={newRecord.prescriptions}
                  onChange={handleInputChange}
                  placeholder="Enter prescriptions (if any)"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  <i className="fas fa-save"></i>
                  Save Record
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setIsAddingRecord(false)}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsView; 