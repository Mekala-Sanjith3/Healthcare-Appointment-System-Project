import React, { useState } from 'react';
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
        <button 
          className="add-record-btn"
          onClick={() => setIsAddingRecord(true)}
        >
          <i className="fas fa-plus"></i>
          Add Record
        </button>
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
            <div className="record-content">
              {records.find(r => r.id === activeRecord) && (
                <>
                  <div className="record-header">
                    <h3>{records.find(r => r.id === activeRecord).title}</h3>
                    <div className="record-actions">
                      <button className="action-btn">
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