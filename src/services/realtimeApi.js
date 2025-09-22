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
        try {
            console.log(`Attempting to register patient with data:`, patientData);
            
            const response = await fetch(`${API_BASE_URL}/auth/register/patient`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(patientData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Registration failed with status ${response.status}:`, errorText);
                throw new Error(`Registration failed: ${errorText || 'Unknown error'}`);
            }
            
            const data = await response.json();
            console.log(`Patient registration successful:`, data);
            
            // Store authentication data
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userEmail', data.email);
            
            return {
                success: true,
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

    getAllAppointments: async (params = {}) => {
        const qs = new URLSearchParams();
        if (params.status) qs.append('status', params.status);
        if (params.date) qs.append('date', params.date);
        if (params.search) qs.append('search', params.search);
        const query = qs.toString() ? `?${qs.toString()}` : '';
        const response = await fetch(`${API_BASE_URL}/admin/appointments${query}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    createAppointment: async (appointment) => {
        const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(appointment)
        });
        return handleResponse(response);
    },

    updateAppointment: async (appointmentId, appointment) => {
        const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(appointment)
        });
        return handleResponse(response);
    },

    deleteAppointment: async (appointmentId) => {
        const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}`, {
            method: 'DELETE',
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
    },

    getDoctorById: async (doctorId) => {
        try {
            // Try the admin endpoint first
            const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
                headers: getAuthHeaders()
            });
            return handleResponse(response);
        } catch (error) {
            console.log('Falling back to public endpoint for doctor:', error.message);
            // Fallback to public endpoint and filter by ID
            const allDoctors = await doctorApi.getAllDoctors();
            const doctor = allDoctors.find(d => d.id === doctorId);
            if (!doctor) {
                throw new Error('Doctor not found');
            }
            return doctor;
        }
    },

    getPatientById: async (patientId) => {
        try {
            // Try the admin endpoint first
            const response = await fetch(`${API_BASE_URL}/admin/patients/${patientId}`, {
                headers: getAuthHeaders()
            });
            return handleResponse(response);
        } catch (error) {
            console.log('Falling back to test endpoint for patient:', error.message);
            // Fallback to test endpoint and filter by ID
            const testResponse = await fetch(`${API_BASE_URL}/test/all-users`, {
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await handleResponse(testResponse);
            const patient = data.patients?.find(p => p.id == patientId);
            if (!patient) {
                throw new Error('Patient not found');
            }
            return patient;
        }
    },

    updateDoctorStatus: async (doctorId, status) => {
        const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        return handleResponse(response);
    },

    updatePatientStatus: async (patientId, status) => {
        const response = await fetch(`${API_BASE_URL}/admin/patients/${patientId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
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
        const defaults = () => ({
            monday: { start: '09:00', end: '17:00', isAvailable: true },
            tuesday: { start: '09:00', end: '17:00', isAvailable: true },
            wednesday: { start: '09:00', end: '17:00', isAvailable: true },
            thursday: { start: '09:00', end: '17:00', isAvailable: true },
            friday: { start: '09:00', end: '17:00', isAvailable: true },
            saturday: { start: '09:00', end: '13:00', isAvailable: false },
            sunday: { start: '09:00', end: '13:00', isAvailable: false }
        });

        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/availability`, {
                headers: getAuthHeaders()
            });
            const data = await handleResponse(response);
            const raw = data?.availabilitySchedule;
            if (!raw) return defaults();
            let parsed = {};
            try { parsed = JSON.parse(raw); } catch { return defaults(); }
            // Normalize any legacy keys
            Object.keys(parsed || {}).forEach(day => {
                const v = parsed[day] || {};
                parsed[day] = {
                    start: v.start || v.startTime || '09:00',
                    end: v.end || v.endTime || '17:00',
                    isAvailable: typeof v.isAvailable === 'boolean' ? v.isAvailable : !!v.available
                };
            });
            // Ensure all days exist
            return { ...defaults(), ...parsed };
        } catch (e) {
            return defaults();
        }
    },

    updateDoctorAvailability: async (doctorId, availability) => {
        const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/availability`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ availabilitySchedule: JSON.stringify(availability) })
        });
        if (!response.ok) {
            throw new Error('Failed to save availability');
        }
        return true;
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
            // Use test endpoint as primary method for now
            console.log('Fetching patient profile for ID:', patientId);
            const response = await fetch(`${API_BASE_URL}/test/all-users`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await handleResponse(response);
            const patient = data.patients?.find(p => p.id == patientId);
            if (patient) {
                console.log('Found patient:', patient);
                return patient;
            } else {
                console.log('Patient not found in patients array, checking users array');
                // If not found in patients array, check users array for patient role
                const userPatient = data.users?.find(u => u.id == patientId && u.role === 'PATIENT');
                if (userPatient) {
                    console.log('Found patient in users array:', userPatient);
                    return userPatient;
                }
            }
            return null;
        } catch (error) {
            console.error('Error fetching patient profile:', error);
            return null;
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
    getAllRecords: async ({ search, dateFrom, dateTo } = {}) => {
        const qs = new URLSearchParams();
        if (search) qs.append('search', search);
        if (dateFrom) qs.append('dateFrom', dateFrom);
        if (dateTo) qs.append('dateTo', dateTo);
        const query = qs.toString() ? `?${qs.toString()}` : '';
        const response = await fetch(`${API_BASE_URL}/medical-records${query}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
    getPatientRecords: async (patientId) => {
        const response = await fetch(`${API_BASE_URL}/medical-records/patient/${patientId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getPatientMedicalHistory: async (patientId) => {
        try {
            console.log('Fetching medical history for patient:', patientId);
            const response = await fetch(`${API_BASE_URL}/medical-records/patient/${patientId}`, {
                headers: getAuthHeaders()
            });
            const result = await handleResponse(response);
            console.log('Medical history API response:', result);
            return result;
        } catch (error) {
            console.error('Error fetching medical history:', error);
            throw error;
        }
    },

    searchMedicalRecords: async (patientId, query) => {
        try {
            const response = await fetch(`${API_BASE_URL}/medical-records/patient/${patientId}?search=${encodeURIComponent(query)}`, {
                headers: getAuthHeaders()
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Error searching medical records:', error);
            return [];
        }
    },

    debugLocalStorage: (patientId) => {
        console.log('Debug localStorage for patient:', patientId);
        console.log('Token:', localStorage.getItem('token'));
        console.log('User data:', localStorage.getItem('userData'));
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

// Staff API for admin portal
export const staffApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/staff`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
    create: async (staff) => {
        const response = await fetch(`${API_BASE_URL}/staff`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(staff)
        });
        return handleResponse(response);
    },
    update: async (id, staff) => {
        const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(staff)
        });
        return handleResponse(response);
    },
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok && response.status !== 204) {
            throw new Error('Failed to delete staff');
        }
        return true;
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

    createReview: async (reviewData) => {
        // alias used by PatientDashboard
        return reviewsApi.addReview(reviewData);
    },

    getPatientPastDoctors: async (patientId) => {
        try {
            // Build from the patient's past appointments
            const apps = await appointmentApi.getAppointmentsByPatientId(patientId);
            const byDoctor = new Map();
            for (const a of apps || []) {
                const key = String(a.doctorId || '');
                if (!key) continue;
                const name = a.doctorName || `Doctor ${key}`;
                const specialty = a.doctorSpecialization || 'General Medicine';
                const lastDate = Array.isArray(a.appointmentDate) ? `${a.appointmentDate[0]}-${String(a.appointmentDate[1]).padStart(2,'0')}-${String(a.appointmentDate[2]).padStart(2,'0')}` : (a.appointmentDate || '');
                byDoctor.set(key, { id: key, name, specialty, lastAppointmentDate: lastDate });
            }
            return Array.from(byDoctor.values());
        } catch (e) {
            console.error('Failed to build patient past doctors:', e);
            return [];
        }
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
    getAll: async ({ from, to } = {}) => {
        const qs = new URLSearchParams();
        if (from) qs.append('from', from);
        if (to) qs.append('to', to);
        const response = await fetch(`${API_BASE_URL}/finance/payments${qs.toString() ? `?${qs.toString()}` : ''}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
    getSummary: async ({ from, to }) => {
        const qs = new URLSearchParams();
        qs.append('from', from);
        qs.append('to', to);
        const response = await fetch(`${API_BASE_URL}/finance/summary?${qs.toString()}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};
