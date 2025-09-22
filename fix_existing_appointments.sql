-- Fix existing appointments with missing names
USE healthcare_db;

-- Update appointments with missing patient names
UPDATE appointments a
JOIN patients p ON a.patient_id = p.id
SET 
    a.patient_name = p.name,
    a.patient_email = p.email
WHERE a.patient_name IS NULL OR a.patient_name = '';

-- Update appointments with missing doctor names
UPDATE appointments a
JOIN doctors d ON a.doctor_id = d.id
SET 
    a.doctor_name = d.name,
    a.doctor_specialization = d.specialization
WHERE a.doctor_name IS NULL OR a.doctor_name = '';

-- Verify the fix
SELECT 'Fixed appointments:' as info;
SELECT 
    id,
    patient_id,
    patient_name,
    patient_email,
    doctor_id,
    doctor_name,
    doctor_specialization,
    appointment_date,
    appointment_time,
    status,
    notes
FROM appointments
ORDER BY created_at DESC
LIMIT 10;
