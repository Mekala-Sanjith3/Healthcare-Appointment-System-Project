-- Clean up all test data created during debugging
USE healthcare_db;

-- Remove test patients I created
DELETE FROM patients WHERE id IN (8, 9); -- Remove test patients
DELETE FROM users WHERE id IN (8, 9); -- Remove corresponding user records

-- Verify cleanup
SELECT 'Remaining patients after cleanup:' as info;
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

-- Show current state
SELECT 'Current database state:' as info;
SELECT 'Users table count:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Patients table count:', COUNT(*) FROM patients
UNION ALL
SELECT 'Admins table count:', COUNT(*) FROM admins
UNION ALL
SELECT 'Doctors table count:', COUNT(*) FROM doctors;
