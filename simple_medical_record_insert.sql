-- Simple medical record insertion for existing completed appointment
USE healthcare_db;

-- Insert medical record directly for Ganesh Mannava's completed appointment
INSERT INTO medical_records (
    patient_id, 
    patient_name, 
    doctor_id, 
    doctor_name, 
    diagnosis, 
    prescription, 
    notes, 
    date, 
    created_at, 
    updated_at
) VALUES (
    5,  -- Ganesh Mannava's patient ID
    'Ganesh Mannava',  -- Patient name
    'b0397389-2b6d-4867-897b-76c8c1befc98',  -- Umesh chandra's doctor ID
    'Umesh chandra',  -- Doctor name
    'Appointment Completed',  -- Diagnosis
    'Prescription details to be added by doctor',  -- Prescription
    'Appointment completed on 2025-09-22 at 15:00. Notes: Fever',  -- Notes
    '2025-09-22',  -- Date
    NOW(),  -- Created at
    NOW()   -- Updated at
);

-- Verify the medical record was created
SELECT 'Medical record created successfully:' as info;
SELECT
    id,
    patient_id,
    patient_name,
    doctor_id,
    doctor_name,
    diagnosis,
    prescription,
    notes,
    date,
    created_at
FROM medical_records
WHERE patient_id = 5
ORDER BY created_at DESC;
