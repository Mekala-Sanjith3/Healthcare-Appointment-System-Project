-- Add updated_at column to doctors table
-- This script adds the updated_at column to track when doctor records are last modified

-- Add the updated_at column to the doctors table
ALTER TABLE doctors 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing records to set updated_at to created_at value
UPDATE doctors 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Add index for better query performance
CREATE INDEX idx_doctors_updated_at ON doctors(updated_at);

-- Verify the changes
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'doctors' 
AND COLUMN_NAME IN ('created_at', 'updated_at')
ORDER BY ORDINAL_POSITION;
