package com.hsa.service;

import com.hsa.dto.MedicalRecordRequest;
import com.hsa.model.MedicalRecord;
import com.hsa.model.Doctor;
import com.hsa.model.Patient;
import com.hsa.repository.MedicalRecordRepository;
import com.hsa.repository.PatientRepository;
import com.hsa.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final SecurityUtils securityUtils;

    public MedicalRecord createMedicalRecord(MedicalRecordRequest request) {
        Doctor doctor = securityUtils.getCurrentDoctor();
        Patient patient = patientRepository.findById(request.getPatientId())
            .orElseThrow(() -> new RuntimeException("Patient not found"));

        MedicalRecord record = MedicalRecord.builder()
            .patient(patient)
            .doctor(doctor)
            .recordDate(LocalDateTime.now())
            .diagnosis(request.getDiagnosis())
            .treatment(request.getTreatment())
            .prescription(request.getPrescription())
            .notes(request.getNotes())
            .attachments(request.getAttachments())
            .build();

        return medicalRecordRepository.save(record);
    }

    public List<MedicalRecord> getPatientMedicalHistory(Long patientId) {
        // Add security check for patient or doctor access
        if (securityUtils.isCurrentUserPatient()) {
            Patient currentPatient = securityUtils.getCurrentPatient();
            if (!currentPatient.getId().equals(patientId)) {
                throw new RuntimeException("Access denied");
            }
        }
        return medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId);
    }

    public List<MedicalRecord> getDoctorMedicalRecords() {
        Doctor doctor = securityUtils.getCurrentDoctor();
        return medicalRecordRepository.findByDoctorIdOrderByRecordDateDesc(doctor.getId());
    }
}