-- Check current database schema and data
USE healthcare_db;

-- Check if patients table exists and has data
SELECT 'Patients table structure:' as info;
DESCRIBE patients;

SELECT 'Patients table data:' as info;
SELECT * FROM patients;

-- Check users table
SELECT 'Users table structure:' as info;
DESCRIBE users;

SELECT 'Users table data:' as info;
SELECT * FROM users;

-- Check if there are any foreign key constraints
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
