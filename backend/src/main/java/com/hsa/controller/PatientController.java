package com.hsa.controller;

import com.hsa.model.Patient;
import com.hsa.model.Appointment;
import com.hsa.model.MedicalRecord;
import com.hsa.repository.PatientRepository;
import com.hsa.repository.AppointmentRepository;
import com.hsa.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    @GetMapping("/{patientId}/appointments")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable String patientId) {
        try {
            List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{patientId}/medical-records")
    public ResponseEntity<List<MedicalRecord>> getPatientMedicalRecords(@PathVariable String patientId) {
        try {
            List<MedicalRecord> records = medicalRecordRepository.findByPatientId(patientId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{patientId}/profile")
    public ResponseEntity<Patient> getPatientProfile(@PathVariable String patientId) {
        try {
            Patient patient = patientRepository.findById(Long.parseLong(patientId)).orElse(null);
            if (patient == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(patient);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{patientId}/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getPatientDashboardStats(@PathVariable String patientId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Get appointments for this patient
            List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
            
            // Calculate statistics
            long totalAppointments = appointments.size();
            long upcomingAppointments = appointments.stream()
                .filter(app -> app.getStatus() == Appointment.AppointmentStatus.CONFIRMED || 
                              app.getStatus() == Appointment.AppointmentStatus.PENDING)
                .count();
            long completedAppointments = appointments.stream()
                .filter(app -> app.getStatus() == Appointment.AppointmentStatus.COMPLETED)
                .count();
            
            // Get medical records count
            List<MedicalRecord> medicalRecords = medicalRecordRepository.findByPatientId(patientId);
            long totalMedicalRecords = medicalRecords.size();
            
            stats.put("totalAppointments", totalAppointments);
            stats.put("upcomingAppointments", upcomingAppointments);
            stats.put("completedAppointments", completedAppointments);
            stats.put("totalMedicalRecords", totalMedicalRecords);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}