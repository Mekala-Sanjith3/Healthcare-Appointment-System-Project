package com.hsa.controller;

import com.hsa.model.MedicalRecord;
import com.hsa.repository.MedicalRecordRepository;
import com.hsa.repository.PatientRepository;
import com.hsa.repository.DoctorRepository;
import com.hsa.dto.MedicalRecordRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Comparator;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MedicalRecordController {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MedicalRecord>> getAllMedicalRecords(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo
    ) {
        try {
            List<MedicalRecord> records = medicalRecordRepository.findAll();

            // Basic in-memory filtering; for large datasets move to repository-specification
            if (search != null && !search.trim().isEmpty()) {
                final String q = search.trim().toLowerCase();
                records = records.stream().filter(r ->
                        (r.getPatientName() != null && r.getPatientName().toLowerCase().contains(q)) ||
                        (r.getDoctorName() != null && r.getDoctorName().toLowerCase().contains(q)) ||
                        (r.getDiagnosis() != null && r.getDiagnosis().toLowerCase().contains(q)) ||
                        (r.getNotes() != null && r.getNotes().toLowerCase().contains(q))
                ).toList();
            }

            if (dateFrom != null && !dateFrom.isBlank()) {
                LocalDate from = LocalDate.parse(dateFrom);
                records = records.stream().filter(r -> r.getDate() == null || !r.getDate().isBefore(from)).toList();
            }
            if (dateTo != null && !dateTo.isBlank()) {
                LocalDate to = LocalDate.parse(dateTo);
                records = records.stream().filter(r -> r.getDate() == null || !r.getDate().isAfter(to)).toList();
            }

            // Sort by date desc then createdAt desc
            records = records.stream()
                    .sorted(Comparator.comparing(MedicalRecord::getDate, Comparator.nullsLast(Comparator.naturalOrder()))
                            .thenComparing(MedicalRecord::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                            .reversed())
                    .toList();

            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<MedicalRecord>> getPatientMedicalRecords(@PathVariable String patientId) {
        try {
            List<MedicalRecord> records = medicalRecordRepository.findByPatientId(Long.parseLong(patientId));
            
            // Populate patient and doctor names if they're null
            for (MedicalRecord record : records) {
                if (record.getPatientName() == null && record.getPatientId() != null) {
                    // This would require PatientRepository injection, but for now we'll return as is
                    // The names should be populated when the record is created
                }
                if (record.getDoctorName() == null && record.getDoctorId() != null) {
                    // This would require DoctorRepository injection, but for now we'll return as is
                    // The names should be populated when the record is created
                }
            }
            
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
            record.setPatientId(Long.parseLong(request.getPatientId()));
            record.setDoctorId(request.getDoctorId());
            record.setDiagnosis(request.getDiagnosis());
            record.setPrescription(request.getPrescription());
            record.setNotes(request.getNotes());
            record.setDate(request.getRecordDate());
            record.setCreatedAt(LocalDate.now());

            // Populate names from repositories for display convenience
            try {
                patientRepository.findById(record.getPatientId()).ifPresent(p -> record.setPatientName(p.getName()));
            } catch (Exception ignored) {}
            try {
                doctorRepository.findById(request.getDoctorId()).ifPresent(d -> record.setDoctorName(d.getName()));
            } catch (Exception ignored) {}

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
