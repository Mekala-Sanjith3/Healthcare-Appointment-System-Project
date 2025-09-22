-- Fix doctors table structure for real-time status management
-- This script ensures the doctors table has all necessary columns for status updates

-- First, check if the table exists and its current structure
DESCRIBE doctors;

-- Add updated_at column if it doesn't exist
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Ensure status column exists and has proper values
ALTER TABLE doctors 
MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE', 'PENDING') DEFAULT 'ACTIVE';

-- Update any NULL status values to ACTIVE
UPDATE doctors 
SET status = 'ACTIVE' 
WHERE status IS NULL;

-- Ensure created_at column exists
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to set updated_at to created_at value if needed
UPDATE doctors 
SET updated_at = created_at 
WHERE updated_at IS NULL OR updated_at = '0000-00-00 00:00:00';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_doctors_updated_at ON doctors(updated_at);
CREATE INDEX IF NOT EXISTS idx_doctors_created_at ON doctors(created_at);

-- Verify the final structure
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'doctors' 
ORDER BY ORDINAL_POSITION;

-- Show sample data to verify
SELECT 
    id, 
    name, 
    email, 
    status, 
    created_at, 
    updated_at 
FROM doctors 
LIMIT 5;
