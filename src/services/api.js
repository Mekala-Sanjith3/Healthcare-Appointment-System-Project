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