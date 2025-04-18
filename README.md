# Healthcare Appointment System

A comprehensive healthcare platform that connects patients with doctors, manages appointments, medical records, and provides AI-powered health insights.

## 🚀 New Features Implemented

### Enhanced User Interface and Experience
- **Advanced UI Components**: All dashboards now feature modern UI elements with animations, transitions, and responsive design
- **Global Styling**: Standardized design system with consistent color scheme, spacing, and typography
- **Interactive Elements**: Enhanced buttons, cards, and form inputs with hover effects and visual feedback

### Appointment Booking System
- **Doctor Search and Browse**: Patients can browse doctors by specialization 
- **Appointment Scheduling**: Book, manage, and view appointment status
- **Calendar Integration**: View doctor availability and select convenient time slots
- **Notifications**: Get updates on appointment confirmation, cancellation, or rescheduling

### Dashboard Improvements
- **Doctor Dashboard**: 
  - View and manage patient appointments
  - Update appointment status (confirm/cancel)
  - Check daily/weekly schedule
  - Access patient medical history

- **Patient Dashboard**:
  - Book and manage appointments
  - View upcoming and past appointments
  - Access medical history and records
  - Get AI-powered health recommendations

- **Admin Dashboard**:
  - Comprehensive doctor and patient management
  - Advanced data visualization with charts and statistics
  - Medical records management with search and filter capabilities
  - System-wide appointment oversight

## 🧑‍⚕️ Pre-configured Doctor Accounts

Use these accounts to test the doctor dashboard functionality:

| Name | Email | Password | Specialization |
|------|-------|----------|---------------|
| Dr. Rajesh Kumar | rajesh.kumar@healthcare.com | Password@1 | Cardiology |
| Dr. Priya Sharma | priya.sharma@healthcare.com | Password@1 | Dermatology |
| Dr. Mohan Venkat | mohan.venkat@healthcare.com | Password@1 | General Medicine |

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v14.0.0 or higher)
- MySQL database

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/healthcare-appointment-system.git
   cd healthcare-appointment-system
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a database
   ```
   Run the reset_database.sql script in your MySQL Workbench
   ```

4. Start the backend server
   ```
   cd backend
   mvn spring-boot:run
   ```

5. Start the frontend development server
   ```
   npm run dev
   ```

6. Access the application at `http://localhost:5173`

### Default Login Information

#### Admin Login
- Email: admin@healthcare.com
- Password: Password@1

#### Doctor Login 
- Email: rajesh.kumar@healthcare.com
- Password: Password@1

#### Patient Login
- Email: rahul@example.com
- Password: Password@1

## 📋 Usage Flow

### Patient
1. Login or register as a patient
2. Browse available doctors by specialization
3. Book an appointment by selecting a doctor, date, and time slot
4. View appointment status and history in the dashboard
5. Access medical records and AI health recommendations

### Doctor
1. Login with doctor credentials
2. View upcoming appointments on the dashboard
3. Confirm or cancel patient appointments
4. Access patient information and medical history
5. Update availability schedule

### Admin
1. Login with admin credentials
2. Manage doctor and patient accounts
3. Oversee all appointments and medical records
4. View analytics dashboard with system statistics

## 🧪 Technical Implementation

- **Frontend**: React, React Router, CSS modules
- **Backend**: Spring Boot, MySQL
- **Authentication**: JWT-based authentication
- **Data Storage**: MySQL database + Local Storage for development
- **API**: REST API with mock implementation for development

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Acknowledgements

- All the contributors and team members who helped build this project
- The open-source community for the amazing tools and libraries