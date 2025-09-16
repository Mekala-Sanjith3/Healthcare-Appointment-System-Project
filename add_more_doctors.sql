-- Add more doctors to the database for testing
USE healthcare_db;

-- Insert additional doctors
INSERT INTO doctors (id, name, email, password, specialization, phone_number, address, experience, qualification, consultation_fee, status, created_at) VALUES
('DOC002', 'Dr. Emily Johnson', 'emily.johnson@hospital.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cardiology', '+1-555-0102', '456 Medical Plaza, Healthcare City', '8', 'MD Cardiology', 150.00, 'ACTIVE', NOW()),
('DOC003', 'Dr. Michael Brown', 'michael.brown@hospital.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Neurology', '+1-555-0103', '789 Brain Center, Medical District', '12', 'MD Neurology, PhD', 200.00, 'ACTIVE', NOW()),
('DOC004', 'Dr. Sarah Wilson', 'sarah.wilson@hospital.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pediatrics', '+1-555-0104', '321 Children Hospital, Kids Lane', '6', 'MD Pediatrics', 120.00, 'ACTIVE', NOW()),
('DOC005', 'Dr. David Lee', 'david.lee@hospital.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Orthopedics', '+1-555-0105', '654 Bone Clinic, Surgery Street', '10', 'MD Orthopedic Surgery', 180.00, 'ACTIVE', NOW()),
('DOC006', 'Dr. Lisa Garcia', 'lisa.garcia@hospital.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dermatology', '+1-555-0106', '987 Skin Care Center, Beauty Boulevard', '7', 'MD Dermatology', 140.00, 'ACTIVE', NOW());

-- Verify the doctors were inserted
SELECT COUNT(*) as total_doctors FROM doctors;
SELECT id, name, specialization, consultation_fee FROM doctors;
