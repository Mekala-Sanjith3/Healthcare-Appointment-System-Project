-- Fix users table to add missing columns
USE healthcare_db;

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Verify the changes
DESCRIBE users;

-- Now test the queries
SELECT 'Users table structure:' as info;
DESCRIBE users;

-- Test admin query
SELECT 'Admin details:' as info;
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

-- Test patient query
SELECT 'Patient details:' as info;
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
