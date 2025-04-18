// Initialize app with sample data if needed
export const initializeApp = () => {
  // Check if we're in development or production 
  const isDev = process.env.NODE_ENV === 'development';
  
  // Check if there's a valid token
  const hasToken = localStorage.getItem('token');
  
  // We'll set up default data regardless of token for testing purposes
  setupDefaultDoctors();
  setupDefaultPatients();
  setupDefaultAdmins();
  setupDefaultAppointments();
  
  // Clear any previous error messages
  localStorage.removeItem('authError');
};

// Setup default admin accounts for development
const setupDefaultAdmins = () => {
  const admins = [
    {
      id: 'admin_1',
      name: 'System Admin',
      email: 'admin@healthcare.com',
      role: 'ADMIN',
      department: 'IT Administration',
      status: 'ACTIVE'
    }
  ];
  
  // Check if admins already exist in local storage
  const existingAdmins = localStorage.getItem('mockAdmins');
  if (!existingAdmins || JSON.parse(existingAdmins).length === 0) {
    localStorage.setItem('mockAdmins', JSON.stringify(admins));
  }
};

// Setup default doctor accounts for development
const setupDefaultDoctors = () => {
  const doctors = [
    {
      id: 'doctor_1',
      name: 'Dr. John Smith',
      email: 'john.smith@healthcare.com',
      specialization: 'Cardiology',
      qualification: 'MD, FACC',
      experience: '15 years',
      role: 'DOCTOR',
      status: 'ACTIVE',
      profilePicture: '',
      bio: 'Specialized in cardiovascular diseases with 15 years of experience',
      rating: 4.8,
      reviewCount: 156
    },
    {
      id: 'doctor_2',
      name: 'Dr. Emily Johnson',
      email: 'emily.johnson@healthcare.com',
      specialization: 'Dermatology',
      qualification: 'MD, FAAD',
      experience: '10 years',
      role: 'DOCTOR',
      status: 'ACTIVE',
      profilePicture: '',
      bio: 'Board-certified dermatologist specializing in skin cancer and cosmetic procedures',
      rating: 4.7,
      reviewCount: 134
    },
    {
      id: 'doctor_3',
      name: 'Dr. Michael Wong',
      email: 'michael.wong@healthcare.com',
      specialization: 'Neurology',
      qualification: 'MD, PhD',
      experience: '12 years',
      role: 'DOCTOR',
      status: 'ACTIVE',
      profilePicture: '',
      bio: "Specializes in neurological disorders with research background in Alzheimer's disease",
      rating: 4.9,
      reviewCount: 128
    },
    {
      id: 'doctor_4',
      name: 'Dr. Sarah Garcia',
      email: 'sarah.garcia@healthcare.com',
      specialization: 'Pediatrics',
      qualification: 'MD, FAAP',
      experience: '8 years',
      role: 'DOCTOR',
      status: 'ACTIVE',
      profilePicture: '',
      bio: 'Dedicated pediatrician with special interest in childhood development and preventive care',
      rating: 4.9,
      reviewCount: 145
    },
    {
      id: 'doctor_5',
      name: 'Dr. Robert Chen',
      email: 'robert.chen@healthcare.com',
      specialization: 'Orthopedics',
      qualification: 'MD, FAAOS',
      experience: '14 years',
      role: 'DOCTOR',
      status: 'ACTIVE',
      profilePicture: '',
      bio: 'Orthopedic surgeon specializing in sports medicine and joint replacement',
      rating: 4.8,
      reviewCount: 162
    }
  ];
  
  // Check if doctors already exist in local storage
  const existingDoctors = localStorage.getItem('mockDoctors');
  if (!existingDoctors || JSON.parse(existingDoctors).length === 0) {
    localStorage.setItem('mockDoctors', JSON.stringify(doctors));
  }
};

// Setup default patient accounts for development
const setupDefaultPatients = () => {
  const patients = [
    {
      id: 'patient_1',
      name: 'Sarah Miller',
      email: 'sarah.miller@example.com',
      age: 35,
      gender: 'Female',
      bloodGroup: 'O+',
      phoneNumber: '9876543210',
      address: '123 Main Street, Anytown',
      role: 'PATIENT',
      status: 'ACTIVE'
    },
    {
      id: 'patient_2',
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      age: 42,
      gender: 'Male',
      bloodGroup: 'AB-',
      phoneNumber: '5551234567',
      address: '456 Oak Avenue, Somewhere',
      role: 'PATIENT',
      status: 'ACTIVE'
    }
  ];
  
  // Check if patients already exist in local storage
  const existingPatients = localStorage.getItem('mockPatients');
  if (!existingPatients || JSON.parse(existingPatients).length === 0) {
    localStorage.setItem('mockPatients', JSON.stringify(patients));
  }
};

// Setup default appointments for testing
const setupDefaultAppointments = () => {
  // Get current date for creating appointments
  const today = new Date();
  
  // Format today's date as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Create dates for upcoming appointments
  const todayStr = formatDate(today);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = formatDate(tomorrow);
  
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const nextWeekStr = formatDate(nextWeek);
  
  const appointments = [
    // Past appointments
    {
      id: 'appointment_1',
      patientId: 'patient_1',
      patientName: 'Sarah Miller',
      doctorId: 'doctor_1',
      doctorName: 'Dr. John Smith',
      doctorSpecialization: 'Cardiology',
      appointmentDate: '2023-12-01',
      appointmentTime: '10:00 AM',
      appointmentType: 'Consultation',
      problem: 'Regular checkup',
      notes: 'Patient has family history of heart disease. Blood pressure was normal.',
      status: 'COMPLETED',
      createdAt: '2023-11-25T10:30:00.000Z'
    },
    
    // Today's appointments
    {
      id: 'appointment_2',
      patientId: 'patient_1',
      patientName: 'Sarah Miller',
      doctorId: 'doctor_2',
      doctorName: 'Dr. Emily Johnson',
      doctorSpecialization: 'Dermatology',
      appointmentDate: todayStr,
      appointmentTime: '02:30 PM',
      appointmentType: 'Consultation',
      problem: 'Skin rash on arms',
      notes: 'Patient reports itchiness and redness for 3 days',
      status: 'CONFIRMED',
      createdAt: new Date(today.getTime() - 86400000 * 3).toISOString() // 3 days ago
    },
    
    // Tomorrow's appointment
    {
      id: 'appointment_3',
      patientId: 'patient_1',
      patientName: 'Sarah Miller',
      doctorId: 'doctor_3',
      doctorName: 'Dr. Michael Wong',
      doctorSpecialization: 'Neurology',
      appointmentDate: tomorrowStr,
      appointmentTime: '11:00 AM',
      appointmentType: 'Consultation',
      problem: 'Headaches',
      notes: 'Recurring headaches for the past 2 weeks',
      status: 'CONFIRMED',
      createdAt: new Date(today.getTime() - 86400000 * 2).toISOString() // 2 days ago
    },
    
    // Next week's appointment
    {
      id: 'appointment_4',
      patientId: 'patient_1',
      patientName: 'Sarah Miller',
      doctorId: 'doctor_4',
      doctorName: 'Dr. Sarah Garcia',
      doctorSpecialization: 'Pediatrics',
      appointmentDate: nextWeekStr,
      appointmentTime: '09:30 AM',
      appointmentType: 'Follow-up',
      problem: 'Child vaccination',
      notes: '',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    },
    
    // Patient 2's appointments
    {
      id: 'appointment_5',
      patientId: 'patient_2',
      patientName: 'James Wilson',
      doctorId: 'doctor_5',
      doctorName: 'Dr. Robert Chen',
      doctorSpecialization: 'Orthopedics',
      appointmentDate: tomorrowStr,
      appointmentTime: '03:00 PM',
      appointmentType: 'Consultation',
      problem: 'Knee pain',
      notes: 'Patient reports pain when climbing stairs',
      status: 'CONFIRMED',
      createdAt: new Date(today.getTime() - 86400000).toISOString() // 1 day ago
    }
  ];
  
  // Check if appointments already exist in local storage
  const existingAppointments = localStorage.getItem('mockAppointments');
  if (!existingAppointments || JSON.parse(existingAppointments).length === 0) {
    localStorage.setItem('mockAppointments', JSON.stringify(appointments));
  }
}; 