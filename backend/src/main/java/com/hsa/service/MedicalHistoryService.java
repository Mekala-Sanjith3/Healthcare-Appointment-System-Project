package com.hsa.service;

import com.hsa.dto.MedicalRecordRequest;
import com.hsa.model.MedicalRecord;
import com.hsa.model.Patient;
import com.hsa.repository.MedicalRecordRepository;
import com.hsa.repository.PatientRepository;  
import com.hsa.security.SecurityUtils;
import com.hsa.exception.ResourceNotFoundException;  
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;  
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalHistoryService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;  // Add this field
    private final SecurityUtils securityUtils;

    public MedicalRecord addMedicalRecord(MedicalRecordRequest request) {
        MedicalRecord record = MedicalRecord.builder()
            .doctor(securityUtils.getCurrentDoctor())
            .patient(patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found")))
            .diagnosis(request.getDiagnosis())
            .treatment(request.getTreatment())
            .prescription(request.getPrescription())
            .notes(request.getNotes())
            .recordDate(LocalDateTime.now())
            .build();
            
        return medicalRecordRepository.save(record);
    }

    public List<MedicalRecord> getPatientMedicalHistory(Long patientId) {
        if (securityUtils.isCurrentUserPatient()) {
            Patient currentPatient = securityUtils.getCurrentPatient();
            if (!currentPatient.getId().equals(patientId)) {
                throw new RuntimeException("Access denied");
            }
        }
        return medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId);
    }

    public List<MedicalRecord> getCurrentPatientMedicalHistory() {
        Patient patient = securityUtils.getCurrentPatient();
        return medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patient.getId());
    }
}