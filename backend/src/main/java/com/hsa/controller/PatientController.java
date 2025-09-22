package com.hsa.controller;

import com.hsa.model.Patient;
import com.hsa.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping("/{patientId}/profile")
    public ResponseEntity<Patient> getPatientProfile(@PathVariable Long patientId) {
        try {
            Patient patient = patientRepository.findById(patientId).orElse(null);
            if (patient == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(patient);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{patientId}/appointments")
    public ResponseEntity<?> getPatientAppointments(@PathVariable Long patientId) {
        try {
            // For now, return empty array - appointments will be implemented later
            return ResponseEntity.ok(new Object[]{});
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{patientId}/medical-records")
    public ResponseEntity<?> getPatientMedicalRecords(@PathVariable Long patientId) {
        try {
            // For now, return empty array - medical records will be implemented later
            return ResponseEntity.ok(new Object[]{});
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{patientId}/dashboard/stats")
    public ResponseEntity<?> getPatientDashboardStats(@PathVariable Long patientId) {
        try {
            // For now, return basic stats - will be implemented later
            return ResponseEntity.ok(new Object[]{});
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}