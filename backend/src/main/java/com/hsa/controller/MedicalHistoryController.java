package com.hsa.controller;

import com.hsa.dto.MedicalRecordRequest;
import com.hsa.model.MedicalRecord;
import com.hsa.service.MedicalHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-history")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MedicalHistoryController {

    private final MedicalHistoryService medicalHistoryService;  // Renamed from medicalRecordService

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalRecord> addMedicalRecord(@RequestBody MedicalRecordRequest request) {
        return ResponseEntity.ok(medicalHistoryService.addMedicalRecord(request));  // Method name updated
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<List<MedicalRecord>> getPatientMedicalHistory(@PathVariable Long patientId) {
        return ResponseEntity.ok(medicalHistoryService.getPatientMedicalHistory(patientId));
    }

    @GetMapping("/patient/current")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<MedicalRecord>> getCurrentPatientMedicalHistory() {
        return ResponseEntity.ok(medicalHistoryService.getCurrentPatientMedicalHistory());
    }
}