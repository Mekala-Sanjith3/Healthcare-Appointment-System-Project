package com.hsa.controller;

import com.hsa.model.MedicalRecord;
import com.hsa.repository.MedicalRecordRepository;
import com.hsa.dto.MedicalRecordRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MedicalRecordController {

    private final MedicalRecordRepository medicalRecordRepository;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<MedicalRecord>> getPatientMedicalRecords(@PathVariable String patientId) {
        try {
            List<MedicalRecord> records = medicalRecordRepository.findByPatientId(patientId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<MedicalRecord> createMedicalRecord(@RequestBody MedicalRecordRequest request) {
        try {
            MedicalRecord record = new MedicalRecord();
            record.setPatientId(request.getPatientId());
            record.setDoctorId(request.getDoctorId());
            record.setDiagnosis(request.getDiagnosis());
            record.setPrescription(request.getPrescription());
            record.setNotes(request.getNotes());
            record.setDate(request.getRecordDate());
            record.setCreatedAt(LocalDate.now());

            MedicalRecord savedRecord = medicalRecordRepository.save(record);
            return ResponseEntity.ok(savedRecord);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{recordId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<MedicalRecord> getMedicalRecord(@PathVariable Long recordId) {
        try {
            Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(recordId);
            if (!recordOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(recordOpt.get());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{recordId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<MedicalRecord> updateMedicalRecord(
            @PathVariable Long recordId,
            @RequestBody MedicalRecordRequest request) {
        try {
            Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(recordId);
            if (!recordOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            MedicalRecord record = recordOpt.get();
            record.setDiagnosis(request.getDiagnosis());
            record.setPrescription(request.getPrescription());
            record.setNotes(request.getNotes());
            record.setDate(request.getRecordDate());
            record.setUpdatedAt(LocalDate.now());

            MedicalRecord updatedRecord = medicalRecordRepository.save(record);
            return ResponseEntity.ok(updatedRecord);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
