const API_BASE_URL = 'http://localhost:8080/api';

// Local storage based mock db for when server is not available
const mockDb = {
    admins: JSON.parse(localStorage.getItem('mockAdmins') || '[]'),
    doctors: JSON.parse(localStorage.getItem('mockDoctors') || '[]'),
    patients: JSON.parse(localStorage.getItem('mockPatients') || '[]'),
    
    saveAdmin: (admin) => {
        const admins = JSON.parse(localStorage.getItem('mockAdmins') || '[]');
        // Check if email already exists
        if (admins.some(a => a.email === admin.email)) {
            throw new Error('Admin with this email already exists');
        }
        
        const newAdmin = {
            ...admin,
            id: 'admin_' + Date.now(),
            role: 'ADMIN',
            createdAt: new Date().toISOString()
        };
        
        admins.push(newAdmin);
        localStorage.setItem('mockAdmins', JSON.stringify(admins));
        return newAdmin;
    },
    
    findAdminByEmail: (email) => {
        const admins = JSON.parse(localStorage.getItem('mockAdmins') || '[]');
        return admins.find(admin => admin.email === email);
    },
    
    findDoctorByEmail: (email) => {
        const doctors = JSON.parse(localStorage.getItem('mockDoctors') || '[]');
        return doctors.find(doctor => doctor.email === email);
    },
    
    findPatientByEmail: (email) => {
        const patients = JSON.parse(localStorage.getItem('mockPatients') || '[]');
        return patients.find(patient => patient.email === email);
    },
    
    // Doctor methods
    getAllDoctors: () => {
        return JSON.parse(localStorage.getItem('mockDoctors') || '[]');
    },
    
    getDoctorById: (id) => {
        const doctors = JSON.parse(localStorage.getItem('mockDoctors') || '[]');
        const doctor = doctors.find(d => d.id === id);
        if (!doctor) {
            throw new Error('Doctor not found');
        }
        return doctor;
    },
    
    saveDoctor: (doctor) => {
        const doctors = JSON.parse(localStorage.getItem('mockDoctors') || '[]');
        
        // Check if email already exists
        if (doctors.some(d => d.email === doctor.email)) {
            throw new Error('Doctor with this email already exists');
        }
        
        const newDoctor = {
            ...doctor,
            id: 'doctor_' + Date.now(),
            status: doctor.status || 'ACTIVE',
            createdAt: new Date().toISOString()
        };
        
        doctors.push(newDoctor);
        localStorage.setItem('mockDoctors', JSON.stringify(doctors));
        return newDoctor;
    },
    
    updateDoctor: (id, updatedDoctor) => {
        const doctors = JSON.parse(localStorage.getItem('mockDoctors') || '[]');
        const index = doctors.findIndex(d => d.id === id);
        
        if (index === -1) {
            throw new Error('Doctor not found');
        }
        
        doctors[index] = { ...doctors[index], ...updatedDoctor };
        localStorage.setItem('mockDoctors', JSON.stringify(doctors));
        return doctors[index];
    },
    
    updateDoctorStatus: (id, status) => {
        const doctors = JSON.parse(localStorage.getItem('mockDoctors') || '[]');
        const index = doctors.findIndex(d => d.id === id);
        
        if (index === -1) {
            throw new Error('Doctor not found');
        }
        
        doctors[index].status = status;
        localStorage.setItem('mockDoctors', JSON.stringify(doctors));
        return doctors[index];
    },
    
    deleteDoctor: (id) => {
        const doctors = JSON.parse(localStorage.getItem('mockDoctors') || '[]');
        const filteredDoctors = doctors.filter(d => d.id !== id);
        
        if (filteredDoctors.length === doctors.length) {
            throw new Error('Doctor not found');
        }
        
        localStorage.setItem('mockDoctors', JSON.stringify(filteredDoctors));
        return true;
    },
    
    // Patient methods
    getAllPatients: () => {
        return JSON.parse(localStorage.getItem('mockPatients') || '[]');
    },
    
    getPatientById: (id) => {
        const patients = JSON.parse(localStorage.getItem('mockPatients') || '[]');
        const patient = patients.find(p => p.id === id);
        if (!patient) {
            throw new Error('Patient not found');
        }
        return patient;
    },
    
    savePatient: (patient) => {
        const patients = JSON.parse(localStorage.getItem('mockPatients') || '[]');
        
        // Check if email already exists
        if (patients.some(p => p.email === patient.email)) {
            throw new Error('Patient with this email already exists');
        }
        
        const newPatient = {
            ...patient,
            id: 'patient_' + Date.now(),
            status: patient.status || 'ACTIVE',
            createdAt: new Date().toISOString()
        };
        
        patients.push(newPatient);
        localStorage.setItem('mockPatients', JSON.stringify(patients));
        return newPatient;
    },
    
    updatePatient: (id, updatedPatient) => {
        const patients = JSON.parse(localStorage.getItem('mockPatients') || '[]');
        const index = patients.findIndex(p => p.id === id);
        
        if (index === -1) {
            throw new Error('Patient not found');
        }
        
        patients[index] = { ...patients[index], ...updatedPatient };
        localStorage.setItem('mockPatients', JSON.stringify(patients));
        return patients[index];
    },
    
    deletePatient: (id) => {
        const patients = JSON.parse(localStorage.getItem('mockPatients') || '[]');
        const filteredPatients = patients.filter(p => p.id !== id);
        
        if (filteredPatients.length === patients.length) {
            throw new Error('Patient not found');
        }
        
        localStorage.setItem('mockPatients', JSON.stringify(filteredPatients));
        return true;
    }
};

// Common headers for API requests
const getHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
    }
    return response.json();
};

// This function attempts to call the actual API but falls back to mock if it fails
const safeApiCall = async (apiCall, mockImplementation) => {
    try {
        return await apiCall();
    } catch (error) {
        console.warn('API call failed, using mock implementation', error);
        return mockImplementation();
    }
};

export const authApi = {
    login: async (credentials) => {
        try {
            console.log("Attempting to login with data:", credentials);
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Login failed with status ${response.status}:`, errorText);
                
                if (response.status === 403) {
                    throw new Error("Login failed: Invalid credentials or access denied");
                }
                
                throw new Error(`Login failed with status ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Login successful:", data);
            
            // Store authentication data
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            return data;
        } catch (error) {
            console.error('Login failed:', error.message);
            
            // Fall back to mock implementation for development
            if (process.env.NODE_ENV === 'development' || true) { // Force mock for now
                console.log("Falling back to mock login implementation");
                
                // Check mock database for credentials
                let foundUser = null;
                
                if (credentials.role === 'ADMIN') {
                    foundUser = mockDb.findAdminByEmail(credentials.email);
                } else if (credentials.role === 'DOCTOR') {
                    foundUser = mockDb.findDoctorByEmail(credentials.email);
                } else if (credentials.role === 'PATIENT') {
                    foundUser = mockDb.findPatientByEmail(credentials.email);
                }
                
                if (!foundUser) {
                    throw new Error("Invalid email or user not found");
                }
                
                // In a real app, we'd verify the password with encryption
                // For mock purposes, let's assume all passwords are valid here
                
                // Create mock login response
                const mockResponse = {
                    token: 'mock_jwt_token_' + Date.now(),
                    email: foundUser.email,
                    role: credentials.role,
                    userId: foundUser.id
                };
                
                console.log("Created mock login response:", mockResponse);
                
                // Store authentication data
                localStorage.setItem('token', mockResponse.token);
                localStorage.setItem('userRole', mockResponse.role);
                localStorage.setItem('userData', JSON.stringify({
                    id: mockResponse.userId,
                    email: mockResponse.email,
                    role: mockResponse.role
                }));
                
                return mockResponse;
            }
            
            throw error;
        }
    },
    
    register: async (userDetails, userType) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register/${userType.toLowerCase()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
                body: JSON.stringify(userDetails)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Registration failed:', error.message);
            throw error;
        }
    },
    
    // Add specific registration methods for each user type
    registerPatient: async (patientData) => {
        return authApi.register(patientData, 'patient');
    },
    
    registerDoctor: async (doctorData) => {
        return authApi.register(doctorData, 'doctor');
    },

    registerAdmin: async (adminData) => {
        try {
            console.log("Attempting to register admin with data:", adminData);
        const response = await fetch(`${API_BASE_URL}/auth/register/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adminData)
        });
        
        if (!response.ok) {
                const errorText = await response.text();
                console.error(`Admin registration failed with status ${response.status}:`, errorText);
                
                if (response.status === 403) {
                    throw new Error("Registration not permitted: Insufficient privileges or access denied");
                }
                
                throw new Error(`Registration failed with status ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Admin registration successful:", data);
            return data;
        } catch (error) {
            console.error('Admin registration error:', error);
            
            // Fall back to mock implementation for development
            if (process.env.NODE_ENV === 'development' || true) { // Force mock for now
                console.log("Falling back to mock implementation");
                const savedAdmin = mockDb.saveAdmin(adminData);
                
                // Create a mock login response similar to what the backend would return
                const mockResponse = {
                    token: 'mock_jwt_token_' + Date.now(),
                    email: savedAdmin.email,
                    role: 'ADMIN',
                    userId: savedAdmin.id
                };
                
                console.log("Created mock login response:", mockResponse);
                return mockResponse;
            }
            
            throw error;
        }
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
    }
};

export const doctorApi = {
    getAllDoctors: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to fetch doctors:', error.message);
            // Fall back to mock implementation for development
            console.log('Using mock implementation for doctors');
            return mockDb.getAllDoctors();
        }
    },
    
    searchDoctors: async (searchQuery, specialization = null) => {
        try {
            // Build the search URL with query parameters
            let searchUrl = `${API_BASE_URL}/doctors/search?query=${encodeURIComponent(searchQuery || '')}`;
            if (specialization) {
                searchUrl += `&specialization=${encodeURIComponent(specialization)}`;
            }
            
            const response = await fetch(searchUrl, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to search doctors:', error.message);
            // Fall back to mock implementation for development
            console.log('Using mock implementation for doctor search');
            
            // Get all doctors from local storage or use getAllDoctors()
            const allDoctors = await mockDb.getAllDoctors();
            
            // Filter doctors based on search criteria
            return allDoctors.filter(doctor => {
                const matchesSearch = !searchQuery || 
                    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (doctor.specialization && doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (doctor.email && doctor.email.toLowerCase().includes(searchQuery.toLowerCase()));
                
                const matchesSpecialization = !specialization || 
                    doctor.specialization === specialization;
                
                return matchesSearch && matchesSpecialization;
            });
        }
    },
    
    getDoctorById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch doctor ${id}:`, error.message);
            throw error;
        }
    },
    
    getDoctorProfile: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/profile/${id}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch doctor profile ${id}:`, error.message);
            // Return mock doctor profile data
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const mockDoctors = JSON.parse(localStorage.getItem('mockDoctors') || '[]');
            const doctor = mockDoctors.find(d => d.id === id);
            
            if (doctor) {
                return doctor;
            }
            
            // Return default mock doctor data
            return {
                id: id || userData.id || 'doctor_default',
                name: "Dr. John Smith",
                email: userData.email || "doctor@example.com",
                specialization: "Cardiology",
                experience: "10 years",
                qualification: "MD, PhD",
                status: "ACTIVE",
                phoneNumber: "+1234567890",
                address: "123 Medical Center, New York, NY",
                bio: "Experienced cardiologist specializing in preventive care and cardiac health."
            };
        }
    },
    
    createDoctor: async (doctorData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(doctorData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to create doctor:', error.message);
            throw error;
        }
    },
    
    updateDoctor: async (id, doctorData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(doctorData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to update doctor ${id}:`, error.message);
            throw error;
        }
    },
    
    updateDoctorStatus: async (id, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${id}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status })
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to update doctor status ${id}:`, error.message);
            throw error;
        }
    },
    
    deleteDoctor: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to delete doctor ${id}:`, error.message);
            throw error;
        }
    },
    
    getDoctorAvailability: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${id}/availability`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch doctor availability ${id}:`, error.message);
            
            // Check if we have stored availability data
            const storedAvailability = localStorage.getItem(`doctor_${id}_availability`);
            if (storedAvailability) {
                return JSON.parse(storedAvailability);
            }
            
            // Return default mock availability data
            return {
                monday: { start: '09:00', end: '17:00', isAvailable: true },
                tuesday: { start: '09:00', end: '17:00', isAvailable: true },
                wednesday: { start: '09:00', end: '17:00', isAvailable: true },
                thursday: { start: '09:00', end: '17:00', isAvailable: true },
                friday: { start: '09:00', end: '17:00', isAvailable: true },
                saturday: { start: '10:00', end: '14:00', isAvailable: true },
                sunday: { start: '00:00', end: '00:00', isAvailable: false }
            };
        }
    },
    
    updateDoctorAvailability: async (id, availabilityData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${id}/availability`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(availabilityData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to update doctor availability ${id}:`, error.message);
            // Fall back to mock implementation for development
            console.log('Using mock implementation for updating doctor availability');
            
            // Store the availability data in localStorage
            localStorage.setItem(`doctor_${id}_availability`, JSON.stringify(availabilityData));
            
            // Return the updated availability data
            return availabilityData;
        }
    },
    
    searchPatients: async (doctorId, searchQuery) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/patients/search?query=${encodeURIComponent(searchQuery)}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to search patients for doctor ${doctorId}:`, error.message);
            // Fall back to mock implementation for development
            console.log('Using mock implementation for patient search');
            
            // Get mock patients from local storage or use default empty array
            const allPatients = JSON.parse(localStorage.getItem('mockPatients') || '[]');
            
            // If search query is empty, return all patients
            if (!searchQuery) {
                return allPatients;
            }
            
            // Filter patients based on search query
            const query = searchQuery.toLowerCase();
            return allPatients.filter(patient => 
                patient.name.toLowerCase().includes(query) || 
                patient.id.toLowerCase().includes(query) ||
                (patient.email && patient.email.toLowerCase().includes(query))
            );
        }
    },
    
    getDoctorNotifications: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${id}/notifications`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch doctor notifications ${id}:`, error.message);
            return [];  // Return empty array to prevent UI errors
        }
    },
    
    getDoctorPatients: async (doctorId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/patients`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Error fetching doctor patients:', error.message);
            console.log('Using mock patient data...');
            // Return mock data for development
            return [
                { id: 'P001', name: 'John Doe', age: 35, gender: 'Male', email: 'john.doe@example.com', phone: '555-123-4567', address: '123 Main St, Anytown', bloodGroup: 'O+', lastVisit: '2023-04-15', status: 'ACTIVE' },
                { id: 'P023', name: 'Mary Johnson', age: 42, gender: 'Female', email: 'mary.j@example.com', phone: '555-987-6543', address: '456 Oak Ave, Somecity', bloodGroup: 'A-', lastVisit: '2023-04-01', status: 'ACTIVE' },
                { id: 'P045', name: 'Robert Smith', age: 28, gender: 'Male', email: 'robert.s@example.com', phone: '555-456-7890', address: '789 Pine Rd, Othertown', bloodGroup: 'B+', lastVisit: '2023-03-22', status: 'INACTIVE' },
                { id: 'P067', name: 'Sarah Williams', age: 50, gender: 'Female', email: 'sarah.w@example.com', phone: '555-246-8135', address: '321 Cedar Ln, Newcity', bloodGroup: 'AB+', lastVisit: '2023-04-10', status: 'ACTIVE' },
                { id: 'P089', name: 'Michael Brown', age: 45, gender: 'Male', email: 'michael.b@example.com', phone: '555-369-2580', address: '654 Maple Dr, Oldtown', bloodGroup: 'O-', lastVisit: '2023-03-18', status: 'ACTIVE' }
            ];
        }
    },

    // Get all medical reports for a doctor
    getDoctorReports: async (doctorId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/reports`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error fetching doctor reports:', error.message);
            console.log('Using mock report data...');
            
            // Check if we have any saved reports in localStorage
            const savedReports = localStorage.getItem('doctorReports');
            if (savedReports) {
                return JSON.parse(savedReports);
            }
            
            // Return mock data for development
            return [
                { id: 'R001', patientId: 'P001', patientName: 'John Doe', reportType: 'blood-test', reportDate: '2023-04-21', status: 'COMPLETED', reportContent: 'Blood test results showing normal ranges for all parameters.' },
                { id: 'R002', patientId: 'P023', patientName: 'Mary Johnson', reportType: 'imaging', reportDate: '2023-04-19', status: 'COMPLETED', reportContent: 'X-ray imaging of the chest showing no abnormalities.' },
                { id: 'R003', patientId: 'P045', patientName: 'Robert Smith', reportType: 'consultation', reportDate: '2023-04-15', status: 'PENDING', reportContent: 'Patient reported mild fever and cough. Prescribed rest and medication.' },
            ];
        }
    },

    // Create a new medical report
    createMedicalReport: async (reportData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/medical-reports`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(reportData)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error creating medical report:', error.message);
            console.log('Using mock implementation for report creation...');
            
            // Get current reports from localStorage or create empty array
            const currentReports = JSON.parse(localStorage.getItem('doctorReports') || '[]');
            
            // Create a new report with a generated ID
            const newReport = {
                ...reportData,
                id: `R${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };
            
            // Add to reports and save back to localStorage
            const updatedReports = [...currentReports, newReport];
            localStorage.setItem('doctorReports', JSON.stringify(updatedReports));
            
            return newReport;
        }
    },

    // Update an existing medical report
    updateMedicalReport: async (reportId, reportData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/medical-reports/${reportId}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(reportData)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error updating medical report:', error.message);
            console.log('Using mock implementation for report update...');
            
            // Get current reports from localStorage
            const currentReports = JSON.parse(localStorage.getItem('doctorReports') || '[]');
            
            // Find and update the report
            const updatedReports = currentReports.map(report => {
                if (report.id === reportId) {
                    return { ...report, ...reportData, updatedAt: new Date().toISOString() };
                }
                return report;
            });
            
            // Save back to localStorage
            localStorage.setItem('doctorReports', JSON.stringify(updatedReports));
            
            // Return the updated report
            return updatedReports.find(report => report.id === reportId);
        }
    }
};

export const patientApi = {
    getAllPatients: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to fetch patients:', error.message);
            throw error;
        }
    },
    
    getPatientById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch patient ${id}:`, error.message);
            throw error;
        }
    },
    
    getPatientProfile: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/profile/${id}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch patient profile ${id}:`, error.message);
            throw error;
        }
    },
    
    createPatient: async (patientData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(patientData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to create patient:', error.message);
            throw error;
        }
    },
    
    updatePatient: async (id, patientData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(patientData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to update patient ${id}:`, error.message);
            throw error;
        }
    },
    
    deletePatient: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to delete patient ${id}:`, error.message);
            throw error;
        }
    }
};

export const appointmentApi = {
    getAllAppointments: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to fetch appointments:', error.message);
            throw error;
        }
    },
    
    getAppointmentById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch appointment ${id}:`, error.message);
            throw error;
        }
    },
    
    getAppointmentsByDoctorId: async (doctorId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/doctor/${doctorId}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch appointments for doctor ${doctorId}:`, error.message);
            // Fall back to mock implementation for development
            const allAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
            return allAppointments.filter(appointment => appointment.doctorId === doctorId);
        }
    },
    
    getAppointmentsByPatientId: async (patientId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/patient/${patientId}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch appointments for patient ${patientId}:`, error.message);
            // Fall back to mock implementation for development
            console.log('Using mock implementation for patient appointments');
            const allAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
            return allAppointments.filter(appointment => appointment.patientId === patientId);
        }
    },
    
    createAppointment: async (appointmentData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(appointmentData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to create appointment:', error.message);
            // Fall back to mock implementation for development
            console.log('Using mock implementation for creating appointment');
            
            // Get current appointments
            const appointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
            
            // Create new appointment with an ID
            const newAppointment = {
                ...appointmentData,
                id: 'appointment_' + Date.now(),
                createdAt: new Date().toISOString()
            };
            
            // Add to appointments and save
            appointments.push(newAppointment);
            localStorage.setItem('mockAppointments', JSON.stringify(appointments));
            
            return newAppointment;
        }
    },
    
    updateAppointment: async (id, appointmentData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(appointmentData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to update appointment ${id}:`, error.message);
            throw error;
        }
    },
    
    updateAppointmentStatus: async (id, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status })
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to update appointment status ${id}:`, error.message);
            // Fall back to mock implementation for development
            console.log('Using mock implementation for updating appointment status');
            
            // Get current appointments
            const appointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
            
            // Find the appointment and update its status
            const updatedAppointments = appointments.map(appointment => 
                appointment.id === id ? { ...appointment, status } : appointment
            );
            
            // Save back to localStorage
            localStorage.setItem('mockAppointments', JSON.stringify(updatedAppointments));
            
            // Return the updated appointment
            return updatedAppointments.find(appointment => appointment.id === id);
        }
    },
    
    deleteAppointment: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to delete appointment ${id}:`, error.message);
            throw error;
        }
    }
};

export const adminApi = {
    // Doctor management endpoints
    getAllDoctors: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/doctors`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to fetch doctors:', error.message);
            // Fallback to mock implementation for development
            return mockDb.getAllDoctors();
        }
    },
    
    getDoctorById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/doctors/${id}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch doctor ${id}:`, error.message);
            // Fallback to mock implementation for development
            return mockDb.getDoctorById(id);
        }
    },
    
    createDoctor: async (doctorData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/doctors`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(doctorData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to create doctor:', error.message);
            // Fallback to mock implementation for development
            return mockDb.saveDoctor(doctorData);
        }
    },
    
    updateDoctor: async (id, doctorData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/doctors/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(doctorData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to update doctor ${id}:`, error.message);
            // Fallback to mock implementation for development
            return mockDb.updateDoctor(id, doctorData);
        }
    },
    
    updateDoctorStatus: async (id, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/doctors/${id}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status })
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to update doctor status ${id}:`, error.message);
            // Fallback to mock implementation for development
            return mockDb.updateDoctorStatus(id, status);
        }
    },
    
    deleteDoctor: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/doctors/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to delete doctor ${id}:`, error.message);
            // Fallback to mock implementation for development
            return mockDb.deleteDoctor(id);
        }
    },
    
    // Search functions for admin
    searchDoctors: async (searchQuery, filters = {}) => {
        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            if (searchQuery) {
                queryParams.append('query', searchQuery);
            }
            if (filters.specialization) {
                queryParams.append('specialization', filters.specialization);
            }
            if (filters.status) {
                queryParams.append('status', filters.status);
            }
            
            const response = await fetch(`${API_BASE_URL}/admin/doctors/search?${queryParams.toString()}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to search doctors:', error.message);
            // Fallback to mock implementation
            const allDoctors = await mockDb.getAllDoctors();
            
            return allDoctors.filter(doctor => {
                const matchesSearch = !searchQuery || 
                    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (doctor.specialization && doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (doctor.email && doctor.email.toLowerCase().includes(searchQuery.toLowerCase()));
                
                const matchesSpecialization = !filters.specialization || 
                    doctor.specialization === filters.specialization;
                
                const matchesStatus = !filters.status || filters.status === 'all' || 
                    doctor.status === filters.status;
                
                return matchesSearch && matchesSpecialization && matchesStatus;
            });
        }
    },
    
    searchPatients: async (searchQuery, filters = {}) => {
        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            if (searchQuery) {
                queryParams.append('query', searchQuery);
            }
            if (filters.bloodGroup) {
                queryParams.append('bloodGroup', filters.bloodGroup);
            }
            if (filters.gender) {
                queryParams.append('gender', filters.gender);
            }
            
            const response = await fetch(`${API_BASE_URL}/admin/patients/search?${queryParams.toString()}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to search patients:', error.message);
            // Fallback to mock implementation
            const allPatients = await mockDb.getAllPatients();
            
            return allPatients.filter(patient => {
                const matchesSearch = !searchQuery || 
                    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (patient.email && patient.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (patient.phoneNumber && patient.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()));
                
                const matchesBloodGroup = !filters.bloodGroup || 
                    patient.bloodGroup === filters.bloodGroup;
                
                const matchesGender = !filters.gender || 
                    patient.gender === filters.gender;
                
                return matchesSearch && matchesBloodGroup && matchesGender;
            });
        }
    },
    
    searchAppointments: async (searchQuery, filters = {}) => {
        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            if (searchQuery) {
                queryParams.append('query', searchQuery);
            }
            if (filters.status && filters.status !== 'all') {
                queryParams.append('status', filters.status);
            }
            if (filters.date) {
                queryParams.append('date', filters.date);
            }
            
            const response = await fetch(`${API_BASE_URL}/admin/appointments/search?${queryParams.toString()}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to search appointments:', error.message);
            // Return empty array if the API fails
            return [];
        }
    },
    
    // Upload file functionality for doctors
    uploadDoctorFile: async (doctorId, file, type) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}/${type}`, {
            method: 'POST',
            headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to upload doctor ${type}:`, error.message);
            // For development, return a mock success response
            return { success: true, fileUrl: URL.createObjectURL(file) };
        }
    },
    
    // Patient management endpoints
    getAllPatients: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/patients`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to fetch patients:', error.message);
            // Fallback to mock implementation for development
            return mockDb.getAllPatients();
        }
    },
    
    getPatientById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/patients/${id}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch patient ${id}:`, error.message);
            // Fallback to mock implementation for development
            return mockDb.getPatientById(id);
        }
    },
    
    createPatient: async (patientData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/patients`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(patientData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to create patient:', error.message);
            // Fallback to mock implementation for development
            return mockDb.savePatient(patientData);
        }
    },
    
    updatePatient: async (id, patientData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/patients/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
            body: JSON.stringify(patientData)
        });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to update patient ${id}:`, error.message);
            // Fallback to mock implementation for development
            return mockDb.updatePatient(id, patientData);
        }
    },
    
    deletePatient: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/patients/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to delete patient ${id}:`, error.message);
            // Fallback to mock implementation for development
            return mockDb.deletePatient(id);
        }
    },
    
    // Upload file functionality for patients
    uploadPatientFile: async (patientId, file, type) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            // Construct the appropriate endpoint based on type
            const endpoint = type === 'profile-picture' 
                ? `${API_BASE_URL}/admin/patients/${patientId}/profile-picture` 
                : `${API_BASE_URL}/admin/patients/${patientId}/medical-records`;
            
            const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to upload patient ${type}:`, error.message);
            // For development, return a mock success response
            return { success: true, fileUrl: URL.createObjectURL(file) };
        }
    },
    
    // Appointment management endpoints
    getAllAppointments: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to fetch appointments:', error.message);
            // Return empty array if API fails
            return [];
        }
    },
    
    getAppointmentById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/appointments/${id}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch appointment ${id}:`, error.message);
            // Return null if API fails
            return null;
        }
    },
    
    createAppointment: async (appointmentData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(appointmentData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to create appointment:', error.message);
            throw error;
        }
    },
    
    updateAppointment: async (id, appointmentData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/appointments/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(appointmentData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to update appointment ${id}:`, error.message);
            throw error;
        }
    },
    
    deleteAppointment: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/appointments/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to delete appointment ${id}:`, error.message);
            throw error;
        }
    }
};

// Add a specific export to fix the import error
export const DoctorProfileModel = {
    getDoctorProfile: doctorApi.getDoctorProfile,
    updateDoctorProfile: doctorApi.updateDoctor
};

// Medical records API
export const medicalRecordsApi = {
    getPatientMedicalHistory: async (patientId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/medical-records/patient/${patientId}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch medical records for patient ${patientId}:`, error.message);
            // Return mock data for development
            return [
                {
                    id: 'med_1',
                    patientId: patientId,
                    doctorId: 'doc_1',
                    doctorName: 'Dr. John Smith',
                    date: '2024-03-10',
                    diagnosis: 'General Checkup',
                    notes: 'Blood pressure: 120/80, Weight: 70kg, All vitals normal',
                    prescriptions: 'None',
                    type: 'Checkup'
                },
                {
                    id: 'med_2',
                    patientId: patientId,
                    doctorId: 'doc_2',
                    doctorName: 'Dr. Lisa Johnson',
                    date: '2024-02-15',
                    diagnosis: 'Dental Examination',
                    notes: 'Routine cleaning and checkup. Minor cavity detected in lower right molar',
                    prescriptions: 'None',
                    type: 'Dental'
                },
                {
                    id: 'med_3',
                    patientId: patientId,
                    doctorId: 'doc_1',
                    doctorName: 'Dr. John Smith',
                    date: '2024-01-05',
                    diagnosis: 'Annual Physical',
                    notes: 'Blood pressure: 118/75, Weight: 71kg, Cholesterol: 180 mg/dL, Blood sugar (fasting): 85 mg/dL. All tests within normal range.',
                    prescriptions: 'None',
                    type: 'Annual Physical'
                }
            ];
        }
    },
    
    searchMedicalRecords: async (patientId, searchQuery) => {
        try {
            const response = await fetch(`${API_BASE_URL}/medical-records/patient/${patientId}/search?query=${encodeURIComponent(searchQuery)}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to search medical records for patient ${patientId}:`, error.message);
            
            // Get all medical records for the patient
            const allRecords = await medicalRecordsApi.getPatientMedicalHistory(patientId);
            
            // If search query is empty, return all records
            if (!searchQuery) {
                return allRecords;
            }
            
            // Filter records based on search query
            const query = searchQuery.toLowerCase();
            return allRecords.filter(record => 
                (record.diagnosis && record.diagnosis.toLowerCase().includes(query)) ||
                (record.notes && record.notes.toLowerCase().includes(query)) ||
                (record.doctorName && record.doctorName.toLowerCase().includes(query)) ||
                (record.type && record.type.toLowerCase().includes(query)) ||
                (record.date && record.date.includes(query))
            );
        }
    },
    
    addMedicalRecord: async (medicalRecordData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/medical-records`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(medicalRecordData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to add medical record:', error.message);
            // Return mock response for development
            return {
                ...medicalRecordData,
                id: `med_${Date.now()}`,
                createdAt: new Date().toISOString()
            };
        }
    }
};

// Reviews API for doctor ratings and feedback
export const reviewsApi = {
    // Get all reviews submitted by a patient
    getPatientReviews: async (patientId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/patient/${patientId}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch reviews for patient ${patientId}:`, error.message);
            
            // Check if we have stored reviews
            const storedReviews = localStorage.getItem(`patient_${patientId}_reviews`);
            if (storedReviews) {
                return JSON.parse(storedReviews);
            }
            
            // Return mock data for development
            return [
                {
                    id: 'rev_001',
                    patientId: patientId,
                    doctorId: 'doctor_1',
                    doctorName: 'Dr. Sarah Johnson',
                    doctorSpecialty: 'Cardiology',
                    rating: 5,
                    review: 'Dr. Johnson was incredibly thorough and took time to explain my condition in detail. Very satisfied with my visit.',
                    isAnonymous: false,
                    createdAt: '2024-04-05T14:30:00Z',
                    lastAppointmentDate: '2024-04-01T10:00:00Z'
                },
                {
                    id: 'rev_002',
                    patientId: patientId,
                    doctorId: 'doctor_2',
                    doctorName: 'Dr. Michael Chen',
                    doctorSpecialty: 'Dermatology',
                    rating: 4,
                    review: 'Good experience overall. Dr. Chen was knowledgeable and provided helpful advice for my skin condition.',
                    isAnonymous: true,
                    createdAt: '2024-03-15T11:45:00Z',
                    lastAppointmentDate: '2024-03-10T09:15:00Z'
                }
            ];
        }
    },
    
    // Get all reviews for a specific doctor
    getDoctorReviews: async (doctorId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/doctor/${doctorId}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch reviews for doctor ${doctorId}:`, error.message);
            
            // Check if we have stored reviews
            const storedReviews = localStorage.getItem(`doctor_${doctorId}_reviews`);
            if (storedReviews) {
                return JSON.parse(storedReviews);
            }
            
            // Return empty array to prevent UI errors
            return [];
        }
    },
    
    // Submit a new review
    createReview: async (reviewData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(reviewData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to create review:', error.message);
            
            // Store in localStorage for mock functionality
            const { patientId, doctorId } = reviewData;
            
            // Create a new review with ID and timestamps
            const newReview = {
                ...reviewData,
                id: `rev_${Date.now()}`,
                createdAt: new Date().toISOString()
            };
            
            // Update patient reviews in localStorage
            const patientReviews = JSON.parse(localStorage.getItem(`patient_${patientId}_reviews`) || '[]');
            patientReviews.push(newReview);
            localStorage.setItem(`patient_${patientId}_reviews`, JSON.stringify(patientReviews));
            
            // Update doctor reviews in localStorage
            const doctorReviews = JSON.parse(localStorage.getItem(`doctor_${doctorId}_reviews`) || '[]');
            doctorReviews.push(newReview);
            localStorage.setItem(`doctor_${doctorId}_reviews`, JSON.stringify(doctorReviews));
            
            return newReview;
        }
    },
    
    // Update an existing review
    updateReview: async (reviewId, reviewData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(reviewData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to update review ${reviewId}:`, error.message);
            
            // Get patient ID and doctor ID from reviewData
            const { patientId, doctorId } = reviewData;
            
            // Update review in patient's reviews
            if (patientId) {
                const patientReviews = JSON.parse(localStorage.getItem(`patient_${patientId}_reviews`) || '[]');
                const updatedPatientReviews = patientReviews.map(review => 
                    review.id === reviewId ? { ...review, ...reviewData, updatedAt: new Date().toISOString() } : review
                );
                localStorage.setItem(`patient_${patientId}_reviews`, JSON.stringify(updatedPatientReviews));
            }
            
            // Update review in doctor's reviews
            if (doctorId) {
                const doctorReviews = JSON.parse(localStorage.getItem(`doctor_${doctorId}_reviews`) || '[]');
                const updatedDoctorReviews = doctorReviews.map(review => 
                    review.id === reviewId ? { ...review, ...reviewData, updatedAt: new Date().toISOString() } : review
                );
                localStorage.setItem(`doctor_${doctorId}_reviews`, JSON.stringify(updatedDoctorReviews));
            }
            
            // Return the updated review
            return { ...reviewData, id: reviewId, updatedAt: new Date().toISOString() };
        }
    },
    
    // Delete a review
    deleteReview: async (reviewId, patientId, doctorId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to delete review ${reviewId}:`, error.message);
            
            // Remove from patient's reviews
            if (patientId) {
                const patientReviews = JSON.parse(localStorage.getItem(`patient_${patientId}_reviews`) || '[]');
                const filteredPatientReviews = patientReviews.filter(review => review.id !== reviewId);
                localStorage.setItem(`patient_${patientId}_reviews`, JSON.stringify(filteredPatientReviews));
            }
            
            // Remove from doctor's reviews
            if (doctorId) {
                const doctorReviews = JSON.parse(localStorage.getItem(`doctor_${doctorId}_reviews`) || '[]');
                const filteredDoctorReviews = doctorReviews.filter(review => review.id !== reviewId);
                localStorage.setItem(`doctor_${doctorId}_reviews`, JSON.stringify(filteredDoctorReviews));
            }
            
            // Return success
            return { success: true };
        }
    },
    
    // Get patient's past doctors (doctors they've had appointments with)
    getPatientPastDoctors: async (patientId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}/past-doctors`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch past doctors for patient ${patientId}:`, error.message);
            
            // Create mock data for past doctors
            return [
                {
                    id: 'doctor_1',
                    name: 'Dr. Sarah Johnson',
                    specialty: 'Cardiology',
                    lastAppointmentDate: '2024-04-01T10:00:00Z'
                },
                {
                    id: 'doctor_2',
                    name: 'Dr. Michael Chen',
                    specialty: 'Dermatology',
                    lastAppointmentDate: '2024-03-10T09:15:00Z'
                },
                {
                    id: 'doctor_3',
                    name: 'Dr. Emily Wilson',
                    specialty: 'Neurology',
                    lastAppointmentDate: '2024-02-22T14:30:00Z'
                },
                {
                    id: 'doctor_4',
                    name: 'Dr. James Rodriguez',
                    specialty: 'Orthopedics',
                    lastAppointmentDate: '2024-01-15T11:00:00Z'
                }
            ];
        }
    }
};

// ... other API functions like medical records, etc. 