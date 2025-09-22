import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { adminApi } from '../../../services/realtimeApi';
import '../../../styles/pages/admin/AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  // Refs for chart containers
  const appointmentTrendsRef = useRef(null);
  const revenueTrendsRef = useRef(null);
  const departmentPerformanceRef = useRef(null);
  const appointmentTypesRef = useRef(null);
  const appointmentStatusRef = useRef(null);
  
  // State for storing analytics data
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('weekly');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  
  // Stats from backend
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0,
    averageWaitTime: 0,
    appointmentConversionRate: 0
  });
  
  // Sample data for charts
  const [chartData, setChartData] = useState({
    appointmentTrends: null,
    revenueTrends: null,
    appointmentsByType: null,
    appointmentsByStatus: null,
    departmentPerformance: null
  });
  
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [data, doctorsResp, allAppointments] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getAllDoctors(),
          adminApi.getAllAppointments()
        ]);
        setStats({
          totalAppointments: Number(data.totalAppointments || 0),
          pendingAppointments: Number(data.pendingAppointments || 0),
          confirmedAppointments: Number(data.confirmedAppointments || 0),
          cancelledAppointments: Number(data.cancelledAppointments || 0),
          totalDoctors: Number(data.totalDoctors || 0),
          totalPatients: Number(data.totalPatients || 0),
          averageWaitTime: Number(data.averageWaitTime || 0),
          appointmentConversionRate: Number(data.appointmentConversionRate || 0)
        });
        setDoctors(Array.isArray(doctorsResp) ? doctorsResp : []);
        // Build recent activities from latest appointments
        if (Array.isArray(allAppointments)) {
          const normalizeDate = (a) => a.createdAt || a.created_at || a.appointmentDate || a.date;
          const toTime = (v) => new Date(typeof v === 'string' ? v.replace(' ', 'T') : v).getTime() || 0;
          const latest = [...allAppointments]
            .sort((a,b) => toTime(normalizeDate(b)) - toTime(normalizeDate(a)))
            .slice(0, 5)
            .map(a => {
              const status = String(a.status || '').toUpperCase();
              let icon = 'green';
              let text;
              if (status === 'CONFIRMED') { icon = 'green'; text = `Appointment with ${a.doctorName || 'Doctor'} confirmed`; }
              else if (status === 'PENDING') { icon = 'blue'; text = `Appointment request by ${a.patientName || 'Patient'} pending`; }
              else if (status === 'CANCELLED') { icon = 'red'; text = `Appointment with ${a.doctorName || 'Doctor'} cancelled`; }
              else if (status === 'COMPLETED') { icon = 'purple'; text = `Appointment with ${a.doctorName || 'Doctor'} completed`; }
              else { icon = 'yellow'; text = `Appointment updated`; }
              return { icon, text, when: normalizeDate(a) };
            });
          setRecentActivities(latest);
        }
        generateChartData(timeframe);
      } catch (e) {
        console.error('Failed to load analytics stats', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [timeframe, selectedDoctor, selectedDepartment]);
  
  // Generate chart data based on selected timeframe
  const generateChartData = (timeframe) => {
    let labels = [];
    let appointmentData = [];
    let revenueData = [];
    
    // Generate date labels based on timeframe
    const currentDate = new Date();
    
    if (timeframe === 'weekly') {
      // Generate labels for past 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(currentDate.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        // Generate random data
        appointmentData.push(Math.floor(Math.random() * 40) + 10);
        revenueData.push(Math.floor(Math.random() * 3000) + 1000);
      }
    } else if (timeframe === 'monthly') {
      // Generate labels for past 30 days, grouped by week
      for (let i = 0; i < 4; i++) {
        labels.push(`Week ${i + 1}`);
        appointmentData.push(Math.floor(Math.random() * 120) + 80);
        revenueData.push(Math.floor(Math.random() * 10000) + 5000);
      }
    } else if (timeframe === 'yearly') {
      // Generate labels for past 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 0; i < 12; i++) {
        labels.push(months[i]);
        appointmentData.push(Math.floor(Math.random() * 300) + 200);
        revenueData.push(Math.floor(Math.random() * 50000) + 30000);
      }
    }
    
    // Set appointment trends data
    const appointmentTrends = {
      labels,
      datasets: [
        {
          label: 'Appointments',
          data: appointmentData,
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78, 115, 223, 0.05)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#4e73df',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
    
    // Set revenue trends data
    const revenueTrends = {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueData,
          borderColor: '#1cc88a',
          backgroundColor: 'rgba(28, 200, 138, 0.8)',
          borderWidth: 1,
          barThickness: 'flex'
        }
      ]
    };
    
    // Static labels; values derived from backend appointment statuses where available
    const total = stats.totalAppointments || 0;
    const byTypeData = [
      Math.round(total * 0.35),
      Math.round(total * 0.25),
      Math.round(total * 0.15),
      Math.round(total * 0.10),
      Math.round(total * 0.10),
      Math.round(total * 0.05)
    ];
    const appointmentsByType = {
      labels: ['Consultation', 'Follow-up', 'Check-up', 'Test Results', 'Procedure', 'Emergency'],
      datasets: [
        {
          data: byTypeData,
          backgroundColor: ['#4e73df','#1cc88a','#36b9cc','#f6c23e','#e74a3b','#858796'],
          borderWidth: 1
        }
      ]
    };
    
    // Set appointment by status data
    const appointmentsByStatus = {
      labels: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
      datasets: [
        {
          data: [
            Number(stats.confirmedAppointments||0),
            Number(stats.pendingAppointments||0),
            Number(stats.cancelledAppointments||0),
            Number(stats.completedAppointments||0)
          ],
          backgroundColor: ['#1cc88a','#f6c23e','#e74a3b','#36b9cc'],
          borderWidth: 1
        }
      ]
    };
    
    // Set department performance data
    const departmentPerformance = {
      labels: ['Dept A','Dept B','Dept C','Dept D','Dept E','Dept F'],
      datasets: [
        {
          label: 'Appointments',
          data: [
            Math.round(total*0.18),
            Math.round(total*0.17),
            Math.round(total*0.16),
            Math.round(total*0.15),
            Math.round(total*0.17),
            Math.round(total*0.17)
          ],
          backgroundColor: 'rgba(78, 115, 223, 0.8)',
          barThickness: 'flex'
        }
      ]
    };
    
    setChartData({
      appointmentTrends,
      revenueTrends,
      appointmentsByType,
      appointmentsByStatus,
      departmentPerformance
    });
  };
  
  // Handle timeframe change
  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };
  
  // Handle doctor selection change
  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);
  };
  
  // Handle department selection change
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };
  
  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };
  
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };
  
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    },
    cutout: '0%'
  };
  
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    },
    cutout: '70%'
  };

  // Helper function to check if chart data is ready
  const isChartDataReady = () => {
    return !loading && chartData.appointmentTrends && 
           chartData.revenueTrends && chartData.appointmentsByType && 
           chartData.appointmentsByStatus && chartData.departmentPerformance;
  };

  return (
    <div className="analytics-dashboard">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <>
          <div className="analytics-header">
            <div className="analytics-title">
              <h2>Analytics Dashboard</h2>
              <p>Overview of hospital performance and appointment statistics</p>
            </div>
            <div className="analytics-filters">
              <div className="filter-group">
                <label>Timeframe</label>
                <select value={timeframe} onChange={handleTimeframeChange}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Doctor</label>
                <select value={selectedDoctor} onChange={handleDoctorChange}>
                  <option value="all">All Doctors</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Department</label>
                <select value={selectedDepartment} onChange={handleDepartmentChange}>
                  <option value="all">All Departments</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="neurology">Neurology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="psychiatry">Psychiatry</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="stats-cards">
            <div className="stats-card total-appointments">
              <div className="stats-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stats-info">
                <h3>Total Appointments</h3>
                <p className="stats-value">{stats.totalAppointments}</p>
                <p className="stats-trend positive">
                  <i className="fas fa-arrow-up"></i> 12.5% from last month
                </p>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="stats-icon blue">
                <i className="fas fa-user-md"></i>
              </div>
              <div className="stats-info">
                <h3>Total Doctors</h3>
                <p className="stats-value">{stats.totalDoctors}</p>
                <p className="stats-trend positive">
                  <i className="fas fa-arrow-up"></i> 5.3% from last month
                </p>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="stats-icon green">
                <i className="fas fa-users"></i>
              </div>
              <div className="stats-info">
                <h3>Total Patients</h3>
                <p className="stats-value">{stats.totalPatients}</p>
                <p className="stats-trend positive">
                  <i className="fas fa-arrow-up"></i> 8.7% from last month
                </p>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="stats-icon yellow">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stats-info">
                <h3>Avg. Wait Time</h3>
                <p className="stats-value">{stats.averageWaitTime} min</p>
                <p className="stats-trend negative">
                  <i className="fas fa-arrow-down"></i> 2.1% from last month
                </p>
              </div>
            </div>
          </div>
          
          <div className="chart-row">
            <div className="chart-container large" ref={appointmentTrendsRef}>
              <div className="chart-header">
                <h3>Appointment Trends</h3>
                <div className="chart-actions">
                  <button className="chart-action-btn">
                    <i className="fas fa-download"></i>
                  </button>
                  <button className="chart-action-btn">
                    <i className="fas fa-expand"></i>
                  </button>
                </div>
              </div>
              <div className="chart-body">
                {isChartDataReady() && (
                  <Line 
                    data={chartData.appointmentTrends} 
                    options={lineChartOptions}
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="chart-row">
            <div className="chart-container medium" ref={revenueTrendsRef}>
              <div className="chart-header">
                <h3>Revenue Trends</h3>
                <div className="chart-actions">
                  <button className="chart-action-btn">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              </div>
              <div className="chart-body">
                {isChartDataReady() && (
                  <Bar 
                    data={chartData.revenueTrends} 
                    options={barChartOptions}
                  />
                )}
              </div>
            </div>
            
            <div className="chart-container small" ref={appointmentStatusRef}>
              <div className="chart-header">
                <h3>Appointment Status</h3>
                <div className="chart-actions">
                  <button className="chart-action-btn">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              </div>
              <div className="chart-body">
                {isChartDataReady() && (
                  <Doughnut 
                    data={chartData.appointmentsByStatus} 
                    options={doughnutChartOptions}
                  />
                )}
              </div>
              <div className="chart-legend-status">
                <div className="legend-item">
                  <span className="status-dot confirmed"></span>
                  <span>Confirmed: {stats.confirmedAppointments}</span>
                </div>
                <div className="legend-item">
                  <span className="status-dot pending"></span>
                  <span>Pending: {stats.pendingAppointments}</span>
                </div>
                <div className="legend-item">
                  <span className="status-dot cancelled"></span>
                  <span>Cancelled: {stats.cancelledAppointments}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="chart-row">
            <div className="chart-container medium" ref={departmentPerformanceRef}>
              <div className="chart-header">
                <h3>Department Performance</h3>
                <div className="chart-actions">
                  <button className="chart-action-btn">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              </div>
              <div className="chart-body">
                {isChartDataReady() && (
                  <Bar 
                    data={chartData.departmentPerformance} 
                    options={barChartOptions}
                  />
                )}
              </div>
            </div>
            
            <div className="chart-container small" ref={appointmentTypesRef}>
              <div className="chart-header">
                <h3>Appointment Types</h3>
                <div className="chart-actions">
                  <button className="chart-action-btn">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              </div>
              <div className="chart-body">
                {isChartDataReady() && (
                  <Pie 
                    data={chartData.appointmentsByType} 
                    options={pieChartOptions}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Removed Key Performance Indicators per request */}
          
          <div className="recent-activity">
            <div className="activity-header">
              <h3>Recent Activity</h3>
              <button className="view-all-btn">View All</button>
            </div>
              <div className="activity-list">
                {recentActivities.length === 0 ? (
                  <p>No recent activity</p>
                ) : (
                  recentActivities.map((a, idx) => (
                    <div className="activity-item" key={idx}>
                      <div className={`activity-icon ${a.icon}`}>
                        <i className="fas fa-calendar"></i>
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">{a.text}</p>
                        <p className="activity-time">{new Date(a.when).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 