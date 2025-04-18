-- Reset Database and Create Fresh Credentials
-- Execute this script in MySQL Workbench to reset the database and create new credentials

-- Drop and recreate the database
DROP DATABASE IF EXISTS hsa_db;
CREATE DATABASE hsa_db;
USE hsa_db;

-- Create tables
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'DOCTOR', 'PATIENT') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'PENDING') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    department VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    qualification VARCHAR(255),
    experience INT,
    phone_number VARCHAR(20),
    profile_image VARCHAR(255),
    bio TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    age INT,
    gender VARCHAR(10),
    blood_group VARCHAR(10),
    address TEXT,
    phone_number VARCHAR(20),
    emergency_contact VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_type ENUM('IN_PERSON', 'TELEMEDICINE') NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE medical_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    diagnosis TEXT NOT NULL,
    prescription TEXT,
    notes TEXT,
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    notification_type VARCHAR(50),
    reference_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE doctor_availability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Insert Admin
INSERT INTO users (name, email, password, role) VALUES 
('System Admin', 'admin@healthcare.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'ADMIN');
-- Note: Password is "Password@1" (hashed with BCrypt)

SET @admin_user_id = LAST_INSERT_ID();
INSERT INTO admins (user_id, department) VALUES (@admin_user_id, 'IT Administration');

-- Insert Doctors
INSERT INTO users (name, email, password, role) VALUES 
('Dr. John Smith', 'john.smith@healthcare.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'DOCTOR');
SET @doctor1_user_id = LAST_INSERT_ID();
INSERT INTO doctors (user_id, specialization, qualification, experience, phone_number, bio) VALUES 
(@doctor1_user_id, 'Cardiology', 'MD, FACC', 15, '+1234567890', 'Specialized in cardiovascular diseases with 15 years of experience');

INSERT INTO users (name, email, password, role) VALUES 
('Dr. Emily Johnson', 'emily.johnson@healthcare.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'DOCTOR');
SET @doctor2_user_id = LAST_INSERT_ID();
INSERT INTO doctors (user_id, specialization, qualification, experience, phone_number, bio) VALUES 
(@doctor2_user_id, 'Dermatology', 'MD, FAAD', 10, '+1234567891', 'Board-certified dermatologist specializing in skin cancer and cosmetic procedures');

INSERT INTO users (name, email, password, role) VALUES 
('Dr. Michael Wong', 'michael.wong@healthcare.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'DOCTOR');
SET @doctor3_user_id = LAST_INSERT_ID();
INSERT INTO doctors (user_id, specialization, qualification, experience, phone_number, bio) VALUES 
(@doctor3_user_id, 'Neurology', 'MD, PhD', 12, '+1234567892', 'Specializes in neurological disorders with research background in Alzheimer's disease');

-- Insert Patient
INSERT INTO users (name, email, password, role) VALUES 
('Sarah Miller', 'sarah.miller@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'PATIENT');
SET @patient1_user_id = LAST_INSERT_ID();
INSERT INTO patients (user_id, age, gender, blood_group, address, phone_number, emergency_contact) VALUES 
(@patient1_user_id, 35, 'Female', 'O+', '123 Main St, Anytown, CA 12345', '+1987654321', '+1987654322');

-- Doctor Availability
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) VALUES 
(1, 'MONDAY', '09:00:00', '17:00:00'),
(1, 'WEDNESDAY', '09:00:00', '17:00:00'),
(1, 'FRIDAY', '09:00:00', '17:00:00'),
(2, 'TUESDAY', '10:00:00', '18:00:00'),
(2, 'THURSDAY', '10:00:00', '18:00:00'),
(3, 'MONDAY', '08:00:00', '16:00:00'),
(3, 'THURSDAY', '08:00:00', '16:00:00');

-- Authentication Note:
-- All users have the password "Password@1" (hashed with BCrypt)
-- Password hash: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG

SELECT 'Database reset completed successfully with new credentials' as 'Status'; 