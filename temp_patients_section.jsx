      case 'patients':
        return (
          <div className="content-card">
            <div className="card-header">
              <h2>Patients Who Booked Appointments</h2>
              <div className="search-filters">
                <input 
                  type="text" 
                  placeholder="Search patients by name..." 
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
                        <th>Patient Name</th>
                        <th>Last Appointment</th>
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
                              </div>
                            </div>
                          </td>
                          <td>
                            {patient.lastVisit || 'No visits yet'}
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