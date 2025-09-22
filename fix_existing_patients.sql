-- Fix existing patients that are missing from patients table
USE healthcare_db;

-- Check which users have PATIENT role but no corresponding patients record
SELECT 'Users with PATIENT role but no patients record:' as info;
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

-- Insert missing patient records for existing users
-- Note: This will create basic patient records with default values
-- You may need to update these with actual patient data

INSERT INTO patients (id, phone_number, address, blood_group, age, gender, profile_picture, medical_records)
SELECT 
    u.id,
    '0000000000' as phone_number,
    'Address not provided' as address,
    'Unknown' as blood_group,
    0 as age,
    'Unknown' as gender,
    NULL as profile_picture,
    NULL as medical_records
FROM users u
LEFT JOIN patients p ON u.id = p.id
WHERE u.role = 'PATIENT' AND p.id IS NULL;

-- Verify the fix
SELECT 'After fix - All patients:' as info;
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
JOIN patients p ON u.id = p.id
WHERE u.role = 'PATIENT'
ORDER BY u.created_at DESC;
