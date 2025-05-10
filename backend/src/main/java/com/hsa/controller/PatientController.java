package com.hsa.controller;

import com.hsa.dto.SimpleResponse;
import com.hsa.model.Appointment;
import com.hsa.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/{patientId}/appointments")
    @PreAuthorize("hasRole('PATIENT') and @securityService.isPatientAuthorized(#patientId)")
    public ResponseEntity<List<Appointment>> getPatientAppointments(
            @PathVariable String patientId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(patientService.getPatientAppointments(patientId, status));
    }

    @PostMapping("/{patientId}/appointments")
    @PreAuthorize("hasRole('PATIENT') and @securityService.isPatientAuthorized(#patientId)")
    public ResponseEntity<Appointment> createAppointment(
            @PathVariable String patientId,
            @RequestBody Appointment appointment) {
        return ResponseEntity.ok(patientService.createAppointment(patientId, appointment));
    }

    @GetMapping("/{patientId}/medical-records")
    @PreAuthorize("hasRole('PATIENT') and @securityService.isPatientAuthorized(#patientId)")
    public ResponseEntity<?> getPatientMedicalRecords(
            @PathVariable String patientId) {
        return ResponseEntity.ok(patientService.getPatientMedicalRecords(patientId));
    }

    @GetMapping("/{patientId}/notifications")
    @PreAuthorize("hasRole('PATIENT') and @securityService.isPatientAuthorized(#patientId)")
    public ResponseEntity<?> getPatientNotifications(
            @PathVariable String patientId) {
        return ResponseEntity.ok(patientService.getPatientNotifications(patientId));
    }

    @PutMapping("/notifications/{notificationId}/read")
    @PreAuthorize("hasRole('PATIENT') and @securityService.isNotificationRecipientAuthorized(#notificationId)")
    public ResponseEntity<SimpleResponse> markNotificationAsRead(
            @PathVariable Long notificationId) {
        patientService.markNotificationAsRead(notificationId);
        return ResponseEntity.ok(new SimpleResponse(true, "Notification marked as read"));
    }

    @PutMapping("/appointments/{appointmentId}/cancel")
    @PreAuthorize("hasRole('PATIENT') and @securityService.isAppointmentPatientAuthorized(#appointmentId)")
    public ResponseEntity<Appointment> cancelAppointment(
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(patientService.cancelAppointment(appointmentId));
    }
} 