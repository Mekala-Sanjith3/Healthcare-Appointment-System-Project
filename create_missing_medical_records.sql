-- Create medical records for existing completed appointments that don't have records
USE healthcare_db;

-- Insert medical records for completed appointments that don't have corresponding medical records
INSERT INTO medical_records (patient_id, patient_name, doctor_id, doctor_name, diagnosis, prescription, notes, date, created_at)
SELECT 
    a.patient_id,
    a.patient_name,
    a.doctor_id,
    a.doctor_name,
    'Appointment Completed' as diagnosis,
    'Prescription details to be added by doctor' as prescription,
    CONCAT('Appointment completed on ', a.appointment_date, ' at ', a.appointment_time, '. Notes: ', COALESCE(a.notes, 'No additional notes.')) as notes,
    a.appointment_date as date,
    NOW() as created_at
FROM appointments a
LEFT JOIN medical_records mr ON a.patient_id = mr.patient_id AND a.doctor_id = mr.doctor_id AND a.appointment_date = mr.date
WHERE a.status = 'COMPLETED' 
AND mr.id IS NULL
AND a.patient_name IS NOT NULL 
AND a.doctor_name IS NOT NULL;

-- Verify the fix
SELECT 'Medical records created:' as info;
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
ORDER BY created_at DESC
LIMIT 10;
