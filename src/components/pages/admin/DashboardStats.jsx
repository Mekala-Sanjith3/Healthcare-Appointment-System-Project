import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/realtimeApi';
import { Line, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import '../../../styles/pages/admin/DashboardStats.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
);

const DashboardStats = ({ activeTab }) => {
  const [doctorStats, setDoctorStats] = useState({
    totalDoctors: 0,
    activeCount: 0,
    pendingCount: 0,
    inactiveCount: 0,
    specializations: {}
  });
  
  const [patientStats, setPatientStats] = useState({
    totalPatients: 0,
    genderDistribution: {},
    ageGroups: {},
    bloodGroups: {}
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch both doctor and patient data
      const doctors = await adminApi.getAllDoctors();
      const patients = await adminApi.getAllPatients();

      processDocStats(doctors);
      processPatientStats(patients);
      
      setError(null);
    } catch (err) {
      setError('Failed to load statistics. Please try again later.');
      console.error('Error fetching statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const processDocStats = (doctors) => {
    // Calculate statistics
    const activeCount = doctors.filter(d => d.status === 'ACTIVE').length;
    const pendingCount = doctors.filter(d => d.status === 'PENDING').length;
    const inactiveCount = doctors.filter(d => d.status === 'INACTIVE').length;
    
    // Group by specialization
    const specializations = {};
    doctors.forEach(doctor => {
      if (doctor.specialization) {
        specializations[doctor.specialization] = (specializations[doctor.specialization] || 0) + 1;
      }
    });
    
    setDoctorStats({
      totalDoctors: doctors.length,
      activeCount,
      pendingCount,
      inactiveCount,
      specializations
    });
  };

  const processPatientStats = (patients) => {
    // Gender distribution
    const genderDistribution = {};
    patients.forEach(patient => {
      if (patient.gender) {
        genderDistribution[patient.gender] = (genderDistribution[patient.gender] || 0) + 1;
      }
    });
    
    // Age groups
    const ageGroups = {
      'Under 18': 0,
      '18-30': 0,
      '31-45': 0,
      '46-60': 0,
      'Over 60': 0
    };
    
    patients.forEach(patient => {
      if (patient.age) {
        if (patient.age < 18) ageGroups['Under 18']++;
        else if (patient.age <= 30) ageGroups['18-30']++;
        else if (patient.age <= 45) ageGroups['31-45']++;
        else if (patient.age <= 60) ageGroups['46-60']++;
        else ageGroups['Over 60']++;
      }
    });
    
    // Blood groups
    const bloodGroups = {};
    patients.forEach(patient => {
      if (patient.bloodGroup) {
        bloodGroups[patient.bloodGroup] = (bloodGroups[patient.bloodGroup] || 0) + 1;
      }
    });
    
    setPatientStats({
      totalPatients: patients.length,
      genderDistribution,
      ageGroups,
      bloodGroups
    });
  };

  if (isLoading) {
    return <div className="dashboard-loading">Loading statistics...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  // Data preparations for charts
  const specializationChartData = {
    labels: Object.keys(doctorStats.specializations),
    datasets: [
      {
        label: 'Doctors by Specialization',
        data: Object.values(doctorStats.specializations),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const doctorStatusChartData = {
    labels: ['Active', 'Pending', 'Inactive'],
    datasets: [
      {
        label: 'Doctors by Status',
        data: [doctorStats.activeCount, doctorStats.pendingCount, doctorStats.inactiveCount],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const patientAgeChartData = {
    labels: Object.keys(patientStats.ageGroups),
    datasets: [
      {
        label: 'Patients by Age Group',
        data: Object.values(patientStats.ageGroups),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const patientGenderChartData = {
    labels: Object.keys(patientStats.genderDistribution),
    datasets: [
      {
        label: 'Patients by Gender',
        data: Object.values(patientStats.genderDistribution),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard-stats-container">
      <div className="stats-header">
        <h2>Healthcare Analytics Dashboard</h2>
        <p>Overview of doctors and patients statistics</p>
      </div>
      
      <div className="stat-cards-container">
        <div className="stat-card doctors animated-card">
          <div className="stat-icon-wrapper">
            <i className="fas fa-user-md"></i>
          </div>
          <div className="stat-info">
            <h3>{doctorStats.totalDoctors}</h3>
            <p>Total Doctors</p>
          </div>
          <div className="stat-distribution">
            <div className="stat-bar active" style={{ width: `${(doctorStats.activeCount / doctorStats.totalDoctors) * 100}%` }}></div>
            <div className="stat-bar pending" style={{ width: `${(doctorStats.pendingCount / doctorStats.totalDoctors) * 100}%` }}></div>
            <div className="stat-bar inactive" style={{ width: `${(doctorStats.inactiveCount / doctorStats.totalDoctors) * 100}%` }}></div>
          </div>
          <div className="stat-legend">
            <span className="legend-item"><span className="color-box active"></span>Active</span>
            <span className="legend-item"><span className="color-box pending"></span>Pending</span>
            <span className="legend-item"><span className="color-box inactive"></span>Inactive</span>
          </div>
        </div>
        
        <div className="stat-card patients animated-card">
          <div className="stat-icon-wrapper">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>{patientStats.totalPatients}</h3>
            <p>Total Patients</p>
          </div>
          <div className="stat-gender">
            {Object.entries(patientStats.genderDistribution).map(([gender, count]) => (
              <div key={gender} className="gender-stat">
                <i className={`fas fa-${gender.toLowerCase() === 'male' ? 'mars' : gender.toLowerCase() === 'female' ? 'venus' : 'venus-mars'}`}></i>
                <span>{gender}: {count}</span>
                <span className="percentage">({Math.round((count / patientStats.totalPatients) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-card animated-card">
          <h3>Doctor Specializations</h3>
          <div className="chart-container">
            <Pie data={specializationChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="chart-card animated-card">
          <h3>Doctor Status Distribution</h3>
          <div className="chart-container">
            <Pie data={doctorStatusChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="chart-card wide animated-card">
          <h3>Patient Age Distribution</h3>
          <div className="chart-container">
            <Line 
              data={patientAgeChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="chart-card animated-card">
          <h3>Patient Gender Distribution</h3>
          <div className="chart-container">
            <Pie data={patientGenderChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
      
      <div className="insights-container">
        <div className="insight-card animated-card">
          <div className="insight-header">
            <i className="fas fa-lightbulb"></i>
            <h3>Key Insights</h3>
          </div>
          <ul className="insights-list">
            {doctorStats.totalDoctors > 0 && (
              <li>
                <span className="insight-text">
                  {Object.entries(doctorStats.specializations).sort((a, b) => b[1] - a[1])[0]?.[0]} is the most common specialization among doctors
                </span>
              </li>
            )}
            {patientStats.totalPatients > 0 && (
              <>
                <li>
                  <span className="insight-text">
                    {Object.entries(patientStats.ageGroups).sort((a, b) => b[1] - a[1])[0]?.[0]} is the most common age group among patients
                  </span>
                </li>
                <li>
                  <span className="insight-text">
                    Approximately {Math.round((doctorStats.activeCount / doctorStats.totalDoctors) * 100)}% of doctors are actively seeing patients
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats; 