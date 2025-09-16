package com.hsa.controller;

import com.hsa.model.Appointment;
import com.hsa.model.Doctor;
import com.hsa.model.Patient;
import com.hsa.repository.AppointmentRepository;
import com.hsa.repository.DoctorRepository;
import com.hsa.repository.PatientRepository;
import com.hsa.dto.AppointmentBookingRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @PostMapping("/book")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody AppointmentBookingRequest request) {
        try {
            // Validate doctor exists
            Optional<Doctor> doctorOpt = doctorRepository.findById(request.getDoctorId());
            if (!doctorOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }

            // Validate patient exists
            Optional<Patient> patientOpt = patientRepository.findById(Long.parseLong(request.getPatientId()));
            if (!patientOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }

            // Create new appointment
            Appointment appointment = new Appointment();
            appointment.setPatientId(request.getPatientId());
            appointment.setDoctorId(request.getDoctorId());
            appointment.setAppointmentDate(request.getAppointmentDate());
            appointment.setAppointmentTime(request.getAppointmentTime());
            appointment.setAppointmentType(request.getAppointmentType());
            appointment.setNotes(request.getNotes());
            appointment.setStatus(Appointment.AppointmentStatus.PENDING);
            appointment.setCreatedAt(LocalDate.now());

            Appointment savedAppointment = appointmentRepository.save(appointment);
            return ResponseEntity.ok(savedAppointment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable String patientId) {
        try {
            List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable String doctorId) {
        try {
            List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{appointmentId}/status")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestParam Appointment.AppointmentStatus status) {
        try {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
            if (!appointmentOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(status);

            Appointment updatedAppointment = appointmentRepository.save(appointment);
            return ResponseEntity.ok(updatedAppointment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long appointmentId) {
        try {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
            if (!appointmentOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
            appointmentRepository.save(appointment);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/doctor/{doctorId}/availability")
    public ResponseEntity<List<String>> getDoctorAvailability(
            @PathVariable String doctorId,
            @RequestParam String date) {
        try {
            LocalDate appointmentDate = LocalDate.parse(date);
            
            // Get existing appointments for this doctor on this date
            List<Appointment> existingAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentDate(doctorId, appointmentDate);
            
            // Generate available time slots (this is simplified - in real app would be more complex)
            List<String> availableSlots = generateAvailableTimeSlots(existingAppointments);
            
            return ResponseEntity.ok(availableSlots);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private List<String> generateAvailableTimeSlots(List<Appointment> existingAppointments) {
        // Simplified time slot generation
        List<String> allSlots = List.of(
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
        );
        
        List<String> bookedSlots = existingAppointments.stream()
            .map(app -> app.getAppointmentTime().toString().substring(0, 5))
            .toList();
        
        return allSlots.stream()
            .filter(slot -> !bookedSlots.contains(slot))
            .toList();
    }
}
