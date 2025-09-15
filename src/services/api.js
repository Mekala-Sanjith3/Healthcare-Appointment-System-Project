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
    },
    
    // Add sample doctor data if none exists
    initializeDoctorsMockData: () => {
        const doctors = JSON.parse(localStorage.getItem('mockDoctors') || '[]');
        
        if (doctors.length === 0) {
            const sampleDoctors = [
                {
                    id: 'doctor_1',
                    name: 'Dr. Sarah Johnson',
                    first_name: 'Sarah',
                    last_name: 'Johnson',
                    email: 'sarah.johnson@healthcare.com',
                    specialty: 'Cardiology',
                    specialization: 'Cardiology',
                    qualification: 'MD, Cardiology',
                    experience: '14 years',
                    clinic_address: '123 Medical Center, New York, NY',
                    status: 'ACTIVE',
                    phone_number: '555-123-4567',
                    profile_picture: null,
                    role: 'DOCTOR',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'doctor_2',
                    name: 'Dr. Michael Chen',
                    first_name: 'Michael',
                    last_name: 'Chen',
                    email: 'michael.chen@healthcare.com',
                    specialty: 'Dermatology',
                    specialization: 'Dermatology',
                    qualification: 'MD, Dermatology',
                    experience: '8 years',
                    clinic_address: '456 Health Plaza, Los Angeles, CA',
                    status: 'ACTIVE',
                    phone_number: '555-987-6543',
                    profile_picture: null,
                    role: 'DOCTOR',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'doctor_3',
                    name: 'Dr. Emily Rogers',
                    first_name: 'Emily',
                    last_name: 'Rogers',
                    email: 'emily.rogers@healthcare.com',
                    specialty: 'Neurology',
                    specialization: 'Neurology',
                    qualification: 'MD, Neurology, PhD',
                    experience: '12 years',
                    clinic_address: '789 Brain Center, Chicago, IL',
                    status: 'ACTIVE',
                    phone_number: '555-456-7890',
                    profile_picture: null,
                    role: 'DOCTOR',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'doctor_4',
                    name: 'Dr. James Wilson',
                    first_name: 'James',
                    last_name: 'Wilson',
                    email: 'james.wilson@healthcare.com',
                    specialty: 'Orthopedics',
                    specialization: 'Orthopedics',
                    qualification: 'MD, Orthopedic Surgery',
                    experience: '15 years',
                    clinic_address: '567 Bone & Joint Institute, Boston, MA',
                    status: 'ACTIVE',
                    phone_number: '555-789-0123',
                    profile_picture: null,
                    role: 'DOCTOR',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'doctor_5',
                    name: 'Dr. Sophia Martinez',
                    first_name: 'Sophia',
                    last_name: 'Martinez',
                    email: 'sophia.martinez@healthcare.com',
                    specialty: 'Pediatrics',
                    specialization: 'Pediatrics',
                    qualification: 'MD, Pediatrics',
                    experience: '10 years',
                    clinic_address: '890 Children\'s Health Center, Miami, FL',
                    status: 'ACTIVE',
                    phone_number: '555-234-5678',
                    profile_picture: null,
                    role: 'DOCTOR',
                    createdAt: new Date().toISOString()
                }
            ];
            
            localStorage.setItem('mockDoctors', JSON.stringify(sampleDoctors));
            return sampleDoctors;
        }
        
        return doctors;
    },
    
    searchDoctors: (query, options = {}) => {
        const doctors = mockDb.initializeDoctorsMockData();
        let filtered = [...doctors];
        
        // Filter by name
        if (query && query.trim() !== '') {
            const searchTerm = query.toLowerCase();
            filtered = filtered.filter(doc => 
                doc.name.toLowerCase().includes(searchTerm) || 
                doc.first_name.toLowerCase().includes(searchTerm) || 
                doc.last_name.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter by specialty/specialization
        if (options.specialty && options.specialty.trim() !== '') {
            const specialty = options.specialty.toLowerCase();
            filtered = filtered.filter(doc => 
                (doc.specialty && doc.specialty.toLowerCase().includes(specialty)) || 
                (doc.specialization && doc.specialization.toLowerCase().includes(specialty))
            );
        }
        
        // Filter by location
        if (options.location && options.location.trim() !== '') {
            const location = options.location.toLowerCase();
            filtered = filtered.filter(doc => 
                doc.clinic_address && doc.clinic_address.toLowerCase().includes(location)
            );
        }
        
        // Filter by availability date (we would need to add availability data to mock doctors)
        if (options.availableDate) {
            // Mock implementation for available date filter
            // In a real app, we would check the doctor's schedule here
        }
        
        // Basic pagination
        const page = options.page || 1;
        const limit = options.limit || 10;
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedResults = filtered.slice(start, end);
        
        return {
            data: paginatedResults,
            meta: {
                total: filtered.length,
                page: page,
                limit: limit,
                totalPages: Math.ceil(filtered.length / limit)
            }
        };
    },
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
                
                // Check if captcha token is provided
                if (!credentials.captchaToken) {
                    throw new Error("CAPTCHA verification required");
                }
                
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
                // For mock purposes, we need to check if password matches
                if (credentials.password !== foundUser.password) {
                    throw new Error("Invalid credentials: Password is incorrect");
                }
                
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
            // Make sure to initialize mock data
            return mockDb.initializeDoctorsMockData();
        }
    },
    
    // Add new method to search doctors with filters
    getDoctorsWithFilters: async (filters = {}) => {
        try {
            // Build the search URL with query parameters
            const params = new URLSearchParams();
            
            if (filters.name) params.append('name', filters.name);
            if (filters.specialty) params.append('specialty', filters.specialty);
            if (filters.location) params.append('location', filters.location);
            if (filters.availableDate) params.append('availableDate', filters.availableDate);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);
            
            const searchUrl = `${API_BASE_URL}/doctors?${params.toString()}`;
            
            const response = await fetch(searchUrl, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error('Failed to fetch doctors with filters:', error.message);
            
            // Fall back to mock implementation
            return mockDb.searchDoctors(filters.name, {
                specialty: filters.specialty,
                location: filters.location,
                availableDate: filters.availableDate,
                page: filters.page,
                limit: filters.limit
            });
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
    
    getAvailableTimeSlots: async (doctorId, date) => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/available/${doctorId}/${date}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch available time slots for doctor ${doctorId} on ${date}:`, error.message);
            console.log('Using mock implementation for available time slots');
            
            // Generate mock time slots (9 AM to 5 PM, 30-minute intervals)
            const mockTimeSlots = [];
            for (let hour = 9; hour < 17; hour++) {
                mockTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
                mockTimeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
            }
            
            // Maybe randomly remove some slots to simulate booked appointments
            return mockTimeSlots.filter(() => Math.random() > 0.3); // Randomly keep ~70% of slots
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
    
    getPatientsWithAppointments: async (doctorId) => {
        try {
            // First, get all appointments for this doctor
            const appointments = await appointmentApi.getAppointmentsByDoctorId(doctorId);
            
            if (!appointments || appointments.length === 0) {
                return [];
            }
            
            // Extract unique patient IDs from appointments
            const patientIds = new Set();
            const patientsMap = new Map();
            
            appointments.forEach(appointment => {
                if (appointment.patientId && !patientIds.has(appointment.patientId)) {
                    patientIds.add(appointment.patientId);
                    
                    // Create a simplified patient object
                    patientsMap.set(appointment.patientId, {
                        id: appointment.patientId,
                        name: appointment.patientName || 'Unknown Patient',
                        // Get the most recent appointment date for this patient
                        lastVisit: appointment.appointmentDate || 'N/A'
                    });
                }
            });
            
            // Convert the map values to an array
            return Array.from(patientsMap.values());
        } catch (error) {
            console.error('Error fetching patients with appointments:', error.message);
            return [];
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
            
            const appointments = await handleResponse(response);
            
            // Ensure consistent field naming for frontend components
            return appointments.map(appointment => ({
                id: appointment.id,
                patientId: appointment.patient_id,
                patientName: appointment.patient_name,
                doctorId: appointment.doctor_id,
                doctorName: appointment.doctor_name,
                appointmentDate: appointment.date,
                appointmentTime: appointment.time,
                appointmentType: appointment.type,
                status: appointment.status,
                notes: appointment.notes,
                problem: appointment.notes?.split('Problem:')[1]?.split('\n\n')[0]?.trim() || '',
                createdAt: appointment.created_at
            }));
        } catch (error) {
            console.error(`Failed to fetch appointments for doctor ${doctorId}:`, error.message);
            // Fall back to mock implementation for development
            console.log('Using mock implementation for doctor appointments');
            
            // Get all appointments from localStorage
            const allAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
            
            // Filter to get only this doctor's appointments and deduplicate based on ID
            const appointmentMap = new Map();
            allAppointments.forEach(appointment => {
                if ((appointment.doctorId === doctorId || appointment.doctor_id === doctorId) && !appointmentMap.has(appointment.id)) {
                    appointmentMap.set(appointment.id, appointment);
                }
            });
            
            return Array.from(appointmentMap.values());
        }
    },
    
    getAppointmentsByPatientId: async (patientId) => {
        try {
            console.log(`Fetching appointments for patient ID: ${patientId}`);
            const response = await fetch(`${API_BASE_URL}/appointments/patient/${patientId}`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                console.error(`Error response from server: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to fetch appointments: ${response.statusText}`);
            }
            
            const appointments = await response.json();
            console.log(`Successfully retrieved ${appointments.length} appointments for patient ${patientId}`);
            
            // Ensure consistent field naming for frontend components
            const formattedAppointments = appointments.map(appointment => ({
                id: appointment.id,
                patientId: appointment.patient_id,
                patientName: appointment.patient_name || '',
                doctorId: appointment.doctor_id,
                doctorName: appointment.doctor_name || '',
                doctorSpecialty: appointment.specialty || '',
                appointmentDate: appointment.date,
                appointmentTime: appointment.time,
                appointmentType: appointment.type,
                status: appointment.status,
                notes: appointment.notes,
                problem: appointment.notes?.split('Problem:')[1]?.split('\n\n')[0]?.trim() || '',
                createdAt: appointment.created_at
            }));
            
            // Store in localStorage as a cache/backup
            localStorage.setItem(`patient_${patientId}_appointments`, JSON.stringify(formattedAppointments));
            
            return formattedAppointments;
        } catch (error) {
            console.error(`Failed to fetch appointments for patient ${patientId}:`, error.message);
            
            // Try to get cached appointments from localStorage first
            const cachedAppointments = localStorage.getItem(`patient_${patientId}_appointments`);
            if (cachedAppointments) {
                console.log(`Retrieved ${JSON.parse(cachedAppointments).length} cached appointments from localStorage`);
                return JSON.parse(cachedAppointments);
            }
            
            // Fall back to mock implementation for development
            console.log('Using mock implementation for patient appointments');
            const allAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
            
            // Filter to get only this patient's appointments and deduplicate based on ID
            const appointmentMap = new Map();
            allAppointments.forEach(appointment => {
                if ((appointment.patientId === patientId || appointment.patient_id === patientId) && !appointmentMap.has(appointment.id)) {
                    appointmentMap.set(appointment.id, appointment);
                }
            });
            
            const patientAppointments = Array.from(appointmentMap.values());
            
            // Cache these appointments too
            localStorage.setItem(`patient_${patientId}_appointments`, JSON.stringify(patientAppointments));
            
            return patientAppointments;
        }
    },
    
    createAppointment: async (appointmentData) => {
        try {
            console.log('Creating appointment with data:', appointmentData);
            
            // Format the appointment data to match backend expectations
            const formattedData = {
                patientId: appointmentData.patientId,
                doctorId: appointmentData.doctorId,
                appointmentDate: appointmentData.appointmentDate,
                appointmentTime: appointmentData.appointmentTime,
                appointmentType: appointmentData.appointmentType,
                status: 'PENDING',
                notes: `Problem: ${appointmentData.problem}${appointmentData.notes ? '\n\nAdditional notes: ' + appointmentData.notes : ''}`,
                doctorName: appointmentData.doctorName,
                doctorSpecialization: appointmentData.doctorSpecialization,
                patientName: appointmentData.patientName,
                patientDetails: appointmentData.patientDetails
            };
            
            // Send to the backend API endpoint
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formattedData)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Appointment creation failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                throw new Error(errorData.message || 'Failed to create appointment');
            }
            
            const responseData = await response.json();
            console.log('Appointment created successfully:', responseData);
            
            // Format response to match frontend expectations
            const formattedAppointment = {
                id: responseData.id || `app_${Date.now()}`,
                patientId: responseData.patientId || formattedData.patientId,
                patientName: responseData.patientName || formattedData.patientName,
                doctorId: responseData.doctorId || formattedData.doctorId,
                doctorName: responseData.doctorName || formattedData.doctorName,
                doctorSpecialization: responseData.doctorSpecialization || formattedData.doctorSpecialization,
                appointmentDate: responseData.appointmentDate || formattedData.appointmentDate,
                appointmentTime: responseData.appointmentTime || formattedData.appointmentTime,
                appointmentType: responseData.appointmentType || formattedData.appointmentType,
                status: responseData.status || 'PENDING',
                notes: responseData.notes || formattedData.notes,
                problem: appointmentData.problem,
                patientDetails: appointmentData.patientDetails,
                createdAt: responseData.createdAt || new Date().toISOString()
            };
            
            // Update localStorage for both doctor and patient views
            const currentAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
            
            // Remove any potential duplicates with the same ID
            const filteredAppointments = currentAppointments.filter(app => app.id !== formattedAppointment.id);
            
            // Add the new appointment
            filteredAppointments.push(formattedAppointment);
            localStorage.setItem('mockAppointments', JSON.stringify(filteredAppointments));
            
            // Update patient-specific appointment cache
            const patientId = formattedAppointment.patientId;
            const patientAppointments = JSON.parse(localStorage.getItem(`patient_${patientId}_appointments`) || '[]');
            const filteredPatientAppointments = patientAppointments.filter(app => app.id !== formattedAppointment.id);
            filteredPatientAppointments.push(formattedAppointment);
            localStorage.setItem(`patient_${patientId}_appointments`, JSON.stringify(filteredPatientAppointments));
            
            return formattedAppointment;
        } catch (error) {
            console.error('Failed to create appointment:', error);
            
            // Fall back to mock implementation for development
            console.log('Using mock implementation for appointment creation');
            
            const mockAppointment = {
                id: `app_${Date.now()}`,
                ...appointmentData,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };
            
            // Store in localStorage - make sure we don't create duplicates
            const currentAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
            const filteredAppointments = currentAppointments.filter(app => 
                !(app.patientId === mockAppointment.patientId && 
                   app.doctorId === mockAppointment.doctorId && 
                   app.appointmentDate === mockAppointment.appointmentDate && 
                   app.appointmentTime === mockAppointment.appointmentTime)
            );
            filteredAppointments.push(mockAppointment);
            localStorage.setItem('mockAppointments', JSON.stringify(filteredAppointments));
            
            // Also update patient-specific appointment cache
            const patientId = mockAppointment.patientId;
            const patientAppointments = JSON.parse(localStorage.getItem(`patient_${patientId}_appointments`) || '[]');
            const filteredPatientAppointments = patientAppointments.filter(app => 
                !(app.patientId === mockAppointment.patientId && 
                   app.doctorId === mockAppointment.doctorId && 
                   app.appointmentDate === mockAppointment.appointmentDate && 
                   app.appointmentTime === mockAppointment.appointmentTime)
            );
            filteredPatientAppointments.push(mockAppointment);
            localStorage.setItem(`patient_${patientId}_appointments`, JSON.stringify(filteredPatientAppointments));
            
            return mockAppointment;
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
            const response = await fetch(`${API_BASE_URL}/appointments`, {
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
            // Log the request
            console.log(`Fetching medical records for patient ${patientId}`);
            
            // Ensure the API URL is correct - try both potential endpoints
            let response;
            try {
                // First try the endpoint from Java backend
                response = await fetch(`${API_BASE_URL}/patients/${patientId}/medical-records`, {
                    headers: getHeaders(),
                    method: 'GET'
                });
                
                if (!response.ok) {
                    // If that doesn't work, try the alternative endpoint
                    response = await fetch(`${API_BASE_URL}/medical-records/patient/${patientId}`, {
                        headers: getHeaders(),
                        method: 'GET'
                    });
                }
            } catch (fetchError) {
                console.error("Error fetching from primary endpoint:", fetchError);
                // Try the alternate endpoint
                response = await fetch(`${API_BASE_URL}/medical-records/patient/${patientId}`, {
                    headers: getHeaders(),
                    method: 'GET'
                });
            }
            
            // Handle the response
            if (!response.ok) {
                console.error(`Error fetching medical records: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to fetch medical records: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`Successfully fetched ${data.length} medical records for patient ${patientId}`, data);
            
            // If we have data, use it
            if (data && Array.isArray(data) && data.length > 0) {
                // Store in localStorage as a cache for offline use
                localStorage.setItem(`patient_${patientId}_medicalRecords`, JSON.stringify(data));
                return data;
            }
            
            // Check for patient-specific records in localStorage as a fallback
            const storedRecords = localStorage.getItem(`patient_${patientId}_medicalRecords`);
            if (storedRecords) {
                console.log(`Found ${JSON.parse(storedRecords).length} cached medical records for patient ${patientId}`);
                return JSON.parse(storedRecords);
            }
            
            // Create mock data if no records exist (helps with development)
            console.log("No medical records found. Creating mock data for development.");
            const mockRecords = [
                {
                    id: `med_${Date.now()}_1`,
                    patientId: patientId,
                    patient_id: patientId,
                    doctorName: "Dr. Sarah Johnson",
                    doctor_name: "Dr. Sarah Johnson",
                    specialty: "Cardiology",
                    diagnosis: "Annual Checkup",
                    description: "Regular checkup shows all vitals are normal. Blood pressure is 120/80.",
                    prescription: "Vitamin D supplement recommended",
                    prescriptions: "Vitamin D supplement recommended",
                    treatment_plan: "Continue with regular exercise and balanced diet",
                    treatmentPlan: "Continue with regular exercise and balanced diet",
                    notes: "Follow up in 12 months",
                    date: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0], // 30 days ago
                    createdAt: new Date(Date.now() - 30*24*60*60*1000).toISOString()
                },
                {
                    id: `med_${Date.now()}_2`,
                    patientId: patientId,
                    patient_id: patientId,
                    doctorName: "Dr. Michael Chen",
                    doctor_name: "Dr. Michael Chen",
                    specialty: "General Medicine",
                    diagnosis: "Common Cold",
                    description: "Patient presented with mild cough and congestion",
                    prescription: "Over-the-counter cough syrup and decongestant",
                    prescriptions: "Over-the-counter cough syrup and decongestant",
                    treatment_plan: "Rest and increase fluid intake",
                    treatmentPlan: "Rest and increase fluid intake",
                    notes: "Symptoms should resolve within a week",
                    date: new Date(Date.now() - 60*24*60*60*1000).toISOString().split('T')[0], // 60 days ago
                    createdAt: new Date(Date.now() - 60*24*60*60*1000).toISOString()
                }
            ];
            
            // Store these mock records in localStorage
            localStorage.setItem(`patient_${patientId}_medicalRecords`, JSON.stringify(mockRecords));
            return mockRecords;
        } catch (error) {
            console.error(`Failed to fetch medical records for patient ${patientId}:`, error.message);
            
            // Check for patient-specific records in localStorage as a fallback
            const storedRecords = localStorage.getItem(`patient_${patientId}_medicalRecords`);
            if (storedRecords) {
                console.log(`Found ${JSON.parse(storedRecords).length} cached medical records for patient ${patientId}`);
                return JSON.parse(storedRecords);
            }
            
            // Create mock data if no records exist (helps with development)
            console.log("No medical records found after error. Creating mock data for development.");
            const mockRecords = [
                {
                    id: `med_${Date.now()}_1`,
                    patientId: patientId,
                    patient_id: patientId,
                    doctorName: "Dr. Sarah Johnson",
                    doctor_name: "Dr. Sarah Johnson",
                    specialty: "Cardiology",
                    diagnosis: "Annual Checkup",
                    description: "Regular checkup shows all vitals are normal. Blood pressure is 120/80.",
                    prescription: "Vitamin D supplement recommended",
                    prescriptions: "Vitamin D supplement recommended",
                    treatment_plan: "Continue with regular exercise and balanced diet",
                    treatmentPlan: "Continue with regular exercise and balanced diet",
                    notes: "Follow up in 12 months",
                    date: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0], // 30 days ago
                    createdAt: new Date(Date.now() - 30*24*60*60*1000).toISOString()
                }
            ];
            
            // Store these mock records in localStorage
            localStorage.setItem(`patient_${patientId}_medicalRecords`, JSON.stringify(mockRecords));
            return mockRecords;
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
            // Create a consistent formatted medical record
            const newRecord = {
                id: `med_${Date.now()}`,
                patientId: medicalRecordData.patient_id,
                patient_id: medicalRecordData.patient_id, // Add both formats for compatibility
                doctorId: medicalRecordData.doctor_id,
                doctor_id: medicalRecordData.doctor_id, // Add both formats for compatibility
                doctorName: medicalRecordData.doctor_name || "Dr. Unknown",
                doctor_name: medicalRecordData.doctor_name || "Dr. Unknown", // Add both formats
                specialty: medicalRecordData.specialty || "General",
                diagnosis: medicalRecordData.diagnosis,
                description: medicalRecordData.description,
                prescription: medicalRecordData.prescription,
                prescriptions: medicalRecordData.prescription, // Add both formats for compatibility
                treatment_plan: medicalRecordData.treatment_plan,
                treatmentPlan: medicalRecordData.treatment_plan, // Add both formats
                notes: medicalRecordData.notes,
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            };
            
            // Store in localStorage for patients to view
            const patientId = medicalRecordData.patient_id;
            const existingRecords = JSON.parse(localStorage.getItem(`patient_${patientId}_medicalRecords`) || '[]');
            existingRecords.push(newRecord);
            localStorage.setItem(`patient_${patientId}_medicalRecords`, JSON.stringify(existingRecords));
            
            console.log(`Medical record saved to localStorage for patient ${patientId}`, newRecord);
            
            return newRecord;
        }
    },
    
    // Debug helper for localStorage
    debugLocalStorage: (patientId) => {
        try {
            // Log all localStorage keys
            console.log("All localStorage keys:");
            for (let i = 0; i < localStorage.length; i++) {
                console.log(`  ${i}: ${localStorage.key(i)}`);
            }
            
            // Check for patient medical records
            const recordKey = `patient_${patientId}_medicalRecords`;
            const storedRecords = localStorage.getItem(recordKey);
            
            if (storedRecords) {
                const records = JSON.parse(storedRecords);
                console.log(`Found ${records.length} records for patient ${patientId} in localStorage`);
                console.log("Records:", records);
                return records;
            } else {
                console.log(`No records found in localStorage for key "${recordKey}"`);
                return null;
            }
        } catch (error) {
            console.error("Error debugging localStorage:", error);
            return null;
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
            
            // Get doctors from the actual system database
            const systemDoctors = mockDb.initializeDoctorsMockData();
            
            // Map the doctors to the format needed for the reviews dropdown
            return systemDoctors.map(doctor => ({
                id: doctor.id,
                name: doctor.name,
                specialty: doctor.specialty || doctor.specialization,
                lastAppointmentDate: new Date().toISOString() // Use current date as mock last appointment
            }));
        }
    }
};

// Add notification API functions
export const notificationApi = {
    getUserNotifications: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/notifications/${userId}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch notifications for user ${userId}:`, error.message);
            // Fall back to mock implementation for development
            console.log('Using mock implementation for user notifications');
            return [];
        }
    },
    
    markNotificationAsRead: async (notificationId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to mark notification ${notificationId} as read:`, error.message);
            // Fall back to mock implementation for development
            console.log('Using mock implementation for marking notification as read');
            return { success: true };
        }
    },
    
    getUnreadCount: async (userId) => {
        try {
            const notifications = await notificationApi.getUserNotifications(userId);
            return notifications.filter(notification => !notification.is_read).length;
        } catch (error) {
            console.error(`Failed to get unread count for user ${userId}:`, error.message);
            return 0;
        }
    }
};

// Add the payment API service
export const paymentApi = {
    processPayment: async (paymentData) => {
        try {
            console.log('Processing payment:', paymentData);
            
            // In a real implementation, this would call a payment gateway API
            const response = await fetch(`${API_BASE_URL}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(paymentData)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Payment processing failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                throw new Error(errorData.message || 'Failed to process payment');
            }
            
            const responseData = await response.json();
            console.log('Payment processed successfully:', responseData);
            
            // Store payment in localStorage for development purposes
            const payments = JSON.parse(localStorage.getItem('payments') || '[]');
            payments.push(responseData);
            localStorage.setItem('payments', JSON.stringify(payments));
            
            return responseData;
        } catch (error) {
            console.error('Failed to process payment:', error);
            
            // For development, create a mock payment response
            const mockPayment = {
                id: `payment_${Date.now()}`,
                status: 'COMPLETED',
                amount: paymentData.amount,
                currency: paymentData.currency || 'USD',
                paymentMethod: paymentData.paymentMethod,
                transactionId: `txn_${Date.now()}${Math.floor(Math.random() * 10000)}`,
                createdAt: new Date().toISOString(),
                cardDetails: paymentData.paymentMethod === 'CARD' ? {
                    lastFourDigits: paymentData.cardNumber ? paymentData.cardNumber.slice(-4) : '1234',
                    cardType: paymentData.cardType || 'Visa',
                    expiryMonth: paymentData.expiryMonth || '12',
                    expiryYear: paymentData.expiryYear || '25'
                } : null,
                insurance: paymentData.paymentMethod === 'INSURANCE' ? {
                    provider: paymentData.insuranceProvider || 'Unknown',
                    policyNumber: paymentData.policyNumber || '123456789',
                    coveragePercentage: paymentData.coveragePercentage || 80
                } : null
            };
            
            // Store in localStorage
            const payments = JSON.parse(localStorage.getItem('payments') || '[]');
            payments.push(mockPayment);
            localStorage.setItem('payments', JSON.stringify(payments));
            
            return mockPayment;
        }
    },
    
    getPaymentById: async (paymentId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch payment ${paymentId}:`, error.message);
            
            // For development, check localStorage
            const payments = JSON.parse(localStorage.getItem('payments') || '[]');
            const payment = payments.find(p => p.id === paymentId);
            
            if (payment) {
                return payment;
            }
            
            throw error;
        }
    },
    
    getPaymentsByPatientId: async (patientId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/patient/${patientId}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch payments for patient ${patientId}:`, error.message);
            
            // For development, check localStorage
            const payments = JSON.parse(localStorage.getItem('payments') || '[]');
            return payments.filter(p => p.patientId === patientId);
        }
    },
    
    getPaymentsByAppointmentId: async (appointmentId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/appointment/${appointmentId}`, {
                headers: getHeaders()
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to fetch payments for appointment ${appointmentId}:`, error.message);
            
            // For development, check localStorage
            const payments = JSON.parse(localStorage.getItem('payments') || '[]');
            return payments.filter(p => p.appointmentId === appointmentId);
        }
    },
    
    refundPayment: async (paymentId, refundData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/refund`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(refundData)
            });
            
            return await handleResponse(response);
        } catch (error) {
            console.error(`Failed to refund payment ${paymentId}:`, error.message);
            
            // For development, create a mock refund
            const payments = JSON.parse(localStorage.getItem('payments') || '[]');
            const paymentIndex = payments.findIndex(p => p.id === paymentId);
            
            if (paymentIndex >= 0) {
                payments[paymentIndex] = {
                    ...payments[paymentIndex],
                    status: 'REFUNDED',
                    refundedAt: new Date().toISOString(),
                    refundReason: refundData.reason || 'Customer requested'
                };
                
                localStorage.setItem('payments', JSON.stringify(payments));
                return payments[paymentIndex];
            }
            
            throw error;
        }
    }
};

// Update the appointmentApi.createAppointment function to include payment information
const originalCreateAppointment = appointmentApi.createAppointment;
appointmentApi.createAppointment = async (appointmentData) => {
    try {
        // Check if payment information is included
        if (appointmentData.paymentId) {
            console.log('Creating appointment with payment information:', {
                paymentId: appointmentData.paymentId,
                paymentStatus: appointmentData.paymentStatus,
                paymentAmount: appointmentData.paymentAmount
            });
        }
        
        // Call the original implementation
        const response = await originalCreateAppointment(appointmentData);
        
        // If payment info is included, update the payment with the appointment ID
        if (appointmentData.paymentId) {
            const payments = JSON.parse(localStorage.getItem('payments') || '[]');
            const paymentIndex = payments.findIndex(p => p.id === appointmentData.paymentId);
            
            if (paymentIndex >= 0) {
                payments[paymentIndex] = {
                    ...payments[paymentIndex],
                    appointmentId: response.id
                };
                
                localStorage.setItem('payments', JSON.stringify(payments));
            }
        }
        
        return response;
    } catch (error) {
        console.error('Failed to create appointment with payment:', error);
        throw error;
    }
};
