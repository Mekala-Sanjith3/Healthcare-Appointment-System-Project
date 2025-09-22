-- Check current patient data in database
USE healthcare_db;

-- Check all users with PATIENT role
SELECT 'All Users with PATIENT role:' as info;
SELECT 
    id,
    name,
    email,
    role,
    created_at,
    updated_at
FROM users 
WHERE role = 'PATIENT'
ORDER BY created_at DESC;

-- Check all records in patients table
SELECT 'All records in patients table:' as info;
SELECT 
    id,
    phone_number,
    address,
    blood_group,
    age,
    gender,
    profile_picture,
    medical_records
FROM patients
ORDER BY id DESC;

-- Check JOIN between users and patients
SELECT 'JOIN between users and patients:' as info;
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
    p.gender
FROM users u
LEFT JOIN patients p ON u.id = p.id
WHERE u.role = 'PATIENT'
ORDER BY u.created_at DESC;

-- Check for any missing patient records
SELECT 'Missing patient records (users without patients table entry):' as info;
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.created_at
FROM users u
LEFT JOIN patients p ON u.id = p.id
WHERE u.role = 'PATIENT' AND p.id IS NULL
ORDER BY u.created_at DESC;
