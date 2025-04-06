import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../../styles/pages/patient/PatientDashboard.css";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');

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
            className={`nav-item ${activeTab === 'ai-recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-recommendations')}
          >
            <i className="fas fa-robot nav-icon"></i>
            AI Recommendations
          </button>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="nav-item logout"
            onClick={() => navigate('/')}
          >
            <i className="fas fa-sign-out-alt nav-icon"></i>
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-title">
            <h1>Welcome, Pavan</h1>
            <p>Manage your healthcare journey</p>
          </div>
          
          <div className="doctor-profile">
            <div className="profile-avatar">P</div>
            <span className="doctor-name">Pavan</span>
          </div>
        </div>

        <div className="tabs">
          <div className="tabs-list">
            <button 
              className={`tab-trigger ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              Appointments
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
              className={`tab-trigger ${activeTab === 'ai-recommendations' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai-recommendations')}
            >
              AI Recommendations
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'appointments' && (
              <div className="card">
                <div className="card-header">
                  <h2>Upcoming Appointments</h2>
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
                      <tr>
                        <td>May 15, 2024 10:00 AM</td>
                        <td>Dr. Mohan Venkat</td>
                        <td>General Checkup</td>
                        <td>
                          <span className="status-badge status-confirmed">Confirmed</span>
                        </td>
                        <td>
                          <button className="view-details-btn">View Details</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'telemedicine' && (
              <div className="card">
                <div className="card-header">
                  <h2>Telemedicine Sessions</h2>
                </div>
                <div className="card-content">
                  <div className="telemedicine-grid">
                    <div className="upcoming-session">
                      <h3>Next Session</h3>
                      <div className="session-card">
                        <div className="session-info">
                          <p className="session-time">Today at 2:00 PM</p>
                          <p className="session-doctor">Dr. Sarah Johnson</p>
                          <p className="session-type">Follow-up Consultation</p>
                        </div>
                        <button className="join-session-btn">
                          <i className="fas fa-video"></i>
                          Join Session
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="card">
                <div className="card-header">
                  <h2>Medical History</h2>
                </div>
                <div className="card-content">
                  <div className="medical-history">
                    <div className="history-filters">
                      <input 
                        type="text" 
                        placeholder="Search records..." 
                        className="search-bar"
                      />
                    </div>
                    <div className="history-timeline">
                      <div className="history-item">
                        <div className="history-date">Mar 10, 2024</div>
                        <div className="history-content">
                          <h4>General Checkup</h4>
                          <p>Blood pressure: 120/80</p>
                          <p>Weight: 70kg</p>
                          <p>Notes: Regular checkup, all vitals normal</p>
                        </div>
                      </div>
                      <div className="history-item">
                        <div className="history-date">Feb 15, 2024</div>
                        <div className="history-content">
                          <h4>Dental Examination</h4>
                          <p>Procedure: Routine cleaning and checkup</p>
                          <p>Notes: Minor cavity detected in lower right molar</p>
                          <p>Follow-up: Schedule filling in 2 weeks</p>
                        </div>
                      </div>
                      <div className="history-item">
                        <div className="history-date">Jan 5, 2024</div>
                        <div className="history-content">
                          <h4>Annual Physical</h4>
                          <p>Blood pressure: 118/75</p>
                          <p>Weight: 71kg</p>
                          <p>Cholesterol: 180 mg/dL</p>
                          <p>Blood sugar (fasting): 85 mg/dL</p>
                          <p>Notes: All tests within normal range. Recommended increased physical activity.</p>
                        </div>
                      </div>
                      <div className="history-item">
                        <div className="history-date">Dec 12, 2023</div>
                        <div className="history-content">
                          <h4>Vaccination</h4>
                          <p>Type: Influenza (Flu Shot)</p>
                          <p>Batch Number: FL2023-456</p>
                          <p>Notes: No adverse reactions observed</p>
                        </div>
                      </div>
                      <div className="history-item">
                        <div className="history-date">Nov 20, 2023</div>
                        <div className="history-content">
                          <h4>Eye Examination</h4>
                          <p>Vision: 20/20 (both eyes)</p>
                          <p>Prescription: No change needed</p>
                          <p>Notes: Mild eye strain noted, recommended regular screen breaks</p>
                        </div>
                      </div>
                    </div>
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
                  <div className="ai-recommendations">
                    <div className="health-metrics">
                      <h3>Health Score</h3>
                      <div className="health-score">85/100</div>
                      <p>Based on your recent health data</p>
                    </div>
                    <div className="recommendation-cards">
                      <div className="recommendation-card">
                        <i className="fas fa-heartbeat"></i>
                        <h4>Exercise Routine</h4>
                        <p>Recommended 30 minutes of moderate exercise daily</p>
                      </div>
                      <div className="recommendation-card">
                        <i className="fas fa-utensils"></i>
                        <h4>Diet Plan</h4>
                        <p>Increase protein intake and reduce processed foods</p>
                      </div>
                      <div className="recommendation-card">
                        <i className="fas fa-bed"></i>
                        <h4>Sleep Schedule</h4>
                        <p>Aim for 7-8 hours of sleep per night</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard; 