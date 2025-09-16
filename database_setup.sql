-- Healthcare Appointment System Database Setup
-- Run this script in MySQL Workbench

-- Create database
DROP DATABASE IF EXISTS healthcare_db;
CREATE DATABASE healthcare_db;
USE healthcare_db;

-- Create users table (base table for all user types)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'DOCTOR', 'PATIENT') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create patients table (extends users)
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    blood_group VARCHAR(10),
    age INT,
    gender VARCHAR(10),
    profile_picture TEXT,
    medical_records TEXT,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create doctors table (separate from users for this implementation)
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    specialization VARCHAR(255),
    qualification VARCHAR(255),
    experience VARCHAR(255),
    clinic_address TEXT,
    address TEXT,
    phone_number VARCHAR(20),
    bio TEXT,
    profile_image_url TEXT,
    gender VARCHAR(10),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    profile_picture TEXT,
    credentials_file TEXT,
    consultation_fee DECIMAL(10,2),
    availability_schedule TEXT,
    role VARCHAR(20) DEFAULT 'DOCTOR',
    account_non_expired BOOLEAN DEFAULT TRUE,
    account_non_locked BOOLEAN DEFAULT TRUE,
    credentials_non_expired BOOLEAN DEFAULT TRUE,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    doctor_specialization VARCHAR(255),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_type VARCHAR(100),
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    notes TEXT,
    created_at DATE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_appointment_date (appointment_date)
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT,
    date DATE NOT NULL,
    follow_up_date DATE,
    created_at DATE,
    updated_at DATE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_date (date)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id VARCHAR(255) NOT NULL,
    recipient_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    INDEX idx_recipient (recipient_id, recipient_type),
    INDEX idx_created_at (created_at)
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('System Admin', 'admin@healthcare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN')
ON DUPLICATE KEY UPDATE name = name;

-- Insert sample doctor (password: doctor123)
INSERT INTO doctors (id, name, email, password, specialization, qualification, experience, clinic_address) VALUES 
('doc-001', 'Dr. John Smith', 'doctor@healthcare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cardiology', 'MD Cardiology', '10 years', '123 Medical Center, City')
ON DUPLICATE KEY UPDATE name = name;

-- Insert sample patient (password: patient123)
INSERT INTO users (name, email, password, role) VALUES 
('Jane Doe', 'patient@healthcare.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PATIENT')
ON DUPLICATE KEY UPDATE name = name;

-- Get the patient ID and insert into patients table
SET @patient_id = (SELECT id FROM users WHERE email = 'patient@healthcare.com');
INSERT INTO patients (id, phone_number, address, blood_group, age, gender) VALUES 
(@patient_id, '+1234567890', '456 Patient Street, City', 'O+', 30, 'Female')
ON DUPLICATE KEY UPDATE phone_number = phone_number;

-- Show created tables
SHOW TABLES;

SELECT 'Database setup completed successfully!' as Status;
