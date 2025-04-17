const API_BASE_URL = 'http://localhost:8080/api';

export const authApi = {
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        return response.json();
    },

    registerDoctor: async (doctorData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register/doctor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(doctorData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Doctor registration failed');
        }
        return response.json();
    },

    registerPatient: async (patientData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register/patient`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(patientData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Patient registration failed');
        }
        return response.json();
    },

    registerAdmin: async (adminData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adminData)
        });
        
        if (!response.ok) {
            let errorMessage = 'Admin registration failed';
            try {
                const errorData = await response.text();
                if (errorData) {
                    const jsonError = JSON.parse(errorData);
                    errorMessage = jsonError.message || errorMessage;
                }
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
            throw new Error(errorMessage);
        }
        
        try {
            const text = await response.text();
            return text ? JSON.parse(text) : {};
        } catch (e) {
            console.error('Error parsing success response:', e);
            return {};
        }
    }
};

export const adminApi = {
    // Doctor endpoints
    getAllDoctors: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/doctors`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch doctors');
        }
        return response.json();
    },

    getDoctorById: async (doctorId) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch doctor');
        }
        return response.json();
    },

    createDoctor: async (doctorData) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/doctors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(doctorData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create doctor');
        }
        return response.json();
    },

    updateDoctor: async (doctorId, doctorData) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(doctorData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update doctor');
        }
        return response.json();
    },

    updateDoctorStatus: async (doctorId, status) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update doctor status');
        }
        return response.json();
    },

    deleteDoctor: async (doctorId) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete doctor');
        }
        return true;
    },

    uploadDoctorFile: async (doctorId, file, type) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
            `${API_BASE_URL}/admin/doctors/${doctorId}/${type}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            }
        );
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to upload doctor ${type}`);
        }
        return response.json();
    },

    // Patient endpoints
    getAllPatients: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/patients`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch patients');
        }
        return response.json();
    },

    getPatientById: async (patientId) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/patients/${patientId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch patient');
        }
        return response.json();
    },

    createPatient: async (patientData) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/patients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(patientData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create patient');
        }
        return response.json();
    },

    updatePatient: async (patientId, patientData) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/patients/${patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(patientData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update patient');
        }
        return response.json();
    },

    deletePatient: async (patientId) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/patients/${patientId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete patient');
        }
        return true;
    },

    uploadPatientFile: async (patientId, file, type) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        const endpoint = type === 'profile-picture' 
            ? `${API_BASE_URL}/admin/patients/${patientId}/profile-picture` 
            : `${API_BASE_URL}/admin/patients/${patientId}/medical-records`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to upload patient ${type}`);
        }
        return response.json();
    }
}; 