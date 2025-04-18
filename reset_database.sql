-- Drop and recreate the database to start fresh
DROP DATABASE IF EXISTS hsa_db;
CREATE DATABASE hsa_db;
USE hsa_db;

-- Create the required tables
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_non_expired BOOLEAN DEFAULT TRUE,
    account_non_locked BOOLEAN DEFAULT TRUE,
    credentials_non_expired BOOLEAN DEFAULT TRUE,
    enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE admins (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id)
);

CREATE TABLE doctors (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    specialization VARCHAR(100),
    qualification VARCHAR(255),
    experience VARCHAR(50),
    clinic_address VARCHAR(255),
    address VARCHAR(255),
    phone_number VARCHAR(20),
    bio TEXT,
    profile_image_url VARCHAR(255),
    gender VARCHAR(10),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    profile_picture VARCHAR(255),
    credentials_file VARCHAR(255),
    consultation_fee DECIMAL(10, 2),
    availability_schedule TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id)
);

CREATE TABLE patients (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INT,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    phone_number VARCHAR(20),
    address VARCHAR(255),
    medical_history TEXT,
    emergency_contact VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id)
);

CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    patient_email VARCHAR(100) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    doctor_name VARCHAR(100) NOT NULL,
    doctor_specialization VARCHAR(100),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE medical_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT,
    file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    notification_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE doctor_availability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id VARCHAR(36) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    UNIQUE KEY (doctor_id, day_of_week)
);

-- Insert sample data
-- Admin user (password: Password@1)
INSERT INTO users (id, email, password, role) VALUES 
('admin_1', 'admin@healthcare.com', '$2a$10$X7NVPkrA4xYl5BVsLKGGgexlrBLZCjH9SvCBHWJ5TM1yCmGnX9vWm', 'ADMIN');

INSERT INTO admins (id, name, email, password) VALUES 
('admin_1', 'Admin User', 'admin@healthcare.com', '$2a$10$X7NVPkrA4xYl5BVsLKGGgexlrBLZCjH9SvCBHWJ5TM1yCmGnX9vWm');

-- Sample Doctor accounts (password: Password@1)
INSERT INTO users (id, email, password, role) VALUES 
('doctor_1', 'rajesh.kumar@healthcare.com', '$2a$10$X7NVPkrA4xYl5BVsLKGGgexlrBLZCjH9SvCBHWJ5TM1yCmGnX9vWm', 'DOCTOR'),
('doctor_2', 'priya.sharma@healthcare.com', '$2a$10$X7NVPkrA4xYl5BVsLKGGgexlrBLZCjH9SvCBHWJ5TM1yCmGnX9vWm', 'DOCTOR'),
('doctor_3', 'mohan.venkat@healthcare.com', '$2a$10$X7NVPkrA4xYl5BVsLKGGgexlrBLZCjH9SvCBHWJ5TM1yCmGnX9vWm', 'DOCTOR');

INSERT INTO doctors (id, name, email, password, specialization, qualification, experience, status) VALUES 
('doctor_1', 'Dr. Rajesh Kumar', 'rajesh.kumar@healthcare.com', '$2a$10$X7NVPkrA4xYl5BVsLKGGgexlrBLZCjH9SvCBHWJ5TM1yCmGnX9vWm', 'Cardiology', 'MD (Cardiology), MBBS', '12 years', 'ACTIVE'),
('doctor_2', 'Dr. Priya Sharma', 'priya.sharma@healthcare.com', '$2a$10$X7NVPkrA4xYl5BVsLKGGgexlrBLZCjH9SvCBHWJ5TM1yCmGnX9vWm', 'Dermatology', 'MD (Dermatology), MBBS', '8 years', 'ACTIVE'),
('doctor_3', 'Dr. Mohan Venkat', 'mohan.venkat@healthcare.com', '$2a$10$X7NVPkrA4xYl5BVsLKGGgexlrBLZCjH9SvCBHWJ5TM1yCmGnX9vWm', 'General Medicine', 'MD (General Medicine), MBBS', '15 years', 'ACTIVE');

-- Sample Patient account (password: Password@1)
INSERT INTO users (id, email, password, role) VALUES 
('patient_1', 'rahul@example.com', '$2a$10$X7NVPkrA4xYl5BVsLKGGgexlrBLZCjH9SvCBHWJ5TM1yCmGnX9vWm', 'PATIENT');

INSERT INTO patients (id, name, email, password, age, gender, blood_group, phone_number, address, status) VALUES 
('patient_1', 'Rahul Patel', 'rahul@example.com', '$2a$10$X7NVPkrA4xYl5BVsLKGGgexlrBLZCjH9SvCBHWJ5TM1yCmGnX9vWm', 35, 'Male', 'O+', '9876543210', '123 Main Street, Bangalore', 'ACTIVE');

-- Set up doctor availability
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available) VALUES
('doctor_1', 'MONDAY', '09:00:00', '17:00:00', TRUE),
('doctor_1', 'TUESDAY', '09:00:00', '17:00:00', TRUE),
('doctor_1', 'WEDNESDAY', '09:00:00', '17:00:00', TRUE),
('doctor_1', 'THURSDAY', '09:00:00', '17:00:00', TRUE),
('doctor_1', 'FRIDAY', '09:00:00', '15:00:00', TRUE),
('doctor_2', 'MONDAY', '10:00:00', '18:00:00', TRUE),
('doctor_2', 'WEDNESDAY', '10:00:00', '18:00:00', TRUE),
('doctor_2', 'FRIDAY', '10:00:00', '18:00:00', TRUE),
('doctor_3', 'MONDAY', '08:00:00', '16:00:00', TRUE),
('doctor_3', 'TUESDAY', '08:00:00', '16:00:00', TRUE),
('doctor_3', 'THURSDAY', '08:00:00', '16:00:00', TRUE),
('doctor_3', 'FRIDAY', '08:00:00', '12:00:00', TRUE);

-- Sample appointment
INSERT INTO appointments (patient_id, patient_name, patient_email, doctor_id, doctor_name, doctor_specialization, appointment_date, appointment_time, appointment_type, status, notes) VALUES
('patient_1', 'Rahul Patel', 'rahul@example.com', 'doctor_1', 'Dr. Rajesh Kumar', 'Cardiology', CURDATE() + INTERVAL 3 DAY, '10:00:00', 'Consultation', 'CONFIRMED', 'Regular checkup for blood pressure monitoring'); 