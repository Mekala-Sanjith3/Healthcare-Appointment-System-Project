-- Check all registered users in the healthcare system
USE healthcare_db;

-- First, let's see the structure of all tables
SELECT 'Users table structure:' as info;
DESCRIBE users;

SELECT 'Patients table structure:' as info;
DESCRIBE patients;

SELECT 'Admins table structure:' as info;
DESCRIBE admins;

SELECT 'Doctors table structure:' as info;
DESCRIBE doctors;

-- Now check all data
SELECT 'All Users (Base Table):' as info;
SELECT * FROM users ORDER BY id;

SELECT 'All Patients (with User details):' as info;
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.created_at,
    p.phone_number,
    p.address,
    p.blood_group,
    p.age,
    p.gender,
    p.profile_picture,
    p.medical_records
FROM users u
JOIN patients p ON u.id = p.id
ORDER BY u.created_at DESC;

SELECT 'All Admins (with User details):' as info;
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.created_at,
    a.department,
    a.contact_number
FROM users u
JOIN admins a ON u.id = a.id
ORDER BY u.created_at DESC;

SELECT 'All Doctors (standalone):' as info;
SELECT 
    id,
    name,
    email,
    role,
    created_at,
    specialization,
    qualification,
    experience,
    clinic_address,
    phone_number,
    gender,
    status
FROM doctors
ORDER BY created_at DESC;

-- Complete overview of all users
SELECT 'Complete User Overview:' as info;
SELECT 
    'Patient' as user_type,
    u.id,
    u.name,
    u.email,
    u.role,
    u.created_at,
    p.phone_number as contact,
    p.address,
    p.blood_group,
    p.age,
    p.gender
FROM users u
JOIN patients p ON u.id = p.id

UNION ALL

SELECT 
    'Doctor' as user_type,
    d.id,
    d.name,
    d.email,
    d.role,
    d.created_at,
    d.phone_number as contact,
    d.clinic_address as address,
    d.specialization as blood_group,
    NULL as age,
    d.gender
FROM doctors d

UNION ALL

SELECT 
    'Admin' as user_type,
    u.id,
    u.name,
    u.email,
    u.role,
    u.created_at,
    a.contact_number as contact,
    a.department as address,
    NULL as blood_group,
    NULL as age,
    NULL as gender
FROM users u
JOIN admins a ON u.id = a.id

ORDER BY id DESC;
