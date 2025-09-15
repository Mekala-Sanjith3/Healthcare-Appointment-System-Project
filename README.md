# Healthcare Appointment System

A comprehensive full-stack healthcare platform that connects patients with doctors, manages appointments, and maintains medical records with a modern, responsive user interface.

## 🌟 Features

### User Management
- **Multi-role Authentication**: Separate login flows for patients, doctors, and administrators
- **Profile Management**: Users can update their personal information and credentials
- **Role-based Access Control**: Different permissions and views based on user role

### Appointment System
- **Doctor Discovery**: Patients can search and browse doctors by specialization
- **Appointment Scheduling**: Interactive calendar for booking appointments with available time slots
- **Appointment Management**: View, reschedule, or cancel upcoming appointments
- **Notifications System**: Status updates on appointment confirmations and changes

### Doctor Features
- **Patient Management**: View assigned patients and their medical history
- **Appointment Dashboard**: Manage daily/weekly schedule with appointment status updates
- **Medical Records**: Create and update patient medical information
- **Availability Management**: Set working hours and unavailable time slots

### Patient Features
- **Doctor Selection**: Find doctors based on specialization, ratings, and availability
- **Appointment Booking**: Easy scheduling interface with date and time selection
- **Medical History**: Access to personal medical records and past appointments
- **Health Insights**: View treatment plans and medical recommendations

### Administrative Tools
- **User Management**: Create, update, and manage doctor and patient accounts
- **System Monitoring**: Dashboard with key metrics and system activity
- **Data Management**: Tools for maintaining medical records and appointment data

## 🛠️ Recent Bug Fixes & Improvements

- Fixed appointment persistence issues where appointments weren't correctly stored in MySQL database
- Resolved field name mismatch between frontend and backend API calls
- Standardized API communication format between React frontend and Spring Boot backend
- Improved error handling and user feedback in appointment booking flow
- Enhanced form validation for user inputs across the application

## 📋 Technical Stack

### Frontend
- **Framework**: React.js with Vite build tool
- **Routing**: React Router for navigation
- **UI Components**: Custom components with modern design principles
- **Charts & Visualization**: Chart.js for data visualization
- **HTTP Client**: Axios for API communication

### Backend
- **Java Framework**: Spring Boot 3.2.3
- **Security**: Spring Security with JWT authentication
- **Database Access**: Spring Data JPA for database operations
- **API Layer**: RESTful API endpoints with proper error handling

### Database
- **Engine**: MySQL 8.0
- **ORM**: Hibernate (via Spring Data JPA)
- **Schema**: Relational model with proper constraints and relationships

## 🚀 Getting Started

### Prerequisites
- Node.js (v14.0.0 or higher)
- Java 17 or higher
- Maven 3.6 or higher
- MySQL 8.0

## 📦 Project Structure

```
healthcare-appointment-system/
├── backend/                  # Spring Boot backend
│   ├── src/                  # Java source files
│   ├── pom.xml               # Maven dependencies
│   └── ...
├── src/                      # React frontend
│   ├── components/           # Reusable UI components
│   ├── pages/                # Page components
│   ├── services/             # API and helper services
│   ├── contexts/             # React context providers
│   └── ...
├── public/                   # Static assets
├── package.json              # NPM dependencies
└── ...
```

## 🔄 Workflow

1. **Patient Appointment Booking**:
   - Patient logs in and navigates to "Find a Doctor"
   - Selects a doctor based on specialization
   - Chooses available date and time slot
   - Fills appointment details and confirms booking
   - Views appointment in dashboard

2. **Doctor Appointment Management**:
   - Doctor logs in to view dashboard with upcoming appointments
   - Updates appointment status (confirm/reschedule/cancel)
   - Adds notes or medical records after appointment
   - Updates availability for future appointments

## 📧 Contact

For questions or support, please contact me.

## Continuous Integration/Continuous Deployment (CI/CD)

This project is set up with CI/CD using GitHub Actions for automated deployment.

### Deployment Architecture

- **Frontend**: React app deployed to Netlify
- **Backend API**: Node.js Express API deployed to Railway
- **API Gateway**: Express-based API Gateway deployed to Heroku
- **Database**: MongoDB Atlas (Cloud Database)

### Deployment Status

| Component | Status | URL |
|-----------|--------|-----|
| Frontend | [![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys) | [https://healthcare-app.netlify.app](https://healthcare-app.netlify.app) |
| API Gateway | [![Heroku Status](https://heroku-badge.herokuapp.com/?app=healthcare-api-gateway)](https://healthcare-api-gateway.herokuapp.com) | [https://healthcare-api-gateway.herokuapp.com](https://healthcare-api-gateway.herokuapp.com) |
| Backend API | Deployed to Railway | [https://healthcare-api.railway.app](https://healthcare-api.railway.app) |

### Deployment Process

For detailed instructions on the CI/CD process and manual deployment options, please see the [DEPLOYMENT.md](DEPLOYMENT.md) file.