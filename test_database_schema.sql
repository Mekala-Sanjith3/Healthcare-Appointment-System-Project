-- Test database schema and data integrity
USE healthcare_db;

-- Check if tables exist and their structure
SELECT 'Database tables:' as info;
SHOW TABLES;

-- Check users table structure
SELECT 'Users table structure:' as info;
DESCRIBE users;

-- Check patients table structure  
SELECT 'Patients table structure:' as info;
DESCRIBE patients;

-- Check foreign key constraints
SELECT 'Foreign key constraints:' as info;
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_NAME = 'users' 
AND TABLE_SCHEMA = 'healthcare_db';

-- Check current data counts
SELECT 'Data counts:' as info;
SELECT 'Users count:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Patients count:', COUNT(*) FROM patients
UNION ALL
SELECT 'Admins count:', COUNT(*) FROM admins
UNION ALL
SELECT 'Doctors count:', COUNT(*) FROM doctors;

-- Check latest patient registrations
SELECT 'Latest patient registrations:' as info;
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.created_at,
    CASE 
        WHEN p.id IS NOT NULL THEN 'YES' 
        ELSE 'NO' 
    END as has_patient_record,
    p.phone_number,
    p.address,
    p.blood_group,
    p.age,
    p.gender
FROM users u
LEFT JOIN patients p ON u.id = p.id
WHERE u.role = 'PATIENT'
ORDER BY u.created_at DESC
LIMIT 10;
