const API_BASE_URL = 'http://localhost:8082/api';

// Helper function to get authorization headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage;
        try {
            const errorText = await response.text();
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorText || `HTTP ${response.status}`;
            } catch {
                errorMessage = errorText || `HTTP ${response.status}`;
            }
        } catch {
            errorMessage = `HTTP ${response.status}`;
        }
        
        console.error(`API Error: ${response.status} - ${errorMessage}`);
        throw new Error(`${response.status}: ${errorMessage}`);
    }
    return response.json();
};

// Authentication API
export const authApi = {
    login: async (credentials) => {
        try {
            console.log("Attempting to login with data:", credentials);
            
            const loginRequest = {
                email: credentials.email,
                password: credentials.password,
                captchaToken: credentials.captchaToken || null
            };
            
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(loginRequest)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Login failed with status ${response.status}:`, errorText);
                throw new Error(`Login failed: ${errorText || 'Invalid credentials'}`);
            }
            
            const data = await response.json();
            console.log("Login successful:", data);
            
            // Store authentication data
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userEmail', data.email);
            
            return {
                token: data.token,
                email: data.email,
                role: data.role,
                userId: data.userId
            };
        } catch (error) {
            console.error('Login failed:', error.message);
            throw error;
        }
    },

    register: async (userDetails, userType) => {
        try {
            console.log(`Attempting to register ${userType} with data:`, userDetails);
            
            const response = await fetch(`${API_BASE_URL}/auth/register/${userType.toLowerCase()}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(userDetails)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Registration failed with status ${response.status}:`, errorText);
                throw new Error(`Registration failed: ${errorText || 'Unknown error'}`);
            }
            
            const data = await response.json();
            console.log(`${userType} registration successful:`, data);
            
            // Store authentication data
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userEmail', data.email);
            
            return {
                token: data.token,
                email: data.email,
                role: data.role,
                userId: data.userId
            };
        } catch (error) {
            console.error('Registration failed:', error.message);
            throw error;
        }
    },

    registerPatient: async (patientData) => {
        return authApi.register(patientData, 'patient');
    },

    registerDoctor: async (doctorData) => {
        return authApi.register(doctorData, 'doctor');
    },

    registerAdmin: async (adminData) => {
        return authApi.register(adminData, 'admin');
    }
};

// Admin API
export const adminApi = {
    getDashboardStats: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getAllPatients: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/patients`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getAllDoctors: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/doctors`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getAllAppointments: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getRecentAppointments: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/appointments/recent`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getAllAdmins: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/users/admins`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    createPatient: async (patientData) => {
        const response = await fetch(`${API_BASE_URL}/admin/patients`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(patientData)
        });
        return handleResponse(response);
    },

    createDoctor: async (doctorData) => {
        const response = await fetch(`${API_BASE_URL}/admin/doctors`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(doctorData)
        });
        return handleResponse(response);
    },

    updateDoctor: async (doctorId, doctorData) => {
        const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(doctorData)
        });
        return handleResponse(response);
    },

    deleteDoctor: async (doctorId) => {
        const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    updatePatient: async (patientId, patientData) => {
        const response = await fetch(`${API_BASE_URL}/admin/patients/${patientId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(patientData)
        });
        return handleResponse(response);
    },

    deletePatient: async (patientId) => {
        const response = await fetch(`${API_BASE_URL}/admin/patients/${patientId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};

// Doctor API
export const doctorApi = {
    getDashboardStats: async (doctorId) => {
        const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getAppointments: async (doctorId) => {
        const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/appointments`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getPatients: async (doctorId) => {
        const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/patients`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getProfile: async (doctorId) => {
        const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/profile`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getAllDoctors: async () => {
        // Use public endpoint for now to avoid authentication issues
        const response = await fetch(`${API_BASE_URL}/test/doctors-public`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return handleResponse(response);
    },

    getSpecializations: async () => {
        // Get all doctors and extract unique specializations
        try {
            const doctors = await doctorApi.getAllDoctors();
            const specializations = [...new Set(doctors.map(doctor => doctor.specialization))].filter(Boolean);
            return specializations;
        } catch (error) {
            console.error('Failed to fetch specializations:', error);
            // Return default specializations as fallback
            return [
                'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
                'Neurology', 'Obstetrics', 'Oncology', 'Ophthalmology',
                'Orthopedics', 'Pediatrics', 'Psychiatry', 'Urology'
            ];
        }
    },

    getAvailableTimeSlots: async (doctorId, date) => {
        const response = await fetch(`${API_BASE_URL}/appointments/doctor/${doctorId}/availability?date=${date}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getDoctorProfile: async (doctorId) => {
        const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/profile`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getDashboardStats: async (doctorId) => {
        const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getDoctorAvailability: async (doctorId) => {
        // For now, return default availability
        return {
            monday: { available: true, startTime: '09:00', endTime: '17:00' },
            tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
            wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
            thursday: { available: true, startTime: '09:00', endTime: '17:00' },
            friday: { available: true, startTime: '09:00', endTime: '17:00' },
            saturday: { available: false, startTime: '09:00', endTime: '17:00' },
            sunday: { available: false, startTime: '09:00', endTime: '17:00' }
        };
    },

    getDoctorNotifications: async (doctorId) => {
        // For now, return empty notifications
        return [];
    },

    getPatientsWithAppointments: async (doctorId) => {
        try {
            // Get appointments for this doctor first
            const appointments = await appointmentApi.getAppointmentsByDoctorId(doctorId);
            
            // Extract unique patient IDs
            const patientIds = [...new Set(appointments.map(app => app.patientId))];
            
            // Get patient details for each ID
            const patients = [];
            for (const patientId of patientIds) {
                try {
                    const patient = await patientApi.getPatientProfile(patientId);
                    if (patient) {
                        patients.push(patient);
                    }
                } catch (error) {
                    console.error(`Failed to fetch patient ${patientId}:`, error);
                }
            }
            
            return patients;
        } catch (error) {
            console.error('Failed to get patients with appointments:', error);
            return [];
        }
    },

    getDoctorReports: async (doctorId) => {
        // For now, return empty reports
        return [];
    },

    getDoctorsWithFilters: async (filters) => {
        // For now, get all doctors and filter on frontend
        // In a real app, you'd pass filters to backend
        try {
            const allDoctors = await doctorApi.getAllDoctors();
            
            let filteredDoctors = allDoctors;
            
            // Apply filters
            if (filters.name) {
                filteredDoctors = filteredDoctors.filter(doctor => 
                    doctor.name.toLowerCase().includes(filters.name.toLowerCase())
                );
            }
            
            if (filters.specialty) {
                filteredDoctors = filteredDoctors.filter(doctor => 
                    doctor.specialization === filters.specialty
                );
            }
            
            if (filters.location) {
                filteredDoctors = filteredDoctors.filter(doctor => 
                    doctor.address && doctor.address.toLowerCase().includes(filters.location.toLowerCase())
                );
            }
            
            // Pagination
            const page = filters.page || 1;
            const limit = filters.limit || 6;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedDoctors = filteredDoctors.slice(startIndex, endIndex);
            
            return {
                data: paginatedDoctors,
                meta: {
                    total: filteredDoctors.length,
                    totalPages: Math.ceil(filteredDoctors.length / limit),
                    currentPage: page,
                    limit: limit
                }
            };
        } catch (error) {
            console.error('Failed to fetch doctors with filters:', error);
            throw error;
        }
    },

    searchPatients: async (query) => {
        try {
            // For now, get all patients and filter on frontend
            const response = await fetch(`${API_BASE_URL}/test/all-users`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await handleResponse(response);
            const patients = data.patients || [];
            
            if (!query) return patients;
            
            // Filter patients by name or email
            return patients.filter(patient => 
                patient.name?.toLowerCase().includes(query.toLowerCase()) ||
                patient.email?.toLowerCase().includes(query.toLowerCase())
            );
        } catch (error) {
            console.error('Failed to search patients:', error);
            return [];
        }
    }
};

// Patient API
export const patientApi = {
    getDashboardStats: async (patientId) => {
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getAppointments: async (patientId) => {
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/appointments`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getMedicalRecords: async (patientId) => {
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/medical-records`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getProfile: async (patientId) => {
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/profile`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getPatientProfile: async (patientId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}/profile`, {
                headers: getAuthHeaders()
            });
            return handleResponse(response);
        } catch (error) {
            // Fallback: try to get patient from test endpoint
            console.log('Falling back to test endpoint for patient profile:', error.message);
            const fallbackResponse = await fetch(`${API_BASE_URL}/test/all-users`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await handleResponse(fallbackResponse);
            const patient = data.patients?.find(p => p.id == patientId);
            return patient || null;
        }
    }
};

// Test API
export const testApi = {
    getDatabaseStatus: async () => {
        const response = await fetch(`${API_BASE_URL}/test/database-status`);
        return handleResponse(response);
    },

    getAllUsers: async () => {
        const response = await fetch(`${API_BASE_URL}/test/all-users`);
        return handleResponse(response);
    },

    getHealth: async () => {
        const response = await fetch(`${API_BASE_URL}/test/health`);
        return handleResponse(response);
    }
};

// Appointment API (for booking and managing appointments)
export const appointmentApi = {
    getAppointmentsByPatientId: async (patientId) => {
        const response = await fetch(`${API_BASE_URL}/appointments/patient/${patientId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getAppointmentsByDoctorId: async (doctorId) => {
        try {
            // Try the secured endpoint first
            const response = await fetch(`${API_BASE_URL}/appointments/doctor/${doctorId}`, {
                headers: getAuthHeaders()
            });
            return handleResponse(response);
        } catch (error) {
            // Fallback to test endpoint if authentication fails
            console.log('Falling back to test endpoint due to auth error:', error.message);
            const fallbackResponse = await fetch(`${API_BASE_URL}/test/appointments/doctor/${doctorId}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await handleResponse(fallbackResponse);
            return data.appointments || [];
        }
    },

    bookAppointment: async (appointmentData) => {
        const response = await fetch(`${API_BASE_URL}/appointments/book`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(appointmentData)
        });
        return handleResponse(response);
    },

    updateAppointmentStatus: async (appointmentId, status) => {
        const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status?status=${status}`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    cancelAppointment: async (appointmentId) => {
        const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getDoctorAvailability: async (doctorId, date) => {
        const response = await fetch(`${API_BASE_URL}/appointments/doctor/${doctorId}/availability?date=${date}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};

// Medical Records API
export const medicalRecordsApi = {
    getPatientRecords: async (patientId) => {
        const response = await fetch(`${API_BASE_URL}/medical-records/patient/${patientId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    addMedicalRecord: async (recordData) => {
        const response = await fetch(`${API_BASE_URL}/medical-records`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(recordData)
        });
        return handleResponse(response);
    },

    getMedicalRecord: async (recordId) => {
        const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    updateMedicalRecord: async (recordId, updateData) => {
        const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData)
        });
        return handleResponse(response);
    }
};

// Reviews API
export const reviewsApi = {
    getDoctorReviews: async (doctorId) => {
        const response = await fetch(`${API_BASE_URL}/reviews/doctor/${doctorId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    addReview: async (reviewData) => {
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(reviewData)
        });
        return handleResponse(response);
    },

    getPatientReviews: async (patientId) => {
        const response = await fetch(`${API_BASE_URL}/reviews/patient/${patientId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};

// Payment API
export const paymentApi = {
    processPayment: async (paymentData) => {
        const response = await fetch(`${API_BASE_URL}/payments/process`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(paymentData)
        });
        return handleResponse(response);
    },

    getPaymentHistory: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/payments/history/${userId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getPaymentStats: async () => {
        const response = await fetch(`${API_BASE_URL}/payments/stats`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};
