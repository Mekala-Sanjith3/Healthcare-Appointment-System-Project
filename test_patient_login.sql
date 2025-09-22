-- Test patient login data
USE healthcare_db;

-- Check all patients in the system
SELECT 'All Patients in Database:' as info;
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
ORDER BY u.created_at DESC;

-- Check which patient is currently logged in (if any)
SELECT 'Current Patient Data:' as info;
SELECT 
    'If you see "patient1" in the portal, you are logged in as:' as message,
    u.id,
    u.name,
    u.email
FROM users u
WHERE u.email = 'patient1@gmail.com';

SELECT 'If you see "Test Patient" in the portal, you are logged in as:' as message,
    u.id,
    u.name,
    u.email
FROM users u
WHERE u.email = 'testpatient@example.com';
