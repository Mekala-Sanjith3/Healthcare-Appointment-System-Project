package com.hsa.controller;

import com.hsa.dto.AvailabilityDTO;
import com.hsa.dto.DoctorProfileDTO;
import com.hsa.dto.PatientHistoryDTO;
import com.hsa.dto.SimpleResponse;
import com.hsa.model.Appointment;
import com.hsa.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/{doctorId}/profile")
    @PreAuthorize("hasRole('DOCTOR') and @securityService.isDoctorAuthorized(#doctorId)")
    public ResponseEntity<DoctorProfileDTO> getDoctorProfile(@PathVariable String doctorId) {
        return ResponseEntity.ok(doctorService.getDoctorProfile(doctorId));
    }

    @PutMapping("/{doctorId}/profile")
    @PreAuthorize("hasRole('DOCTOR') and @securityService.isDoctorAuthorized(#doctorId)")
    public ResponseEntity<DoctorProfileDTO> updateDoctorProfile(
            @PathVariable String doctorId,
            @RequestBody DoctorProfileDTO profileDTO) {
        return ResponseEntity.ok(doctorService.updateDoctorProfile(doctorId, profileDTO));
    }

    @GetMapping("/{doctorId}/appointments")
    @PreAuthorize("hasRole('DOCTOR') and @securityService.isDoctorAuthorized(#doctorId)")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(
            @PathVariable String doctorId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(doctorService.getDoctorAppointments(doctorId, date, status, search));
    }

    @PutMapping("/appointments/{appointmentId}/status")
    @PreAuthorize("hasRole('DOCTOR') and @securityService.isAppointmentDoctorAuthorized(#appointmentId)")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestBody Map<String, String> statusUpdate) {
        String status = statusUpdate.get("status");
        return ResponseEntity.ok(doctorService.updateAppointmentStatus(appointmentId, status));
    }

    @GetMapping("/{doctorId}/availability")
    @PreAuthorize("hasRole('DOCTOR') and @securityService.isDoctorAuthorized(#doctorId)")
    public ResponseEntity<AvailabilityDTO> getDoctorAvailability(@PathVariable String doctorId) {
        return ResponseEntity.ok(doctorService.getDoctorAvailability(doctorId));
    }

    @PutMapping("/{doctorId}/availability")
    @PreAuthorize("hasRole('DOCTOR') and @securityService.isDoctorAuthorized(#doctorId)")
    public ResponseEntity<AvailabilityDTO> updateDoctorAvailability(
            @PathVariable String doctorId,
            @RequestBody AvailabilityDTO availabilityDTO) {
        return ResponseEntity.ok(doctorService.updateDoctorAvailability(doctorId, availabilityDTO));
    }

    @GetMapping("/patients/{patientId}/history")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<PatientHistoryDTO>> getPatientHistory(@PathVariable String patientId) {
        return ResponseEntity.ok(doctorService.getPatientHistory(patientId));
    }

    @GetMapping("/{doctorId}/notifications")
    @PreAuthorize("hasRole('DOCTOR') and @securityService.isDoctorAuthorized(#doctorId)")
    public ResponseEntity<?> getDoctorNotifications(@PathVariable String doctorId) {
        return ResponseEntity.ok(doctorService.getDoctorNotifications(doctorId));
    }

    @PutMapping("/notifications/{notificationId}/read")
    @PreAuthorize("hasRole('DOCTOR') and @securityService.isNotificationRecipientAuthorized(#notificationId)")
    public ResponseEntity<SimpleResponse> markNotificationAsRead(@PathVariable Long notificationId) {
        doctorService.markNotificationAsRead(notificationId);
        return ResponseEntity.ok(new SimpleResponse(true, "Notification marked as read"));
    }
} 