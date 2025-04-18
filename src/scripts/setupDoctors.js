/**
 * This script creates 10 doctor accounts with different specializations
 * and stores them in localStorage for the mock implementation.
 */

const setupDoctors = () => {
  // Check if doctors are already set up
  const existingDoctors = JSON.parse(localStorage.getItem('mockDoctors') || '[]');
  if (existingDoctors.length >= 10) {
    console.log('Doctors are already set up.');
    return existingDoctors;
  }

  // Doctor data with different specializations
  const doctors = [
    {
      id: 'doctor_1',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@healthcare.com',
      password: 'Password@1',
      specialization: 'Cardiology',
      experience: '12 years',
      qualification: 'MD (Cardiology), MBBS',
      rating: 4.8,
      reviewCount: 156,
      about: 'Dr. Rajesh Kumar is a cardiologist with over 12 years of experience in treating heart diseases and related conditions.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor_2',
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@healthcare.com',
      password: 'Password@1',
      specialization: 'Dermatology',
      experience: '8 years',
      qualification: 'MD (Dermatology), MBBS',
      rating: 4.7,
      reviewCount: 134,
      about: 'Dr. Priya Sharma specializes in diagnosing and treating skin disorders, including cosmetic dermatology.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor_3',
      name: 'Dr. Mohan Venkat',
      email: 'mohan.venkat@healthcare.com',
      password: 'Password@1',
      specialization: 'General Medicine',
      experience: '15 years',
      qualification: 'MD (General Medicine), MBBS',
      rating: 4.9,
      reviewCount: 212,
      about: 'Dr. Mohan Venkat has extensive experience in internal medicine, preventive healthcare, and chronic disease management.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor_4',
      name: 'Dr. Ananya Patel',
      email: 'ananya.patel@healthcare.com',
      password: 'Password@1',
      specialization: 'Gynecology',
      experience: '10 years',
      qualification: 'MD (Obstetrics & Gynecology), MBBS',
      rating: 4.8,
      reviewCount: 178,
      about: 'Dr. Ananya Patel specializes in women\'s health, reproductive medicine, and prenatal care.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor_5',
      name: 'Dr. Vijay Singh',
      email: 'vijay.singh@healthcare.com',
      password: 'Password@1',
      specialization: 'Orthopedics',
      experience: '14 years',
      qualification: 'MS (Orthopedics), MBBS',
      rating: 4.6,
      reviewCount: 145,
      about: 'Dr. Vijay Singh specializes in musculoskeletal conditions including sports injuries and joint replacements.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor_6',
      name: 'Dr. Meera Reddy',
      email: 'meera.reddy@healthcare.com',
      password: 'Password@1',
      specialization: 'Pediatrics',
      experience: '9 years',
      qualification: 'MD (Pediatrics), MBBS',
      rating: 4.9,
      reviewCount: 190,
      about: 'Dr. Meera Reddy specializes in the health and development of infants, children, and adolescents.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor_7',
      name: 'Dr. Arjun Mehta',
      email: 'arjun.mehta@healthcare.com',
      password: 'Password@1',
      specialization: 'Neurology',
      experience: '11 years',
      qualification: 'DM (Neurology), MD, MBBS',
      rating: 4.7,
      reviewCount: 128,
      about: 'Dr. Arjun Mehta specializes in diagnosing and treating disorders of the nervous system.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor_8',
      name: 'Dr. Sanjana Iyer',
      email: 'sanjana.iyer@healthcare.com',
      password: 'Password@1',
      specialization: 'Psychiatry',
      experience: '7 years',
      qualification: 'MD (Psychiatry), MBBS',
      rating: 4.5,
      reviewCount: 112,
      about: 'Dr. Sanjana Iyer specializes in mental health, including diagnosis, prevention, and treatment of mental disorders.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor_9',
      name: 'Dr. Kiran Joshi',
      email: 'kiran.joshi@healthcare.com',
      password: 'Password@1',
      specialization: 'Ophthalmology',
      experience: '13 years',
      qualification: 'MS (Ophthalmology), MBBS',
      rating: 4.8,
      reviewCount: 167,
      about: 'Dr. Kiran Joshi specializes in eye and vision care, including surgery and treatment of eye diseases.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor_10',
      name: 'Dr. Rahul Gupta',
      email: 'rahul.gupta@healthcare.com',
      password: 'Password@1',
      specialization: 'ENT',
      experience: '10 years',
      qualification: 'MS (ENT), MBBS',
      rating: 4.6,
      reviewCount: 130,
      about: 'Dr. Rahul Gupta specializes in conditions related to the ear, nose, and throat.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    }
  ];

  // Store in localStorage
  localStorage.setItem('mockDoctors', JSON.stringify(doctors));
  console.log('10 doctor accounts have been set up successfully!');

  // Return the created doctors
  return doctors;
};

// Export function for use in other files
export default setupDoctors; 