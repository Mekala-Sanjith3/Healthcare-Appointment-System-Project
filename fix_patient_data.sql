-- Fix Patient Data in Database
USE healthcare_db;

-- Check current state
SELECT 'Current Users:' as info;
SELECT id, name, email, role, created_at FROM users ORDER BY id;

SELECT 'Current Patients:' as info;
SELECT id, name, email, phone_number, address, blood_group, age, gender, created_at FROM patients ORDER BY id;

-- Find users with PATIENT role who don't have corresponding patient records
SELECT 'Orphaned Patient Users:' as info;
SELECT u.id, u.name, u.email, u.role, u.created_at
FROM users u
LEFT JOIN patients p ON u.id = p.id
WHERE u.role = 'PATIENT' AND p.id IS NULL;

-- Create patient records for orphaned users
INSERT INTO patients (id, name, email, password, phone_number, address, blood_group, age, gender, created_at, updated_at)
SELECT 
    u.id,
    u.name,
    u.email,
    u.password,
    'Not provided' as phone_number,
    'Not provided' as address,
    NULL as blood_group,
    NULL as age,
    NULL as gender,
    u.created_at,
    u.updated_at
FROM users u
LEFT JOIN patients p ON u.id = p.id
WHERE u.role = 'PATIENT' AND p.id IS NULL;

-- Verify the fix
SELECT 'After Fix - All Patients:' as info;
SELECT id, name, email, phone_number, address, blood_group, age, gender, created_at FROM patients ORDER BY id;

SELECT 'Database Status After Fix:' as info;
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'PATIENT') as patient_users,
    (SELECT COUNT(*) FROM patients) as patient_records,
    (SELECT COUNT(*) FROM users WHERE role = 'ADMIN') as admin_users,
    (SELECT COUNT(*) FROM admins) as admin_records,
    (SELECT COUNT(*) FROM doctors) as doctor_records;
