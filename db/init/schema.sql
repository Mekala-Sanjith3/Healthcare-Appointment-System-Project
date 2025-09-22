-- SIMPLE WORKING DATABASE SCHEMA
-- Drop and recreate everything clean

DROP DATABASE IF EXISTS healthcare_db;
CREATE DATABASE healthcare_db;
USE healthcare_db;

-- Users table (base table)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'DOCTOR', 'PATIENT') NOT NULL
);

-- Admins table (extends users)
CREATE TABLE admins (
    id BIGINT PRIMARY KEY,
    department VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Patients table (extends users)
CREATE TABLE patients (
    id BIGINT PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    address VARCHAR(500) NOT NULL,
    blood_group VARCHAR(10),
    age INT,
    gender VARCHAR(10),
    profile_picture VARCHAR(500),
    medical_records TEXT,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Doctors table (standalone)
CREATE TABLE doctors (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    specialization VARCHAR(255),
    qualification VARCHAR(255),
    experience VARCHAR(100),
    clinic_address VARCHAR(500),
    address VARCHAR(500),
    phone_number VARCHAR(20),
    bio TEXT,
    profile_image_url VARCHAR(500),
    gender VARCHAR(10),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    profile_picture VARCHAR(500),
    credentials_file VARCHAR(500),
    consultation_fee DECIMAL(10,2),
    availability_schedule TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(20) DEFAULT 'DOCTOR',
    account_non_expired BOOLEAN DEFAULT TRUE,
    account_non_locked BOOLEAN DEFAULT TRUE,
    credentials_non_expired BOOLEAN DEFAULT TRUE,
    enabled BOOLEAN DEFAULT TRUE
);

-- Appointments table
CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT,
    patient_name VARCHAR(255),
    patient_email VARCHAR(255),
    doctor_id VARCHAR(36),
    doctor_name VARCHAR(255),
    doctor_specialization VARCHAR(255),
    appointment_date DATE,
    appointment_time TIME,
    appointment_type VARCHAR(100),
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    notes TEXT,
    created_at DATE DEFAULT (CURRENT_DATE),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Medical records table
CREATE TABLE medical_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT,
    patient_name VARCHAR(255),
    doctor_id VARCHAR(36),
    doctor_name VARCHAR(255),
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT,
    date DATE,
    follow_up_date DATE,
    created_at DATE DEFAULT (CURRENT_DATE),
    updated_at DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

SELECT 'Database created successfully!' as status;
