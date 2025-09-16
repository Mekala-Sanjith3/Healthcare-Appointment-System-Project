package com.hsa.controller;

import com.hsa.model.Doctor;
import com.hsa.model.Appointment;
import com.hsa.model.Patient;
import com.hsa.repository.DoctorRepository;
import com.hsa.repository.AppointmentRepository;
import com.hsa.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;

    @GetMapping("/{doctorId}/appointments")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable String doctorId) {
        try {
            List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{doctorId}/patients")
    public ResponseEntity<List<Patient>> getDoctorPatients(@PathVariable String doctorId) {
        try {
            // Get all appointments for this doctor
            List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
            
            // Extract unique patient IDs
            List<String> patientIds = appointments.stream()
                .map(Appointment::getPatientId)
                .distinct()
                .collect(Collectors.toList());
            
            // Get patient details
            List<Patient> patients = patientIds.stream()
                .map(patientId -> {
                    try {
                        return patientRepository.findById(Long.parseLong(patientId)).orElse(null);
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(patient -> patient != null)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{doctorId}/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDoctorDashboardStats(@PathVariable String doctorId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Get appointments for this doctor
            List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
            
            // Calculate statistics
            long totalAppointments = appointments.size();
            long pendingAppointments = appointments.stream()
                .filter(app -> app.getStatus() == Appointment.AppointmentStatus.PENDING)
                .count();
            long confirmedAppointments = appointments.stream()
                .filter(app -> app.getStatus() == Appointment.AppointmentStatus.CONFIRMED)
                .count();
            long completedAppointments = appointments.stream()
                .filter(app -> app.getStatus() == Appointment.AppointmentStatus.COMPLETED)
                .count();
            
            // Get unique patients count
            long totalPatients = appointments.stream()
                .map(Appointment::getPatientId)
                .distinct()
                .count();
            
            stats.put("totalAppointments", totalAppointments);
            stats.put("pendingAppointments", pendingAppointments);
            stats.put("confirmedAppointments", confirmedAppointments);
            stats.put("completedAppointments", completedAppointments);
            stats.put("totalPatients", totalPatients);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{doctorId}/profile")
    public ResponseEntity<Doctor> getDoctorProfile(@PathVariable String doctorId) {
        try {
            Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
            if (doctor == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(doctor);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}