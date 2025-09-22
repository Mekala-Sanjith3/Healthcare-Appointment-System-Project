-- Fix Medical History - Create Medical Records for Patient Portal
USE healthcare_db;

-- First, let's check what data we have
SELECT 'Current appointments:' as info;
SELECT id, patient_id, patient_name, doctor_id, doctor_name, status, appointment_date, appointment_time, notes 
FROM appointments 
WHERE patient_id = 5;

-- Check if medical records already exist
SELECT 'Existing medical records:' as info;
SELECT id, patient_id, patient_name, doctor_id, doctor_name, diagnosis, date, created_at 
FROM medical_records 
WHERE patient_id = 5;

-- Create medical record for the completed appointment
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
    'Fever Treatment',  -- Diagnosis
    'Paracetamol 500mg twice daily for 3 days',  -- Prescription
    'Patient presented with fever. Temperature was 101°F. Prescribed medication and advised rest. Follow-up in 3 days if symptoms persist.',  -- Notes
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
