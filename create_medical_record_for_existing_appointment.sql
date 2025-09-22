-- Create medical record for existing completed appointment
USE healthcare_db;

-- Insert medical record for the completed appointment
INSERT INTO medical_records (patient_id, patient_name, doctor_id, doctor_name, diagnosis, prescription, notes, date, created_at, updated_at)
SELECT
    a.patient_id,
    (SELECT name FROM patients WHERE id = a.patient_id) as patient_name,
    a.doctor_id,
    (SELECT name FROM doctors WHERE id = a.doctor_id) as doctor_name,
    'Appointment Completed' as diagnosis,
    'Prescription details to be added by doctor' as prescription,
    CONCAT('Appointment completed on ', a.appointment_date, ' at ', a.appointment_time, '. Notes: ', COALESCE(a.notes, 'No additional notes.')) as notes,
    a.appointment_date as date,
    NOW() as created_at,
    NOW() as updated_at
FROM appointments a
WHERE a.status = 'COMPLETED'
AND a.patient_id = 5  -- Ganesh Mannava's patient ID
AND NOT EXISTS (
    SELECT 1 FROM medical_records mr 
    WHERE mr.patient_id = a.patient_id 
    AND mr.doctor_id = a.doctor_id 
    AND mr.date = a.appointment_date
);

-- Verify the medical record was created
SELECT 'Medical record created for completed appointment:' as info;
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
