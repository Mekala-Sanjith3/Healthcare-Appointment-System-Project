import React, { useState, useEffect } from 'react';
import { doctorApi } from '../../../services/api';

const PatientSearch = ({ onSelectPatient, doctorId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial recent patients list
  useEffect(() => {
    const fetchRecentPatients = async () => {
      if (!doctorId) return;
      
      setIsLoading(true);
      try {
        // In a real implementation, this would come from a doctorApi.getRecentPatients() call
        // For now, we'll use the search function with empty query to get all patients
        const patients = await doctorApi.searchPatients(doctorId, '');
        setRecentPatients(patients.slice(0, 5)); // Just show the first 5 patients
      } catch (err) {
        console.error('Failed to fetch recent patients:', err);
        setError('Failed to load patient list. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (doctorId) {
      fetchRecentPatients();
    }
  }, [doctorId]);

  // Search for patients when query changes
  useEffect(() => {
    if (!searchQuery.trim() || !doctorId) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await doctorApi.searchPatients(doctorId, searchQuery.trim());
        setSearchResults(results);
      } catch (err) {
        console.error('Failed to search patients:', err);
        setError('Search failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce search for better user experience

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, doctorId]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setError(null);
  };

  const handleSelectPatient = (patient) => {
    if (onSelectPatient) {
      onSelectPatient(patient);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="patient-search">
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Search patients by name or ID..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        {searchQuery && (
          <button 
            className="clear-search" 
            onClick={() => setSearchQuery('')}
          >
            ×
          </button>
        )}
      </div>
      
      {error && (
        <div className="search-error">
          <p>{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="search-loading">Loading patients...</div>
      ) : searchQuery && searchResults.length > 0 ? (
        <div className="search-results">
          {searchResults.map(patient => (
            <div 
              key={patient.id} 
              className="patient-item"
              onClick={() => handleSelectPatient(patient)}
            >
              <div className="patient-avatar">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="patient-details">
                <div className="patient-name">{patient.name}</div>
                <div className="patient-info">
                  {patient.id} • {patient.age} years • {patient.gender}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        <div className="no-results">
          No patients found matching "{searchQuery}"
        </div>
      ) : recentPatients.length > 0 && (
        <div className="recent-patients">
          <h4>Recent Patients</h4>
          {recentPatients.map(patient => (
            <div 
              key={patient.id} 
              className="patient-item"
              onClick={() => handleSelectPatient(patient)}
            >
              <div className="patient-avatar">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="patient-details">
                <div className="patient-name">{patient.name}</div>
                <div className="patient-info">
                  {patient.id} • {patient.age} years • {patient.gender}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientSearch; 