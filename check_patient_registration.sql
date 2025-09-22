-- Check Patient Registration Status
USE healthcare_db;

-- Check all users in the system
SELECT 'All Users in System:' as info;
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.created_at,
    CASE 
        WHEN u.role = 'PATIENT' THEN p.phone_number
        WHEN u.role = 'ADMIN' THEN a.contact_number
        ELSE NULL
    END as contact,
    CASE 
        WHEN u.role = 'PATIENT' THEN p.address
        WHEN u.role = 'ADMIN' THEN a.department
        ELSE NULL
    END as address_info
FROM users u
LEFT JOIN patients p ON u.id = p.id
LEFT JOIN admins a ON u.id = a.id
ORDER BY u.created_at DESC;

-- Check patients specifically
SELECT 'Patients Table:' as info;
SELECT 
    id,
    name,
    email,
    phone_number,
    address,
    blood_group,
    age,
    gender,
    created_at
FROM patients
ORDER BY created_at DESC;

-- Check if there are any orphaned users (users without corresponding patient/admin records)
SELECT 'Orphaned Users:' as info;
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.created_at
FROM users u
LEFT JOIN patients p ON u.id = p.id
LEFT JOIN admins a ON u.id = a.id
WHERE u.role = 'PATIENT' AND p.id IS NULL
   OR u.role = 'ADMIN' AND a.id IS NULL;
